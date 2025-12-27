import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './PizzaMemory.css'

// Import artwork
import cardBack from './artwork/Pizza_Memory_pizzaback.png'
import pizzaBase from './artwork/Pizza_Memory_pizzafront.png'
import logo from './artwork/Pizza_Memory_logo.png'
import pepperoniImg from './artwork/Pizza_Memory_pepperoni.png'
import mushroomImg from './artwork/Pizza_Memory_mushroom.png'
import oliveImg from './artwork/Pizza_Memory_olive.png'
import bellpepperImg from './artwork/Pizza_Memory_bellpepper.png'
import tomatoImg from './artwork/Pizza_Memory_tomato.png'
import cheeseImg from './artwork/Pizza_Memory_cheese.png'
import baconImg from './artwork/Pizza_Memory_bacon.png'
import onionImg from './artwork/Pizza_Memory_onion.png'
import pineappleImg from './artwork/Pizza_Memory_pineapple.png'
import basilImg from './artwork/Pizza_Memory_basil.png'

const PIZZA_TOPPINGS = [
  { id: 'pepperoni', image: pepperoniImg, name: 'Pepperoni' },
  { id: 'mushroom', image: mushroomImg, name: 'Mushroom' },
  { id: 'olive', image: oliveImg, name: 'Olive' },
  { id: 'pepper', image: bellpepperImg, name: 'Bell Pepper' },
  { id: 'tomato', image: tomatoImg, name: 'Tomato' },
  { id: 'cheese', image: cheeseImg, name: 'Cheese' },
  { id: 'bacon', image: baconImg, name: 'Bacon' },
  { id: 'onion', image: onionImg, name: 'Onion' },
  { id: 'pineapple', image: pineappleImg, name: 'Pineapple' },
  { id: 'basil', image: basilImg, name: 'Basil' },
]

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function createCards() {
  const cards = []
  PIZZA_TOPPINGS.forEach((topping, index) => {
    cards.push({ ...topping, cardId: index * 2 })
    cards.push({ ...topping, cardId: index * 2 + 1 })
  })
  return shuffleArray(cards)
}

function loadBestScore() {
  try {
    return parseInt(localStorage.getItem('pizzaMemoryBestScore')) || null
  } catch {
    return null
  }
}

function saveBestScore(score) {
  try {
    localStorage.setItem('pizzaMemoryBestScore', score.toString())
  } catch {
    // localStorage not available
  }
}

function PizzaMemory() {
  const [cards, setCards] = useState(() => createCards())
  const [flippedCards, setFlippedCards] = useState([])
  const [matchedCards, setMatchedCards] = useState([])
  const [moves, setMoves] = useState(0)
  const [bestScore, setBestScore] = useState(() => loadBestScore())
  const [isChecking, setIsChecking] = useState(false)
  const [gameWon, setGameWon] = useState(false)

  useEffect(() => {
    if (matchedCards.length === 20) {
      setGameWon(true)
      if (!bestScore || moves < bestScore) {
        setBestScore(moves)
        saveBestScore(moves)
      }
    }
  }, [matchedCards, moves, bestScore])

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true)
      const [first, second] = flippedCards

      if (first.id === second.id) {
        setMatchedCards((prev) => [...prev, first.cardId, second.cardId])
        setFlippedCards([])
        setIsChecking(false)
      } else {
        setTimeout(() => {
          setFlippedCards([])
          setIsChecking(false)
        }, 1000)
      }
    }
  }, [flippedCards])

  const handleCardClick = (card) => {
    if (isChecking) return
    if (flippedCards.length === 2) return
    if (flippedCards.some((c) => c.cardId === card.cardId)) return
    if (matchedCards.includes(card.cardId)) return

    setFlippedCards((prev) => [...prev, card])
    if (flippedCards.length === 1) {
      setMoves((prev) => prev + 1)
    }
  }

  const resetGame = () => {
    setCards(createCards())
    setFlippedCards([])
    setMatchedCards([])
    setMoves(0)
    setGameWon(false)
    setIsChecking(false)
  }

  const isCardFlipped = (cardId) => {
    return (
      flippedCards.some((c) => c.cardId === cardId) ||
      matchedCards.includes(cardId)
    )
  }

  const isCardMatched = (cardId) => matchedCards.includes(cardId)

  return (
    <div className="pizza-memory">
      <header className="game-header">
        <Link to="/" className="back-button">
          ← Back
        </Link>
        <h1><img src={logo} alt="Pizza" className="header-logo" /> Pizza Memory</h1>
        <div className="stats">
          <span className="stat">Moves: {moves}</span>
          {bestScore && <span className="stat best">Best: {bestScore}</span>}
        </div>
      </header>

      {gameWon && (
        <div className="win-modal">
          <div className="win-content">
            <h2>🎉 You Won! 🎉</h2>
            <p>You matched all pairs in {moves} moves!</p>
            {moves === bestScore && <p className="new-record">New Best Score!</p>}
            <button onClick={resetGame}>Play Again</button>
          </div>
        </div>
      )}

      <div className="cards-grid">
        {cards.map((card) => (
          <button
            key={card.cardId}
            className={`card ${isCardFlipped(card.cardId) ? 'flipped' : ''} ${
              isCardMatched(card.cardId) ? 'matched' : ''
            }`}
            onClick={() => handleCardClick(card)}
            disabled={isCardMatched(card.cardId)}
          >
            <div className="card-inner">
              <div className="card-front">
                <img src={cardBack} alt="Card back" className="card-image" />
              </div>
              <div className="card-back">
                <div className="pizza-stack">
                  <img src={pizzaBase} alt="Pizza base" className="pizza-base" />
                  <img src={card.image} alt={card.name} className="topping-image" />
                </div>
                <span className="topping-name">{card.name}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button className="reset-button" onClick={resetGame}>
        New Game
      </button>
    </div>
  )
}

export default PizzaMemory
