import { unstable_cache } from 'next/cache'
import { cache } from 'react'

export interface Price {
  usd: number
  usd_market_cap: number
  usd_24h_change: number
}

// We are using unstable_cache here because we want to cache the response for 60 seconds
// and React.cache to only make one request per page render
const getPrice = cache(unstable_cache(async (): Promise<Price> => {
    return await fetchPrice();
  },
  ['price'],
  {
    revalidate: 30
  }))

export async function fetchPrice(): Promise<Price> {
  return fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=pocket-network&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
    {
      next: {revalidate: 30},
    }
  )
    .then((res) =>
      res.json()
        .then((res) => res['pocket-network'] )
    )
}

export default getPrice;
