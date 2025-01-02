'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from './card'
import { HiddenCards } from './hidden-cards'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card as CardType, GameState } from '../types/game'
import {
  initializeGame,
  isValidPlay,
  getNextPlayer,
  getAIMove,
  shuffle,
} from '../utils/game'
import { cn } from '../lib/utils'

const COLORS = ['red', 'blue', 'green', 'yellow']

export function GameBoard({
  gameMode,
  onGameEnd,
}: {
  gameMode: 'single' | 'two-player'
  onGameEnd: () => void
}) {
  const [gameState, setGameState] = useState<GameState>(() => {
    localStorage.removeItem('unoGameState')
    return initializeGame(gameMode)
  })

  const [justDrew, setJustDrew] = useState(false)

  useEffect(() => {
    localStorage.setItem('unoGameState', JSON.stringify(gameState))
  }, [gameState])

  useEffect(() => {
    if (gameState.currentPlayer === 'ai' && !gameState.winner) {
      const timeoutId = setTimeout(playAITurn, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [gameState.currentPlayer])

  const getCurrentHand = () => {
    if (gameMode === 'single') {
      return gameState.currentPlayer === 'player1' ? gameState.player1Hand : gameState.aiHand
    } else {
      return gameState.currentPlayer === 'player1' ? gameState.player1Hand : gameState.player2Hand
    }
  }

  const handleDrawCard = () => {
    if (gameState.winner || justDrew) return

    const newState = { ...gameState }
    const drawnCard = newState.deck.shift()

    if (!drawnCard) {
      if (newState.discardPile.length <= 1) return
      
      const topCard = newState.discardPile[0]
      const newDeck = shuffle(newState.discardPile.slice(1))
      newState.deck = newDeck
      newState.discardPile = [topCard]
      setGameState(newState)
      return
    }

    switch (gameState.currentPlayer) {
      case 'player1':
        newState.player1Hand = [...newState.player1Hand, drawnCard]
        break
      case 'player2':
        newState.player2Hand = [...newState.player2Hand, drawnCard]
        break
      case 'ai':
        newState.aiHand = [...newState.aiHand, drawnCard]
        break
    }

    setGameState(newState)
    setJustDrew(true)

    if (!isValidPlay(drawnCard, newState.discardPile[0], newState.currentColor)) {
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          currentPlayer: getNextPlayer(prev.currentPlayer, gameMode, prev.direction)
        }))
        setJustDrew(false)
      }, 1000)
    }
  }

  const handleCardPlay = (card: CardType) => {
    if (gameState.winner) return

    if (!isValidPlay(card, gameState.discardPile[0], gameState.currentColor)) {
      return
    }

    const newState = { ...gameState }
    const currentHand = getCurrentHand()
    const cardIndex = currentHand.findIndex((c) => c.id === card.id)
    
    switch (gameState.currentPlayer) {
      case 'player1':
        newState.player1Hand = [
          ...newState.player1Hand.slice(0, cardIndex),
          ...newState.player1Hand.slice(cardIndex + 1),
        ]
        break
      case 'player2':
        newState.player2Hand = [
          ...newState.player2Hand.slice(0, cardIndex),
          ...newState.player2Hand.slice(cardIndex + 1),
        ]
        break
      case 'ai':
        newState.aiHand = [
          ...newState.aiHand.slice(0, cardIndex),
          ...newState.aiHand.slice(cardIndex + 1),
        ]
        break
    }

    newState.discardPile = [card, ...newState.discardPile]

    if (card.type === 'wild' || card.type === 'wild-draw-four') {
      newState.isChoosingColor = true
      if (card.type === 'wild-draw-four') {
        const nextPlayer = getNextPlayer(gameState.currentPlayer, gameMode, gameState.direction)
        const drawnCards = newState.deck.splice(0, 4)
        switch (nextPlayer) {
          case 'player1':
            newState.player1Hand = [...newState.player1Hand, ...drawnCards]
            break
          case 'player2':
            newState.player2Hand = [...newState.player2Hand, ...drawnCards]
            break
          case 'ai':
            newState.aiHand = [...newState.aiHand, ...drawnCards]
            break
        }
      }
      setGameState(newState)
      return
    }

    newState.currentColor = card.color

    switch (card.type) {
      case 'skip':
        newState.currentPlayer = getNextPlayer(
          getNextPlayer(gameState.currentPlayer, gameMode, gameState.direction),
          gameMode,
          gameState.direction
        )
        break
      case 'reverse':
        if (gameMode === 'two-player') {
          newState.currentPlayer = getNextPlayer(
            getNextPlayer(gameState.currentPlayer, gameMode, gameState.direction),
            gameMode,
            gameState.direction
          )
        } else {
          newState.direction =
            gameState.direction === 'clockwise' ? 'counter-clockwise' : 'clockwise'
          newState.currentPlayer = getNextPlayer(
            gameState.currentPlayer,
            gameMode,
            newState.direction
          )
        }
        break
      case 'draw-two':
        const nextPlayer = getNextPlayer(
          gameState.currentPlayer,
          gameMode,
          gameState.direction
        )
        const drawnCards = newState.deck.splice(0, 2)
        switch (nextPlayer) {
          case 'player1':
            newState.player1Hand = [...newState.player1Hand, ...drawnCards]
            break
          case 'player2':
            newState.player2Hand = [...newState.player2Hand, ...drawnCards]
            break
          case 'ai':
            newState.aiHand = [...newState.aiHand, ...drawnCards]
            break
        }
        newState.currentPlayer = getNextPlayer(
          nextPlayer,
          gameMode,
          gameState.direction
        )
        break
      default:
        newState.currentPlayer = getNextPlayer(
          gameState.currentPlayer,
          gameMode,
          gameState.direction
        )
    }

    const currentHandAfterPlay = 
      gameState.currentPlayer === 'player1' ? newState.player1Hand :
      gameState.currentPlayer === 'player2' ? newState.player2Hand :
      newState.aiHand

    if (currentHandAfterPlay.length === 0) {
      newState.winner = gameState.currentPlayer
    }

    setGameState(newState)
    setJustDrew(false)
  }

  const playAITurn = () => {
    const currentHand = gameState.aiHand
    const validCard = getAIMove(
      currentHand,
      gameState.discardPile[0],
      gameState.currentColor
    )

    if (validCard) {
      handleCardPlay(validCard)
      if (validCard.color === 'wild') {
        const colorCounts = currentHand.reduce((acc, c) => {
          if (c.color !== 'wild') {
            acc[c.color] = (acc[c.color] || 0) + 1
          }
          return acc
        }, {} as Record<string, number>)
        const mostFrequentColor = Object.entries(colorCounts).reduce((a, b) =>
          (b[1] || 0) > (a[1] || 0) ? b : a
        )[0]
        handleColorChoice(mostFrequentColor as CardType['color'])
      }
    } else {
      handleDrawCard()
    }
  }

  const handleColorChoice = (color: CardType['color']) => {
    setGameState((prev) => ({
      ...prev,
      currentColor: color,
      isChoosingColor: false,
      currentPlayer: getNextPlayer(prev.currentPlayer, gameMode, prev.direction),
    }))
  }

  return (
    <div className="min-h-screen bg-green-800 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold">
              Current Player: {gameState.currentPlayer}
            </h2>
            <p>Current Color: {gameState.currentColor}</p>
          </div>
          <Button onClick={onGameEnd}>Exit Game</Button>
        </div>

        {/* Opponent's Hand */}
        <div className="flex justify-center">
          {gameMode === 'single' ? (
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white text-center mb-2">
                AI's Cards: {gameState.aiHand.length}
              </p>
              <div className="relative h-32">
                <HiddenCards count={gameState.aiHand.length} />
              </div>
            </div>
          ) : (
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white text-center mb-2">
                {gameState.currentPlayer === 'player1' ? 'Player 2' : 'Player 1'}'s Cards: {
                  gameState.currentPlayer === 'player1' ? gameState.player2Hand.length : gameState.player1Hand.length
                }
              </p>
              <div className="relative h-32">
                <HiddenCards 
                  count={
                    gameState.currentPlayer === 'player1' 
                      ? gameState.player2Hand.length 
                      : gameState.player1Hand.length
                  } 
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-8 items-center">
          <div className="relative">
            {gameState.deck.length > 0 && (
              <div
                className={cn(
                  "w-20 h-32 bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform",
                  justDrew && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleDrawCard}
              />
            )}
            <span className="absolute -bottom-6 text-white text-sm">
              Deck: {gameState.deck.length}
            </span>
          </div>
          <div className="relative">
            <Card card={gameState.discardPile[0]} />
            <span className="absolute -bottom-6 text-white text-sm">
              Discard Pile
            </span>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-white text-center mb-2">
            {gameState.currentPlayer === 'player1' ? 'Player 1' : gameMode === 'single' ? 'AI' : 'Player 2'}'s Cards
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {getCurrentHand().map((card) => (
              <Card
                key={card.id}
                card={card}
                isPlayable={isValidPlay(
                  card,
                  gameState.discardPile[0],
                  gameState.currentColor
                )}
                onClick={() => handleCardPlay(card)}
              />
            ))}
          </div>
        </div>

        <Dialog open={gameState.isChoosingColor}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose a Color</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              {COLORS.map((color) => (
                <Button
                  key={color}
                  className={cn(
                    'h-20',
                    color === 'red' && 'bg-red-500 hover:bg-red-600',
                    color === 'blue' && 'bg-blue-500 hover:bg-blue-600',
                    color === 'green' && 'bg-green-500 hover:bg-green-600',
                    color === 'yellow' && 'bg-yellow-500 hover:bg-yellow-600'
                  )}
                  onClick={() => handleColorChoice(color as CardType['color'])}
                >
                  {color}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!gameState.winner}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Game Over!</DialogTitle>
            </DialogHeader>
            <div className="text-center">
              <p className="text-xl mb-4">
                {gameState.winner === 'player1'
                  ? 'Player 1 Wins!'
                  : gameState.winner === 'player2'
                  ? 'Player 2 Wins!'
                  : 'AI Wins!'}
              </p>
              <Button onClick={onGameEnd}>Back to Menu</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

