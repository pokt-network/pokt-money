'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { statusQuery } from '@/api/operations'

interface HeightContext {
  currentHeight: number
  networkHeight: number
  updateNetworkHeight: () => void
  firstHeight: number
  blocksPerSession: number
  currentTime: string
}

const HeightContext = createContext<HeightContext>({
  currentHeight: 0,
  networkHeight: 0,
  firstHeight: 0,
  blocksPerSession: 0,
  currentTime: '',
  updateNetworkHeight: () => {}
});

interface HeightContextProviderProps {
  children: React.ReactNode
  firstHeight: number
  networkHeight: number
  firstTime: string
  blocksPerSession: number
}

export default function HeightContextProvider({
  children,
  networkHeight: initialNetworkHeight,
  firstHeight,
  firstTime,
  blocksPerSession
}: HeightContextProviderProps) {
  const [networkHeight, setNetworkHeight] = useState(initialNetworkHeight)
  const [{currentHeight, currentTime}, setState] = useState({
    currentHeight: Number(firstHeight),
    currentTime: firstTime,
  })

  const {data, refetch} = useQuery(statusQuery, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    pollInterval: 15 * 1000,
  })

  const updateNetworkHeight = () => {
    refetch()
  }

  useEffect(() => {
    const block = data?.blocks?.nodes[0]
    const newBlockId = Number(block?.id)

    if (block && newBlockId > currentHeight) {
      setState({
        currentHeight: newBlockId,
        currentTime: block.timestamp || currentTime,
      })

      if (newBlockId > networkHeight) {
        setNetworkHeight(newBlockId)
      }
    }

    const targetHeight = data?._metadata?.targetHeight
    if (targetHeight && Number(targetHeight) > networkHeight) {
      setNetworkHeight(Number(targetHeight))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return (
    <HeightContext.Provider
      value={{
        currentHeight,
        currentTime,
        networkHeight,
        firstHeight,
        blocksPerSession,
        updateNetworkHeight,
      }}
    >
      {children}
    </HeightContext.Provider>
  )
}

export function useHeightContext() {
  return useContext(HeightContext)
}
