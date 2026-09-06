import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, navigate]);

  return (
    <div className="not-found-page">
      <h1 className="not-found-code">404</h1>
      <p className="not-found-message">
        {t('notFound.message', 'The requested page does not exist.')}
      </p>
      <p className="not-found-timer">
        {t('notFound.redirecting', 'Redirecting to home in')} <span>{secondsLeft}</span>{' '}
        {t('notFound.sec', 'sec...')}
      </p>
      <button className="btn-hex" onClick={() => navigate('/')}>
        {t('notFound.returnNow', 'Return Now')}
      </button>
    </div>
  );
}