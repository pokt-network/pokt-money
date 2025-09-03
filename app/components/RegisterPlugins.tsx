'use client'
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  BarController,
  Filler,
  Legend,
  PointElement,
  Tooltip,
  ArcElement,
  LineController,
  Title,
  LogarithmicScale,
  registerables,
} from 'chart.js'
import { useEffect } from 'react'
import annotationPlugin from 'chartjs-plugin-annotation';

export default function RegisterPlugins() {
  useEffect(() => {
    Chart.register(
      annotationPlugin,
      BarController,
      LineController,
      LineElement,
      ArcElement,
      PointElement,
      BarElement,
      CategoryScale,
      LinearScale,
      Title,
      Filler,
      Legend,
      Tooltip,
      LogarithmicScale,
      ...registerables
    )
  }, [])

  return null

}
