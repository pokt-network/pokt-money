'use client'

import {useQuery} from '@tanstack/react-query'
import { fetchPrice, Price } from '@/api/price'

export default function usePrice(): Price {
  const { data } = useQuery({
    queryKey: ["price"],
    queryFn: fetchPrice,
    staleTime: Infinity, // Avoids initial refetch
    refetchInterval: 60000, // Fetch every minute
  });

  return data! || {}
}
