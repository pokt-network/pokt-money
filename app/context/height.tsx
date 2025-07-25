'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useLazyQuery, useSubscription } from '@apollo/client'
import { subscriptionQuery, indexerMetadataDocument } from '@/api/operations'

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

  useSubscription(subscriptionQuery, {
    ignoreResults: true,
    onData: (data) => {
      const block = data?.data?.data?.blocks
      const newBlockId = Number(block?.id)
      if (block && newBlockId > currentHeight) {
        setState({
          currentHeight: newBlockId,
          currentTime: block._entity?.timestamp || currentTime,
        })

        if (newBlockId > networkHeight) {
          setNetworkHeight(newBlockId)
        }
      }
    }
  })

  const [fetchIndexerMetadata] = useLazyQuery(indexerMetadataDocument, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
  })

  const updateNetworkHeight = useCallback(() => {
    fetchIndexerMetadata().then((res) => {
      const targetHeight = res?.data?._metadata?.targetHeight

      if (targetHeight) {
        setNetworkHeight(Number(targetHeight))
      }
    })
  }, [fetchIndexerMetadata])


  useEffect(() => {
    const interval = setInterval(updateNetworkHeight, 5 * 1000)

    return () => clearInterval(interval)
  }, [currentHeight, updateNetworkHeight])

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
