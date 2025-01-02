'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GameBoard } from '@/components/game-board'

export default function Home() {
  const [gameMode, setGameMode] = useState<'single' | 'two-player' | null>(null)
  const [showComingSoon, setShowComingSoon] = useState(false)

  const handleSinglePlayerClick = () => {
    setShowComingSoon(true)
  }

  const closeModal = () => {
    setShowComingSoon(false)
  }

  if (gameMode === 'two-player') {
    return <GameBoard gameMode={gameMode} onGameEnd={() => setGameMode(null)} />
  }

  return (
    <div className="min-h-screen bg-[url('/images/uno-bg.jpg')] bg-cover bg-center flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Main Content */}
      <div className="relative z-10 text-center p-8 max-w-md">
        <h1 className="text-5xl md:text-6xl font-extrabold text-yellow-400 drop-shadow-md mb-6">
          🚀 UNO Battle Arena 🎲
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8">
          Challenge your friends or face off against the AI in the ultimate UNO showdown!
        </p>
        <div className="space-y-4">
          <Button
            className="w-full text-lg bg-red-500 hover:bg-red-600 text-white font-bold py-2"
            onClick={handleSinglePlayerClick}
          >
            Single Player vs AI
          </Button>
          <Button
            className="w-full text-lg bg-blue-500 hover:bg-blue-600 text-white font-bold py-2"
            onClick={() => setGameMode('two-player')}
          >
            Two Players
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-gray-300 text-sm text-center w-full">
        © 2024 UNO Game | Designed for Fun & Strategy 🃏 | Made with ❤️ by <span className="text-yellow-400 font-bold">Jatin</span> 
        <br />
        I'm unbeatable at UNO... unless my buddy is playing. Then it's anyone's game! 😜
      </footer>

      {/* Modal for "Coming Soon" */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center shadow-2xl max-w-sm">
            <h2 className="text-3xl font-bold text-red-500 mb-4">🚧 Coming Soon!</h2>
            <p className="text-gray-600">
              We're currently working on the Single Player Mode. Stay tuned!
            </p>
            <Button
              className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-2 w-full"
              onClick={closeModal}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
