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
        className={'h-[80px] sticky bg-[color:--main-background] px-5 z-[1023] top-0 flex flex-row items-center justify-between'}
      >
        <div className={'w-full flex items-center justify-center'}>
          <div className={'max-w-[1400px] w-full  h-full flex lg:items-center pt-1 lg:pt-0 lg:justify-between gap-1 lg:gap-2 flex-col lg:flex-row'}>

            <div className={'flex w-full h-full items-center gap-2 justify-between'}>
              <div className={'flex w-full h-full items-center gap-[30px]'}>
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
