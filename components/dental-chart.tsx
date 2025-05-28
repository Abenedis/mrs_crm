"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ToothData {
  number: number
  hasIssues: boolean
  hasTreatment: boolean
  status?: "healthy" | "cavity" | "filled" | "crown" | "missing" | "root_canal"
}

interface DentalChartProps {
  teeth: ToothData[]
  selectedTooth?: number
  onToothSelect: (toothNumber: number) => void
  className?: string
}

const TOOTH_POSITIONS = {
  // Upper jaw (1-16)
  upper: [
    { number: 1, x: 380, y: 20 },
    { number: 2, x: 350, y: 25 },
    { number: 3, x: 320, y: 35 },
    { number: 4, x: 290, y: 50 },
    { number: 5, x: 260, y: 70 },
    { number: 6, x: 230, y: 95 },
    { number: 7, x: 200, y: 125 },
    { number: 8, x: 170, y: 160 },
    { number: 9, x: 230, y: 160 },
    { number: 10, x: 260, y: 125 },
    { number: 11, x: 290, y: 95 },
    { number: 12, x: 320, y: 70 },
    { number: 13, x: 350, y: 50 },
    { number: 14, x: 380, y: 35 },
    { number: 15, x: 410, y: 25 },
    { number: 16, x: 440, y: 20 },
  ],
  // Lower jaw (17-32)
  lower: [
    { number: 17, x: 440, y: 380 },
    { number: 18, x: 410, y: 375 },
    { number: 19, x: 380, y: 365 },
    { number: 20, x: 350, y: 350 },
    { number: 21, x: 320, y: 330 },
    { number: 22, x: 290, y: 305 },
    { number: 23, x: 260, y: 275 },
    { number: 24, x: 230, y: 240 },
    { number: 25, x: 170, y: 240 },
    { number: 26, x: 200, y: 275 },
    { number: 27, x: 230, y: 305 },
    { number: 28, x: 260, y: 330 },
    { number: 29, x: 290, y: 350 },
    { number: 30, x: 320, y: 365 },
    { number: 31, x: 350, y: 375 },
    { number: 32, x: 380, y: 380 },
  ],
}

const getToothColor = (tooth: ToothData, isSelected: boolean) => {
  if (isSelected) return "#3b82f6" // blue
  if (tooth.status === "missing") return "#ef4444" // red
  if (tooth.status === "cavity") return "#f59e0b" // amber
  if (tooth.status === "filled") return "#8b5cf6" // violet
  if (tooth.status === "crown") return "#06b6d4" // cyan
  if (tooth.status === "root_canal") return "#ec4899" // pink
  if (tooth.hasIssues) return "#f59e0b" // amber
  if (tooth.hasTreatment) return "#10b981" // emerald
  return "#6b7280" // gray
}

export default function DentalChart({ teeth, selectedTooth, onToothSelect, className }: DentalChartProps) {
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null)

  const allPositions = [...TOOTH_POSITIONS.upper, ...TOOTH_POSITIONS.lower]

  return (
    <div className={cn("relative bg-white rounded-lg border p-4", className)}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Dental Chart</h3>
        <p className="text-sm text-gray-600">Click on a tooth to view details or add treatment</p>
      </div>

      <svg viewBox="0 0 600 400" className="w-full h-auto max-w-2xl mx-auto">
        {/* Jaw outline */}
        <path
          d="M 100 200 Q 300 50 500 200 Q 300 350 100 200"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2"
          className="opacity-50"
        />

        {/* Teeth */}
        {allPositions.map((position) => {
          const tooth = teeth.find((t) => t.number === position.number) || {
            number: position.number,
            hasIssues: false,
            hasTreatment: false,
            status: "healthy" as const,
          }

          const isSelected = selectedTooth === position.number
          const isHovered = hoveredTooth === position.number

          return (
            <g key={position.number}>
              <circle
                cx={position.x}
                cy={position.y}
                r={isSelected || isHovered ? 16 : 12}
                fill={getToothColor(tooth, isSelected)}
                stroke={isSelected ? "#1d4ed8" : isHovered ? "#3b82f6" : "#d1d5db"}
                strokeWidth={isSelected ? 3 : 2}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredTooth(position.number)}
                onMouseLeave={() => setHoveredTooth(null)}
                onClick={() => onToothSelect(position.number)}
              />
              <text
                x={position.x}
                y={position.y + 4}
                textAnchor="middle"
                className="text-xs font-medium fill-white pointer-events-none select-none"
              >
                {position.number}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
          <span>Healthy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span>Cavity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500"></div>
          <span>Filled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
          <span>Crown</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500"></div>
          <span>Root Canal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Missing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span>Treatment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  )
}
