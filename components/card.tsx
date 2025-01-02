import { cn } from '../lib/utils'
import { Card as CardType } from '../types/game'

interface CardProps {
  card?: CardType
  onClick?: () => void
  isPlayable?: boolean
  className?: string
  isHidden?: boolean
}

export function Card({ card, onClick, isPlayable, className, isHidden = false }: CardProps) {
  if (isHidden || !card) {
    return (
      <div
        className={cn(
          'relative w-20 h-32 rounded-lg shadow-lg bg-gray-800 border-2 border-gray-700',
          className
        )}
      />
    )
  }

  const getCardContent = () => {
    if (card.type === 'number') {
      return card.number
    }
    switch (card.type) {
      case 'skip':
        return '⊘'
      case 'reverse':
        return '↺'
      case 'draw-two':
        return '+2'
      case 'wild':
        return '★'
      case 'wild-draw-four':
        return '+4'
      default:
        return ''
    }
  }

  const getCardColor = () => {
    switch (card.color) {
      case 'red':
        return 'bg-red-500'
      case 'blue':
        return 'bg-blue-500'
      case 'green':
        return 'bg-green-500'
      case 'yellow':
        return 'bg-yellow-500'
      case 'wild':
        return 'bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div
      className={cn(
        'relative w-20 h-32 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105',
        getCardColor(),
        isPlayable && 'ring-4 ring-white ring-opacity-50',
        !isPlayable && onClick && 'opacity-50',
        className
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-white">{getCardContent()}</span>
      </div>
    </div>
  )
}

