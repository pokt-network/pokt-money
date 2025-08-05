import type { Plugin, ScriptableContext } from 'chart.js'
import useMediaQuery from '@/hooks/useMediaQuery'
import { Chart } from 'react-chartjs-2'

interface Options {
  needleBorderColor: string
  needleColor: string
  needleMoveToYCoordinate?: number
  needleBorderMoveToYCoordinate?: number
  lineToXFactor?: number
  needleAngleOffset?: number
  needleYOffset?: number
}

export const gaugeNeedle: Plugin<'doughnut'> = {
  id: 'gaugeNeedle',
  afterDatasetDraw: (chart, args, options) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const needleValue = chart.config.data.datasets[0].needleValue
    // const needleValue = 1e6
    if (needleValue) {
      const {
        needleBorderColor,
        needleColor,
        needleMoveToYCoordinate = 6,
        needleBorderMoveToYCoordinate = 6.3,
        lineToXFactor = -80,
        needleAngleOffset = 0,
        needleYOffset = 30,
      } = options as unknown as Options
      const dataTotal = chart.config.data.datasets[0].data.reduce(
        (a: number, b: number) => a + b,
        0
      ) as number

      const angle = Math.PI + (1 / dataTotal) * needleValue * Math.PI - needleAngleOffset

      const ctx = chart.ctx
      const cw = chart.canvas.offsetWidth
      const ch = chart.canvas.offsetHeight
      const cx = cw / 2 - 2
      const cy = chart.getDatasetMeta(0).data[0].y + needleYOffset

      ctx.translate(cx, cy)
      ctx.rotate(angle)

      ctx.beginPath()
      ctx.moveTo(0, -needleMoveToYCoordinate)
      ctx.lineTo(ch - lineToXFactor, 0)
      ctx.lineTo(0, needleMoveToYCoordinate)
      ctx.fillStyle = needleColor
      ctx.fill()
      ctx.strokeStyle = needleBorderColor
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(1, -needleBorderMoveToYCoordinate)
      ctx.lineTo(-7, 0)
      ctx.lineTo(1, needleBorderMoveToYCoordinate)
      ctx.fillStyle = needleColor
      ctx.fill()
      ctx.strokeStyle = needleBorderColor
      ctx.stroke()

      ctx.rotate(-angle)
      ctx.translate(-cx, -cy)
    }
  },
}

export interface GradientProps {
  x0?: number
  x1?: number
  y0?: number
  y1?: number
  colors: Array<{
    offset: number
    color: string
  }>
}

export interface GaugeChartProps {
  needleValue: number
  indexNeedle?: number
  data: number[]
  gradient: GradientProps
}

export default function GaugeChart({
  needleValue,
  indexNeedle,
  data,
  gradient,
}: GaugeChartProps) {
  const isSmOrLess = useMediaQuery('(max-width: 900px)')
  const isXlOrMore = useMediaQuery('(min-width: 1280px)')

  const borderColor = '#101014'

  const chartData = {
    datasets: [
      {
        data,
        backgroundColor: (ctx: ScriptableContext<'doughnut'>) => {
          if (ctx.dataIndex === indexNeedle) {
            const width = ctx.chart.width
            const { x0 = 0, x1 = width, y0 = 0, y1 = 0, colors } = gradient
            const gradientSegment = ctx.chart.ctx.createLinearGradient(x0, y0, x1, y1)

            for (const { offset, color } of colors) {
              gradientSegment.addColorStop(offset, color)
            }

            return gradientSegment
          }
          return borderColor
        },
        borderColor: borderColor,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        needleValue,
        borderRadius: 1000,
        borderWidth: 6,
        circumference: 190,
        rotation: 265,
        cutout: '85%',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    // to disable hover
    events: [],
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      gaugeNeedle: {
        needleBorderColor: '#FFF',
        needleColor: '#7B7B7B',
        lineToXFactor: isSmOrLess ? 75 : isXlOrMore ? 80 : 90,
        needleMoveToYCoordinate: isSmOrLess ? 3 : 6,
        needleBorderMoveToYCoordinate: isSmOrLess ? 3.3 : 6.3,
        needleAngleOffset: 0,
        needleYOffset: isSmOrLess ? 10 : 12,
      },
    },
  }

  return (
    <>
      <Chart
        type={'doughnut'}
        data={chartData}
        style={{
          minHeight: '100%',
          maxHeight: '100%',
          minWidth: '100%',
          maxWidth: '100%',
          position: 'absolute',
          zIndex: 2,
        }}
        options={chartOptions}
        plugins={[gaugeNeedle]}
      />
      <Chart
        redraw={true}
        type={'doughnut'}
        data={{
          datasets: [
            {
              data: [1],
              backgroundColor: borderColor,
              borderColor: borderColor,
              borderRadius: 1000,
              borderWidth: 6,
              circumference: 190,
              rotation: 265,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              cutout: '85%',
            },
          ],
        }}
        style={{
          minHeight: '100%',
          maxHeight: '100%',
          minWidth: '100%',
          maxWidth: '100%',
          position: 'absolute',
          zIndex: 1,
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          // to disable hover
          events: [],
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: false,
            },
          },
        }}
      />
    </>
  )
}
