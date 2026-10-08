'use client'

import { useHeightContext } from '@/context/height'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLazyQuery } from '@apollo/client'

export type DeepRequired<T> = NonNullable<{
  [K in keyof T]-?: T[K] extends object
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    ? T[K] extends Function
      ? T[K]
      : DeepRequired<NonNullable<T[K]>>
    : NonNullable<T[K]>;
}>;

// eslint-disable-next-line
export type DocumentNodeData<T extends TypedDocumentNode<any, any>> = T extends TypedDocumentNode<infer Data, any> ? Data : never;

// eslint-disable-next-line
export type ExtractVariables<T> = T extends TypedDocumentNode<any, infer Variables> ? Variables : never;

export type FetchOnBlockFetcher<Variables, Data> = (variables: Variables) => Promise<{ data?: Data | null, error?: unknown }>

export interface FetchOnBlockCoreOptions<Variables, Data, R = Data> {
  fetcher: FetchOnBlockFetcher<Variables, Data>
  variables?:
    | Variables
    | ((currentHeight: number, currentTime: string) => Variables)
  resultParser?: (result: DeepRequired<Data>) => R | Promise<R>,
  initialResult?: R,
  initialError: boolean
  skip?: boolean,
  pollInterval?: number
  updateOnNewSession?: boolean
}

export interface FetchOnBlockOptions<
  // eslint-disable-next-line
  T extends TypedDocumentNode<any, any>,
  R = DocumentNodeData<T>
> extends Omit<FetchOnBlockCoreOptions<ExtractVariables<T>, DocumentNodeData<T>, R>, 'fetcher'> {
  query: T
}

export interface FetchOnBlockResult<R> {
  data: R | null,
  refetch: () => void,
  // Only error will be true when there is an error and there is no data available to return
  error: boolean
  // isLoading will be true when is loading the first data after refetch is executed
  isLoading: boolean,
}

/**
 * Re-runs `fetcher` whenever a new block arrives (or the variables change). Use this directly when
 * the data comes from somewhere other than the indexer's GraphQL API, e.g. one of our own route
 * handlers; `useFetchOnBlock` below is the Apollo-backed variant.
 */
export function useFetchOnBlockCore<Variables, Data, R = Data>({
  fetcher,
  variables,
  resultParser,
  initialResult,
  skip,
  pollInterval,
  initialError,
  updateOnNewSession = false
}: FetchOnBlockCoreOptions<Variables, Data, R>): FetchOnBlockResult<R> {
  const lastValueRef = useRef<R | null>(initialResult || null)
  const [parsedData, setParsedData] = useState<R | null>(initialResult || null)
  const [error, setError] = useState(initialError)
  const [isLoading, setIsLoading] = useState(false)
  const {currentHeight, currentTime, firstHeight, blocksPerSession} = useHeightContext()
  const firstRenderRef = useRef(true)
  const lastVariablesRef = useRef<FetchOnBlockCoreOptions<Variables, Data, R>['variables']>(variables)
  const forceLoadingRef = useRef(false)
  // Only the latest request may set state: an older one (previous time range or block) can resolve later.
  const requestIdRef = useRef(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchDataFunction = useCallback(() => {
    const variablesToUse = (
      typeof variables === 'function'
        ? (variables as (currentHeight: number, currentTime: string) => Variables)(currentHeight, currentTime)
        : variables
    ) as Variables

    const fetchDataFn = () => {
      const requestId = ++requestIdRef.current
      const isLatest = () => requestId === requestIdRef.current

      setIsLoading(true)
      fetcher(variablesToUse).then(async ({data, error}) => {
        if (!isLatest()) return

        if (data) {
          if (resultParser) {
            const parsed = await resultParser(data as DeepRequired<Data>)
            if (!isLatest()) return
            lastValueRef.current = parsed
            setParsedData(parsed)
          } else {
            lastValueRef.current = data as unknown as R
            setParsedData(data as unknown as R)
          }

          setError(false)
        }

        if (error) {
          setError(true)
        }
      })
        .catch(() => {
          if (isLatest()) setError(true)
        })
        .finally(() => {
          if (!isLatest()) return
          setIsLoading(false)
          if (forceLoadingRef.current) {
            forceLoadingRef.current = false
          }
        })
    }

    fetchDataFn()

    if (pollInterval) {
      intervalRef.current = setInterval(fetchDataFn, pollInterval)
    }
  }, [variables, currentHeight, currentTime, resultParser, pollInterval, fetcher])

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }

    if (skip) return

    if (
      (currentHeight !== firstHeight &&
        (
          !updateOnNewSession ||
          !blocksPerSession ||
          ((currentHeight - 1) % blocksPerSession === 0)
        )
      ) ||
      lastVariablesRef.current !== variables
    ) {
      forceLoadingRef.current = lastVariablesRef.current !== variables
      lastVariablesRef.current = variables
      fetchDataFunction()

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
    // eslint-disable-next-line
  }, [currentHeight, fetcher, variables])

  useEffect(() => {
    if (!initialResult && !initialError) {
      fetchDataFunction()
    }
    // eslint-disable-next-line
  }, [])

  const data = parsedData || lastValueRef.current

  return {
    data: (data ? data : initialResult) || null,
    error: data ? false : error,
    isLoading: data && !forceLoadingRef.current ? false : isLoading,
    refetch: fetchDataFunction,
  }
}

export default function useFetchOnBlock<
  // eslint-disable-next-line
  T extends TypedDocumentNode<any, any>,
  R = DocumentNodeData<T>
>({
  query,
  ...options
}: FetchOnBlockOptions<T, R>): FetchOnBlockResult<R> {
  const [fetchData] = useLazyQuery(query, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
  })

  const fetcher = useCallback<FetchOnBlockFetcher<ExtractVariables<T>, DocumentNodeData<T>>>(
    (variables) => fetchData({ variables }),
    [fetchData]
  )

  return useFetchOnBlockCore<ExtractVariables<T>, DocumentNodeData<T>, R>({
    ...options,
    fetcher,
  })
}
