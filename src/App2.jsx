
import './index.css';
import BackgroundCanvas from './components/BackgroundCanvas';

export default function App() {
  return (
    <div className="app-container">
  
      <BackgroundCanvas />

      <main className="main-content">
        <section className="hero-section">
          <h1 className="brand-title">MINDGOLD</h1>
          <p className="brand-tagline">INTERACTIVE KNOWLEDGE QUIZ ENGINE</p>
        </section>

        <div className="action-grid">
          <button 
            className="btn-game-action btn-play"
            onClick={() => alert('Старт игры!')}
          >
            <span className="btn-icon">🎮</span>
            <span>Play</span>
          </button>

          <button 
            className="btn-game-action btn-editor"
            onClick={() => alert('Открытие редактора!')}
          >
            <span className="btn-icon">🛠️</span>
            <span>Editor</span>
          </button>

          <button 
            className="btn-game-action btn-cheatsheet"
            onClick={() => alert('Открытие справки!')}
          >
            <span className="btn-icon">📖</span>
            <span>Information</span>
          </button>
        </div>
      </main>

      <footer className="footer">
        <p>MindGold Engine © 2026. All rights reserved.</p>
      </footer>
    </div>
  );
}