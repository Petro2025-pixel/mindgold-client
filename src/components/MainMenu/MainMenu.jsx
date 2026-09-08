import React from 'react';
import { useTranslation } from 'react-i18next';
import './MainMenu.css';

/**
 * @typedef {Object} MenuItem
 * @property {string} id - Unique identifier for the menu card mode.
 * @property {string} badge - Category or tag text displayed above the title.
 * @property {string} title - Display title of the mode.
 * @property {string} desc - Brief description of the mode's functionality.
 * @property {string} actionText - Label for the call-to-action button/arrow.
 * @property {string} route - Internal navigation path associated with the mode.
 */

/**
 * MainMenu Component
 * 
 * Renders the primary navigation hub (MindHub) for selecting application modes 
 * such as Game Arena, Quiz Lab, Hall of Fame, and CheatSheet.
 * Supports multi-language translation via react-i18next.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {function(string): void} [props.onNavigate] - Callback function triggered when a menu item is clicked, passing the route string as an argument.
 * @returns {React.ReactElement} The rendered MindHub navigation menu.
 */
export const MainMenu = ({ onNavigate }) => {
  const { t } = useTranslation();

  /** @type {MenuItem[]} */
  const menuItems = [
    {
      id: 'game',
      badge: t('menu.game.badge'),
      title: t('menu.game.title'),
      desc: t('menu.game.desc'),
      actionText: t('menu.game.action'),
      route: '/game',
    },
    {
      id: 'editor',
      badge: t('menu.editor.badge'),
      title: t('menu.editor.title'),
      desc: t('menu.editor.desc'),
      actionText: t('menu.editor.action'),
      route: '/editor',
    },
    {
      id: 'leaderboard',
      badge: t('menu.leaderboard.badge'),
      title: t('menu.leaderboard.title'),
      desc: t('menu.leaderboard.desc'),
      actionText: t('menu.leaderboard.action'),
      route: '/leaderboard',
    },
    {
      id: 'cheatsheet',
      badge: t('menu.cheatsheet.badge'),
      title: t('menu.cheatsheet.title'),
      desc: t('menu.cheatsheet.desc'),
      actionText: t('menu.cheatsheet.action'),
      route: '/cheatsheet',
    },
  ];

  return (
    <div className="mindhub-container">
      <div className="mindhub-header">
        <h1 className="mindhub-title">{t('menu.title', 'MindGold')}</h1>
        <p className="mindhub-subtitle">{t('menu.subtitle', 'Interactive Knowledge Engine')}</p>
      </div>

      <div className="mindhub-grid">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="hub-card"
            onClick={() => onNavigate && onNavigate(item.route)}
          >
            <div>
              <div className="card-badge">{item.badge}</div>
              <div className="card-title">{item.title}</div>
              <div className="card-desc">{item.desc}</div>
            </div>
            <div className="card-footer">
              <span>{item.actionText}</span>
              <span className="card-arrow">➔</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};