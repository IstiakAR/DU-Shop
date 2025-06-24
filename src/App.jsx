import { useState } from 'react'
import './styles/App.css'

import HomePage from './components/HomePage';
import Header from './components/Header';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header />
      <HomePage />
    </>
  )
}

export default App
