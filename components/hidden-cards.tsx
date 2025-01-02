import { Card } from './card'

interface HiddenCardsProps {
  count: number
}

export function HiddenCards({ count }: HiddenCardsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="relative"
          style={{
            transform: `translateX(${index * -60}px)`,
            zIndex: count - index
          }}
        >
          <Card isHidden />
        </div>
      ))}
    </div>
  )
}

