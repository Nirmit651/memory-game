// App.jsx
import { useState, useEffect } from 'react'
import Card from './Card.jsx'
import { DotWave } from 'ldrs/react'
import 'ldrs/react/DotWave.css'
import './App.css'

const POKE_MAX = 1010;
const numCardsOnEasy = 5;
const numCardsOnMedium = 10;
const numCardsOnHard = 15;
let numCardsInPlay = 0;

function uniqueRandomIds(count, max = POKE_MAX) {
  const ids = new Set();
  while (ids.size < count) ids.add(1 + Math.floor(Math.random() * max));
  return [...ids];
}

async function fetchPokemon(id) {
  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon/' + id);
    const data = await res.json();
    const img = data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default;
    const name = data.name;
    return { img, name };
  } catch (e) {
    console.error('Error fetching Pokémon:', e);
    return null;
  }
}

export default function App() {
  const [status, setStatus] = useState('loading');
  const [pool, setPool] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [pickedNames, setPickedNames] = useState(new Set());
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  // Load once (preload 15)
  useEffect(() => { loadCards(15); }, []);

  if (status === 'loading') {
    loadCards(15);
    return (
      <div className="modal-overlay">
        <div className="modal panel">
          <DotWave size="47" speed="1" color="white" />
          <p className="muted">Loading Pokémon…</p>
        </div>
      </div>
    );
  }

  if (status === 'choose') {
    return (
      <div className="modal-overlay">
        <div className="modal panel">
          <h2 className="title">Choose Difficulty</h2>
          <div className="btn-row">
            <button className="btn" onClick={() => handleDifficulty('easy')}>Easy (5)</button>
            <button className="btn" onClick={() => handleDifficulty('medium')}>Medium (10)</button>
            <button className="btn" onClick={() => handleDifficulty('hard')}>Hard (15)</button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'won') {
    return (
      <div className="modal-overlay">
        <div className="modal panel">
          <h2 className="title">You won! 🎉</h2>
          <p className="muted">Best: {bestScore}</p>
          <button className="btn" onClick={resetGame}>Play Again</button>
        </div>
      </div>
    );
  }

  // playing
  return (
    <div className="page">
      <header className="hud panel">
        <div>Current: <strong>{currentScore}</strong></div>
        <div>Best: <strong>{bestScore}</strong></div>
      </header>

      <div className="card-container">
        {displayed.map((c, i) => (
          <Card key={i} name={c.name} img={c.img} onClick={() => handleCardClick(c.name)} />
        ))}
      </div>
    </div>
  );

  async function loadCards(n) {
    const ids = uniqueRandomIds(n);
    const arr = (await Promise.all(ids.map(fetchPokemon))).filter(Boolean);
    setPool(arr);
    setStatus('choose');
  }

  function pickCards(n) {
    const idx = [...generateUniqueIndices(n)];
    setDisplayed(idx.map(i => pool[i]));
  }

  function generateUniqueIndices(n) {
    const s = new Set();
    while (s.size !== n) s.add(Math.floor(Math.random() * n));
    return s;
  }

  function handleDifficulty(d) {
    if (d === 'easy')       { pickCards(numCardsOnEasy);   numCardsInPlay = numCardsOnEasy; }
    else if (d === 'medium'){ pickCards(numCardsOnMedium); numCardsInPlay = numCardsOnMedium; }
    else                    { pickCards(numCardsOnHard);   numCardsInPlay = numCardsOnHard; }
    setPickedNames(new Set());
    setCurrentScore(0);
    setStatus('playing');
  }

  function handleCardClick(name) {
    if (pickedNames.has(name)) {
      setPickedNames(new Set());
      setCurrentScore(0);
      shuffleCards();
      return;
    }
    setPickedNames(prev => new Set([...prev, name]));
    setCurrentScore(s => {
      const next = s + 1;
      setBestScore(b => Math.max(b, next));
      if (next === numCardsInPlay) setStatus('won');
      return next;
    });
    shuffleCards();
  }

  function shuffleCards() {
    setDisplayed(prev => {
      const a = [...prev];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    });
  }

  function resetGame() {
    setBestScore(0);
    setCurrentScore(0);
    setDisplayed([]);
    setPickedNames(new Set());
    setStatus('loading');
  }
}
