import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Initial delay in seconds before automatically redirecting to the home page.
 * @type {number}
 */
const REDIRECT_SECONDS = 8;

/**
 * NotFoundPage Component.
 * Displays a 404 error screen with a countdown timer that automatically redirects
 * the user back to the home page, alongside a button for manual navigation.
 *
 * @component
 * @returns {JSX.Element} The rendered 404 page component.
 */
export default function NotFoundPage() {
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="not-found-page">
      <h1 className="not-found-code">404</h1>
      <p className="not-found-message">The requested page does not exist.</p>
      <p className="not-found-timer">
        Redirecting to home in <span>{secondsLeft}</span> sec...
      </p>
      <button className="btn-hex" onClick={() => navigate('/')}>
        Return Now
      </button>
    </div>
  );
}