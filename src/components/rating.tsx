import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingProps {
  value: number
  max?: number
  onChange?: (value: number) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Rating({ 
  value, 
  max = 10, 
  onChange, 
  disabled = false, 
  size = "md",
  className 
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null)
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  }

  const handleClick = (starValue: number) => {
    if (!disabled && onChange) {
      onChange(starValue)
    }
  }

  const handleMouseEnter = (starValue: number) => {
    if (!disabled) {
      setHoverValue(starValue)
    }
  }

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverValue(null)
    }
  }

  const displayValue = hoverValue ?? value

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((starValue) => (
        <button
          key={starValue}
          type="button"
          onClick={() => handleClick(starValue)}
          onMouseEnter={() => handleMouseEnter(starValue)}
          onMouseLeave={handleMouseLeave}
          disabled={disabled}
          className={cn(
            "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-sm",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            sizeClasses[size]
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              starValue <= displayValue
                ? "text-yellow-400 fill-current"
                : "text-gray-300 hover:text-yellow-300"
            )}
          />
        </button>
      ))}
    </div>
  )
}
