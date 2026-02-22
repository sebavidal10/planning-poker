import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Home = () => {
  const [instanceName, setInstanceName] = useState('');
  const [deckType, setDeckType] = useState('fibonacci');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!instanceName) {
      setError('Please enter a room name.');
      return;
    }

    setLoading(true);
    const cleanSlug = instanceName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/rooms`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: cleanSlug, deckType }),
        },
      );

      if (response.ok) {
        navigate(`/${cleanSlug}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error creating room');
      }
    } catch (err) {
      setError('Connection failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden relative transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md w-full bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-2xl transition-colors duration-300"
      >
        <div className="text-center mb-8 relative">
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-40 h-40 relative"
            >
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl -z-10" />
              <img
                src={process.env.PUBLIC_URL + '/logo.png'}
                alt="Poker Planning Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>
          </div>
          <div className="absolute -top-4 -right-4 flex gap-2 z-50">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-sm transition-colors"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 font-bold text-xs uppercase w-8 h-8 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 transition-colors"
            >
              {language}
            </button>
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
            PokerPlanning
          </h1>
          <p className="text-zinc-500">
            {t.subtitle || 'Create a room and start estimating.'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
              {t.roomName || 'Room Name'}
            </label>
            <input
              type="text"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              placeholder={t.roomPlaceholder || 'e.g. Sprint 23 Planning'}
              className="w-full bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
              {t.deckType || 'Deck Type'}
            </label>
            <select
              value={deckType}
              onChange={(e) => setDeckType(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none transition-all font-medium"
            >
              <option value="fibonacci">Fibonacci (0, 1, 2, 3, 5, 8...)</option>
              <option value="modified-fibonacci">
                Modified (0, ½, 1, 2, 3, 5...)
              </option>
              <option value="t-shirt">T-Shirt (XS, S, M, L, XL)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.creating || 'Creating...'}
              </span>
            ) : (
              t.createRoom || 'Create Room'
            )}
          </button>
        </form>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-center"
      >
        <a
          href="https://github.com/sponsors/sebavidal10"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center gap-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          <div className="flex items-center gap-2 font-medium text-sm">
            <span className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors group-hover:border-zinc-300 dark:group-hover:border-zinc-700">
              ❤️
            </span>
            {t.buyMeACoffee}
          </div>
          <p className="text-[10px] text-zinc-600 dark:text-zinc-500 font-medium px-4">
            {t.buyMeACoffeeMessage}
          </p>
        </a>
      </motion.footer>
    </div>
  );
};

export default Home;
