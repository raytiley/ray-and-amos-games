import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import PizzaMemory from './games/PizzaMemory/PizzaMemory'
import './App.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pizza-memory" element={<PizzaMemory />} />
      </Routes>
    </HashRouter>
  )
}

export default App
