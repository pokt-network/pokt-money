import PocketLogo from '@/AppBar/assets/pocket_logo_white.svg'
import Price from '@/AppBar/Price'
import TimeSelector from '@/AppBar/TimeSelector'
import { Times } from '@/utils/dates'

interface AppBarProps {
  selectedTime: Times
}

export default function AppBar({selectedTime}: AppBarProps) {
  return (
    <>
      <section
        className={'min-h-[110px] h-auto sm:h-[110px] md:min-h-[80px] md:h-[80px] sticky bg-[color:var(--main-background)] px-2 md:px-5 z-[1023] py-[15px] md:py-5 top-0 flex flex-row items-center justify-between'}
      >
        <div className={'w-full flex items-center justify-center'}>
          <div className={'max-w-[1400px] w-full h-full flex lg:items-center pt-1 lg:pt-0 lg:justify-between gap-1 lg:gap-2 flex-col lg:flex-row'}>

            <div className={'flex w-full h-full items-center gap-2 justify-between flex-col md:flex-row'}>
              <div className={'flex w-full h-full items-center gap-x-[30px] gap-y-2 justify-between md:justify-start flex-wrap'}>
                <PocketLogo className={'h-10'} />
                <Price />
              </div>

              <TimeSelector selectedTime={selectedTime} />
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
