import PoktscanLogo from '@/Footer/poktscan_small_logo.svg'

export default function Footer() {
  return (
    <div
      className={'flex flex-row items-center justify-center w-full h-[70px] gap-[5px]'}
    >
      <PoktscanLogo className={'h-4 w-4'} />
      <div
        className={'flex flex-row items-center gap-[3px] text-xs tracking-[0.5px] [&_p]:text-[color:var(--secondary-v2-foreground)] [&_a]:text-blue-300 [&_a]:underline [&_a]:underline-offset-2'}
      >
        <p>
          Data provided by
        </p>
        <a
          href={'https://poktscan.com'}
          target={'_blank'}
        >
          POKTscan.com
        </a>
        <p>
          |
        </p>
        <a
          href={'https://discord.com/channels/854406364931686400/1118196563479638056'}
          target={'_blank'}
        >
          Contact
        </a>
      </div>
    </div>
  )
}
