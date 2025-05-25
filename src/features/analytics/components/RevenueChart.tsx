import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/common'
import { Button } from '@components/common'
import { Download } from 'lucide-react'
import type { TimeSeriesData } from '../types'

interface RevenueChartProps {
  data: TimeSeriesData[]
  title?: string
  onExport?: () => void
}

export default function RevenueChart({
  data,
  title = 'Revenue Trend',
  onExport,
}: RevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No data available</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate chart dimensions
  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue
  const padding = range * 0.1
  const chartHeight = 200
  const chartMax = maxValue + padding
  const chartMin = Math.max(0, minValue - padding)
  const chartRange = chartMax - chartMin

  // Create path for line chart
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = ((chartMax - d.value) / chartRange) * chartHeight
      return `${x},${y}`
    })
    .join(' ')

  const pathData = `M ${points}`

  // Create area path
  const areaPoints = [
    `0,${chartHeight}`,
    ...data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = ((chartMax - d.value) / chartRange) * chartHeight
      return `${x},${y}`
    }),
    `100,${chartHeight}`,
  ].join(' ')

  const areaPath = `M ${areaPoints} Z`

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {onExport && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg
            viewBox={`0 0 100 ${chartHeight}`}
            className="w-full h-64"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            <g className="text-gray-200">
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                <line
                  key={fraction}
                  x1="0"
                  y1={fraction * chartHeight}
                  x2="100"
                  y2={fraction * chartHeight}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>

            {/* Area fill */}
            <path d={areaPath} fill="url(#gradient)" opacity="0.1" />

            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke="#0066FF"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />

            {/* Data points */}
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100
              const y = ((chartMax - d.value) / chartRange) * chartHeight

              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={hoveredIndex === i ? '#0066FF' : 'white'}
                  stroke="#0066FF"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              )
            })}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0066FF" />
                <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Hover tooltip */}
          {hoveredIndex !== null && (
            <div
              className="absolute bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none"
              style={{
                left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
                top: '10px',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="font-semibold">
                ${data[hoveredIndex].value.toLocaleString()}
              </div>
              <div className="text-gray-300">
                {new Date(data[hoveredIndex].date).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{new Date(data[0].date).toLocaleDateString()}</span>
          <span>
            {new Date(data[data.length - 1].date).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
