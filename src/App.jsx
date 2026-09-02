import { Routes, Route } from 'react-router-dom';
import SystemCheck from './components/SystemCheck';
import NotFoundPage from './components/NotFoundPage';
import './index.css';

/**
 * Temporary placeholder component for the interactive quiz game screen.
 * @returns {JSX.Element} The rendered game screen placeholder.
 */
const GameScreen = () => (
  <div style={{ textAlign: 'center', marginTop: '5rem', color: '#ffffff' }}>
    <h2>Game Screen</h2>
    <p style={{ color: 'var(--text-muted, #a0a0b0)' }}>In Progress...</p>
  </div>
);

/**
 * Temporary placeholder component for the quiz editor/management screen.
 * @returns {JSX.Element} The rendered editor screen placeholder.
 */
const EditorScreen = () => (
  <div style={{ textAlign: 'center', marginTop: '5rem', color: '#ffffff' }}>
    <h2>Editor Screen</h2>
    <p style={{ color: 'var(--text-muted, #a0a0b0)' }}>In Progress...</p>
  </div>
);

/**
 * Root Application Component.
 * Houses the main client routing system, hero presentation, and universal footer.
 *
 * @component
 * @returns {JSX.Element} The rendered root application structure.
 */
export default function App() {
  return (
    <div className="app-container">
      <main className="main-content">
        <Routes>
          {/* Main Landing / System Check Screen */}
          <Route
            path="/"
            element={
              <>
                <section className="hero-section">
                  <h1 className="brand-title">MINDGOLD</h1>
                  <p className="brand-tagline">INTERACTIVE KNOWLEDGE QUIZ ENGINE</p>
                </section>
                <SystemCheck />
              </>
            }
          />

          {/* Core Feature Routes */}
          <Route path="/game" element={<GameScreen />} />
          <Route path="/editor" element={<EditorScreen />} />

          {/* Catch-all Route for 404 Error Handling */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>MindGold Engine © 2026. All rights reserved.</p>
      </footer>
    </div>
  );
}