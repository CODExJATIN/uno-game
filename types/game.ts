export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild'
export type CardType = 'number' | 'skip' | 'reverse' | 'draw-two' | 'wild' | 'wild-draw-four'

export interface Card {
  id: string
  color: CardColor
  type: CardType
  number?: number
}

export type Player = 'player1' | 'player2' | 'ai'

export interface GameState {
  deck: Card[]
  discardPile: Card[]
  currentPlayer: Player
  player1Hand: Card[]
  player2Hand: Card[]
  aiHand: Card[]
  gameMode: 'single' | 'two-player'
  direction: 'clockwise' | 'counter-clockwise'
  winner: Player | null
  currentColor: CardColor
  isChoosingColor: boolean
  lastAction: string | null
}

