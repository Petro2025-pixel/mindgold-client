// App.jsx — минимальная рабочая версия
import './index.css';
import BackgroundCanvas from './components/BackgroundCanvas';
import SystemCheck from './components/SystemCheck';

export default function App() {
  return (
    <div className="app-container">
      <BackgroundCanvas />
      <main className="main-content">
        <section className="hero-section">
          <h1 className="brand-title">MINDGOLD</h1>
          <p className="brand-tagline">INTERACTIVE KNOWLEDGE QUIZ ENGINE</p>
        </section>
        <SystemCheck />
      </main>
      <footer className="footer">
        <p>MindGold Engine © 2026. All rights reserved.</p>
      </footer>
    </div>
  );
}