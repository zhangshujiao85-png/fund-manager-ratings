'use client'

import { useState } from 'react'
import { RATING_DIMENSIONS } from '@/lib/constants'
import { RatingDimension, RatingDimensions } from '@/types'
import { cn } from '@/lib/utils'

interface RatingSliderProps {
  dimensions: RatingDimensions
  onChange: (dimensions: RatingDimensions) => void
  readOnly?: false
}

interface RatingSliderDisplayProps {
  dimensions: RatingDimensions
  readOnly: true
}

export function RatingSlider({ dimensions, onChange, readOnly = false }: RatingSliderProps) {
  const handleChange = (dimension: RatingDimension, value: number) => {
    onChange({
      ...dimensions,
      [dimension]: value,
    })
  }

  return (
    <div className="space-y-6">
      {(Object.keys(RATING_DIMENSIONS) as RatingDimension[]).map((dimension) => {
        const config = RATING_DIMENSIONS[dimension]
        const value = dimensions[dimension]

        return (
          <div key={dimension} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-semibold text-gray-900">{config.label}</label>
                <p className="text-sm text-gray-500 mt-0.5">{config.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 w-12 text-right">
                  {value}
                </span>
                <span className="text-sm text-gray-500">/10</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={value}
              onChange={(e) => handleChange(dimension, parseFloat(e.target.value))}
              disabled={readOnly}
              className={cn(
                'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
                'disabled:cursor-not-allowed disabled:opacity-60',
                readOnly === false && 'accent-blue-600 hover:accent-blue-700'
              )}
              style={{
                background: `linear-gradient(to right, ${config.color} 0%, ${config.color} ${(value / 10) * 100}%, #e5e7eb ${(value / 10) * 100}%, #e5e7eb 100%)`,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

// 只读展示版本
export function RatingSliderDisplay({ dimensions, readOnly }: RatingSliderDisplayProps) {
  return <RatingSlider dimensions={dimensions} onChange={() => {}} readOnly={readOnly} />
}
