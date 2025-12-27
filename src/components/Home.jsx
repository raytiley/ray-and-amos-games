import { Link } from 'react-router-dom'
import './Home.css'
import pizzaLogo from '../games/PizzaMemory/artwork/Pizza_Memory_logo.png'

const games = [
  {
    id: 'pizza-memory',
    title: 'Pizza Memory',
    description: 'Match pairs of pizza toppings! Flip cards to find matching pairs.',
    image: pizzaLogo,
    path: '/pizza-memory',
  },
]

function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <h1>Ray & Amos Games</h1>
        <p>Choose a game to play!</p>
      </header>

      <div className="games-grid">
        {games.map((game) => (
          <Link key={game.id} to={game.path} className="game-card">
            {game.image ? (
              <img src={game.image} alt={game.title} className="game-image" />
            ) : (
              <span className="game-emoji">{game.emoji}</span>
            )}
            <h2>{game.title}</h2>
            <p>{game.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
