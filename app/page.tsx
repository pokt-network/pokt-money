import AppBar from '@/AppBar/AppBar'
import { Times } from '@/utils/dates'
import { cookies } from 'next/headers'
import { timeKey } from '@/constants'
import MonetaryBase from '@/MonetaryBase'
import CurrentSupply from '@/Supply/Current'
import ChangesSupplyMintBurn from '@/Supply/Changes'
import Projections from '@/Projection'

interface HomeProps {
  selectedTime: Times
}

function Home({selectedTime}: HomeProps) {
  return (
    <div className={'flex flex-col gap-4 w-full'}>
      <div className={'flex flex-col xl:flex-row gap-4 w-full'}>
        <MonetaryBase selectedTime={selectedTime} />
        <div className={'flex flex-col min-[900px]:flex-row xl:flex-col gap-4 w-full xl:w-1/3'}>
          <ChangesSupplyMintBurn selectedTime={selectedTime} />
          <CurrentSupply selectedTime={selectedTime} />
        </div>
      </div>
      <Projections timeSelected={selectedTime} />
    </div>
  )
}

export default async function Page({searchParams}: {searchParams: Promise<Record<string, string | Array<string> | undefined>>}) {
  const [
    awaitedSearchParams,
    awaitedCookies,
  ] = await Promise.all([
    searchParams,
    cookies()
  ])
  let selectedTime = Times.Last7d

  const timeFromSearchParams = awaitedSearchParams[timeKey]
  const timeFromCookies = awaitedCookies.get(timeKey)?.value
  if (typeof timeFromSearchParams === 'string' && Object.values(Times).includes(timeFromSearchParams as Times)) {
    selectedTime = timeFromSearchParams as Times
  } else if (timeFromCookies && Object.values(Times).includes(timeFromCookies as Times)) {
    selectedTime = timeFromCookies as Times
  }

  return (
    <>
      <AppBar selectedTime={selectedTime} />
      <div className={'px-2 md:px-5 w-full h-full flex items-center justify-center overflow-x-hidden'}>
        <div className={'max-w-[1400px] w-full'} id={'content-container'}>
          <Home selectedTime={selectedTime} />
        </div>
      </div>
    </>
  )
}
