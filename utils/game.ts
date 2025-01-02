import { Card, CardColor, CardType, GameState, Player } from '../types/game'

export function createDeck(): Card[] {
  const deck: Card[] = []
  const colors: CardColor[] = ['red', 'blue', 'green', 'yellow']
  
  colors.forEach(color => {
    deck.push({ id: `${color}-0`, color, type: 'number', number: 0 })
    
    for (let i = 1; i <= 9; i++) {
      deck.push({ id: `${color}-${i}-1`, color, type: 'number', number: i })
      deck.push({ id: `${color}-${i}-2`, color, type: 'number', number: i })
    }
    
    const actions: CardType[] = ['skip', 'reverse', 'draw-two']
    actions.forEach(action => {
      deck.push({ id: `${color}-${action}-1`, color, type: action })
      deck.push({ id: `${color}-${action}-2`, color, type: action })
    })
  })
  
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `wild-${i}`, color: 'wild', type: 'wild' })
    deck.push({ id: `wild-draw-four-${i}`, color: 'wild', type: 'wild-draw-four' })
  }
  
  return shuffle(deck)
}

export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export function isValidPlay(card: Card, topCard: Card, currentColor: CardColor): boolean {
  if (card.color === 'wild') return true
  if (card.color === currentColor) return true
  if (card.type === 'number' && topCard.type === 'number' && card.number === topCard.number) return true
  return false
}

export function initializeGame(gameMode: 'single' | 'two-player'): GameState {
  const deck = createDeck()
  const player1Hand = deck.splice(0, 7)
  const player2Hand = gameMode === 'two-player' ? deck.splice(0, 7) : []
  const aiHand = gameMode === 'single' ? deck.splice(0, 7) : []
  const firstCard = deck.splice(0, 1)[0]
  
  return {
    deck,
    discardPile: [firstCard],
    currentPlayer: 'player1',
    player1Hand,
    player2Hand,
    aiHand,
    gameMode,
    direction: 'clockwise',
    winner: null,
    currentColor: firstCard.color === 'wild' ? 'red' : firstCard.color,
    isChoosingColor: firstCard.color === 'wild',
    lastAction: null,
  }
}

export function getNextPlayer(currentPlayer: Player, gameMode: 'single' | 'two-player', direction: 'clockwise' | 'counter-clockwise'): Player {
  if (gameMode === 'single') {
    return currentPlayer === 'player1' ? 'ai' : 'player1'
  }
  return currentPlayer === 'player1' ? 'player2' : 'player1'
}

export function getAIMove(hand: Card[], topCard: Card, currentColor: CardColor): Card | null {
  const playableCard = hand.find(card => isValidPlay(card, topCard, currentColor))
  if (playableCard) return playableCard
  return hand.find(card => card.color === 'wild') || null
}

