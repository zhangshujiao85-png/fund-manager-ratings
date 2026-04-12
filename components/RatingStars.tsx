'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export function RatingStars({
  rating,
  maxRating = 10,
  size = 'md',
  showValue = false,
  interactive = false,
  onRatingChange,
  className,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value)
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, i) => {
          const starValue = i + 1
          const isFilled = starValue <= rating
          const isHalf = !isFilled && starValue - 0.5 <= rating

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starValue)}
              className={cn(
                'transition-all',
                interactive && 'hover:scale-110 cursor-pointer',
                interactive && 'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : isHalf
                    ? 'fill-yellow-400/50 text-yellow-400'
                    : 'fill-gray-200 text-gray-300'
                )}
              />
            </button>
          )
        })}
      </div>
      {showValue && (
        <span className={cn(
          'ml-2 font-semibold text-gray-700',
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
        )}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
