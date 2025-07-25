import millify from 'millify'
import Big from 'big.js'

export function convertUpoktToPokt(upokt: number | string ) {
  return new Big(upokt).div(1e6)
}

function toScientificNotation(num: number): string {
  if (num === 0) return "0";

  const exponent = Math.floor(Math.log10(Math.abs(num)));
  const mantissa = num / Math.pow(10, exponent);

  return `${mantissa.toFixed(6)}e${exponent}`;
}

export function formatSimpleAmount(amount: FormatAmountProps['amount']) {
  return formatAmount({
    amount,
  })
}

export function formatUpokt(props: Omit<FormatAmountProps, 'denom'> & {denom?: 'upokt'}) {
  return formatAmount({
    ...props,
    denom: 'upokt'
  })
}

interface FormatAmountProps {
  amount: number | string | bigint | Big,
  denom?: 'upokt' | string | null,
  includeSymbol?:boolean
  abbreviateThreshold?: number
  maxDecimals?: number
}

export function formatAmount({
  amount,
  denom,
  includeSymbol = true,
  abbreviateThreshold = 1e8,
  maxDecimals = 6,
}: FormatAmountProps) {
  if (!amount) {
    return '0'
  }

  let amountBig: Big, symbol = ''

  try {
    if (denom === 'upokt') {
      symbol = 'POKT'
      amountBig = convertUpoktToPokt(amount.toString())
    } else {
      symbol = denom || ''
      amountBig = new Big(amount.toString())
    }
  } catch {
    amountBig = new Big(0)
  }

  let amountString: string

  if (abbreviateThreshold && amountBig.gte(abbreviateThreshold)) {
    if (amountBig.lte(Number.MAX_SAFE_INTEGER)) {
      amountString = millify(amountBig.toNumber())
    } else {
      amountString = toScientificNotation(amountBig.toNumber())
    }
  } else {
    amountString = Number(amountBig.toNumber().toFixed(maxDecimals)).toLocaleString(undefined, {
      maximumFractionDigits: maxDecimals,
    })
  }

  return symbol && includeSymbol ? `${amountString} ${symbol}` : amountString
}
