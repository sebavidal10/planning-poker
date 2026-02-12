import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlanningPoker } from '../hooks/usePlanningPoker';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/Card';
import Modal from '../components/Modal';
import * as LucideIcons from 'lucide-react';
import {
  LogOut,
  Trash2,
  Play,
  RefreshCcw,
  Plus,
  Lock,
  X,
  Settings,
  ChevronRight,
  User,
  Coffee,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';

const decks = {
  fibonacci: [0, 1, 2, 3, 5, 8, '?', 'Coffee'],
  'modified-fibonacci': [0, 0.5, 1, 2, 3, 5, 8, '?', 'Coffee'],
  't-shirt': ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', 'Coffee'],
};

// Map Icon name to Lucide component
const IconComponent = ({ name, className }) => {
  const Icon = LucideIcons[name] || User;
  return <Icon className={className} />;
};

const App = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [userName, setUserName] = useState(
    sessionStorage.getItem('userName') || '',
  );
  const [isJoined, setIsJoined] = useState(
    !!sessionStorage.getItem('userName'),
  );
  const [selectedCard, setSelectedCard] = useState(null);

  const [editingRoundId, setEditingRoundId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Modal states
  const [modalType, setModalType] = useState(null); // 'kicked', 'error', 'confirmKick', 'confirmClose'
  const [modalData, setModalData] = useState(null);

  const {
    participants,
    room,
    owner,
    timer,
    isRevealed,
    error,
    rounds,
    activeRoundId,
    isKicked,
    actions,
  } = usePlanningPoker(isJoined ? slug : null, userName);

  useEffect(() => {
    if (userName) {
      sessionStorage.setItem('userName', userName);
    }
  }, [userName]);

  useEffect(() => {
    if (isKicked) {
      setIsJoined(false);
      sessionStorage.removeItem('userName');
      setUserName('');
      setModalType('kicked');
    }
  }, [isKicked]);

  useEffect(() => {
    if (error) {
      setModalType('error');
      setModalData(error);
    }
  }, [error]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setIsJoined(true);
    }
  };

  const handleVote = (vote) => {
    const activeRound = room?.rounds?.find((r) => r.id === activeRoundId);
    if (!room?.open || (activeRound && activeRound.finished)) {
      return;
    }

    setSelectedCard(vote);
    actions.selectVote(vote);
  };

  const activeRound = rounds.find((r) => r.id === activeRoundId);
  const isRoundLocked = activeRound?.finished;

  const currentDeck = room?.deckType
    ? decks[room.deckType]
    : decks['fibonacci'];
  const isOwner = owner === userName;

  const closeModals = () => {
    setModalType(null);
    setModalData(null);
    if (modalType === 'kicked' || modalType === 'error') {
      navigate('/');
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl shadow-xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                PokerPlanning
              </span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 font-bold text-xs uppercase"
              >
                {language}
              </button>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4 text-center">{t.join}</h3>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                {t.displayName}
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder={t.enterName}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition"
            >
              {t.join}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col overflow-hidden transition-colors duration-300 group/app">
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <IconComponent name="Layers" className="w-5 h-5" />
            </div>
            <span className="text-zinc-900 dark:text-white">
              <span className="text-indigo-600 dark:text-indigo-400">
                Poker
              </span>
              Planning
            </span>
          </div>
          <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700 hidden sm:block"></div>
          <div>
            <h1 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
              {room?.slug || t.loading}
            </h1>
            <div className="text-xs text-zinc-500 flex items-center gap-2">
              <>
                <span
                  className={`w-2 h-2 rounded-full ${room?.open ? 'bg-green-500' : 'bg-red-500'}`}
                />
                {room?.open ? t.votingOpen : t.votingClosed}
              </>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {timer !== null && (
            <div className="text-3xl font-mono font-bold text-indigo-500 dark:text-indigo-400 animate-pulse">
              {timer}s
            </div>
          )}

          <div className="flex gap-2 items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-lg"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs uppercase w-8 h-8 flex items-center justify-center border border-zinc-200 dark:border-zinc-700"
            >
              {language}
            </button>
          </div>

          <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700 hidden sm:block"></div>

          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={actions.revealVotes}
                disabled={isRevealed || participants.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                <Play size={16} />
                {t.revealCards}
              </button>
              <button
                onClick={actions.resetRound}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-lg text-sm font-medium transition"
              >
                <RefreshCcw size={16} />
                {t.reset}
              </button>
            </div>
          )}

          <div className="dropdown relative group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg cursor-pointer">
              <IconComponent
                name={
                  participants.find((p) => p.name === userName)?.avatar ||
                  'User'
                }
                className="w-6 h-6"
              />
            </div>

            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                  {userName}
                </p>
              </div>
              <button
                onClick={() => {
                  actions.leaveRoom();
                  sessionStorage.removeItem('userName');
                  setIsJoined(false);
                  setUserName('');
                  navigate('/');
                }}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={14} />
                {t.leave}
              </button>
              {isOwner && (
                <button
                  onClick={() => setModalType('confirmClose')}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-zinc-200 dark:border-zinc-800"
                >
                  <X size={14} />
                  {t.closeRoom}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Table Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)] pointer-events-none" />

          {/* Round Status Banner */}
          {isRoundLocked && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-bold shadow-sm flex items-center gap-2">
              <Lock size={14} />
              {t.roundLocked}
            </div>
          )}

          {/* Table */}
          <div className="relative w-full max-w-4xl aspect-[2/1] bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-[100px] flex items-center justify-center mb-32 shadow-2xl transition-colors duration-300">
            <div className="absolute inset-0 bg-white/50 dark:bg-zinc-950/40 rounded-[100px] backdrop-blur-sm" />

            <div className="relative z-10 text-center">
              {isRevealed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="text-sm uppercase tracking-widest text-zinc-500 mb-2 font-semibold">
                    {t.average}
                  </div>
                  <div className="text-7xl font-bold text-zinc-900 dark:text-white">
                    {(() => {
                      const numericVotes = participants
                        .map((p) => p.vote)
                        .filter((v) => typeof v === 'number');
                      if (numericVotes.length === 0) return '-';
                      const avg =
                        numericVotes.reduce((a, b) => a + b, 0) /
                        numericVotes.length;
                      return Number.isInteger(avg) ? avg : avg.toFixed(1);
                    })()}
                  </div>
                </motion.div>
              ) : (
                <div className="text-zinc-600 dark:text-zinc-400 font-medium text-lg">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold text-2xl">
                    {participants.filter((p) => p.hasVoted).length}
                  </span>
                  <span className="mx-1">/</span>
                  <span>
                    {participants.length} {t.voted}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Participants Grid */}
          <AnimatePresence>
            {participants.map((participant, index) => {
              const total = participants.length;
              const angle = index * (360 / total) - 90;
              const isActive = participant.name === userName;

              return (
                <motion.div
                  key={participant.name}
                  className="absolute top-1/2 left-1/2 w-20 h-20 -ml-10 -mt-10 flex flex-col items-center justify-center pointer-events-auto"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: `${Math.cos(angle * (Math.PI / 180)) * 260}px`,
                    y: `${Math.sin(angle * (Math.PI / 180)) * 160}px`,
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                  {/* Card Back or Value */}
                  <div className="mb-2 relative group">
                    <motion.div
                      animate={{
                        rotateY:
                          isRevealed || (isActive && selectedCard) ? 0 : 180,
                      }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-16 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-xl perspective-1000"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front (Value) */}
                      <div
                        className="absolute inset-0 backface-hidden bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        {participant.vote === 'Coffee' ? (
                          <Coffee size={20} />
                        ) : participant.vote === '?' ? (
                          <HelpCircle size={20} />
                        ) : (
                          participant.vote
                        )}
                      </div>

                      {/* Back (Cover) */}
                      <div
                        className="absolute inset-0 backface-hidden bg-white dark:bg-zinc-800 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        {participant.hasVoted && (
                          <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        )}
                      </div>
                    </motion.div>

                    {/* Kick Button (Owner Only) */}
                    {isOwner && !isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalType('confirmKick');
                          setModalData(participant.name);
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md text-xs font-bold"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    )}
                  </div>

                  {/* Name Label & Avatar */}
                  <div
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md shadow-lg border transition-colors 
                        ${isActive ? 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-200' : 'bg-white/80 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400'}`}
                  >
                    <IconComponent
                      name={participant.avatar || 'User'}
                      className="w-3.5 h-3.5"
                    />
                    <span>{participant.name}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </main>

        {/* Rounds Sidebar (Right Panel) */}
        <aside className="hidden lg:flex w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 flex-col transition-colors duration-300">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white/50 dark:bg-transparent">
            <h3 className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <IconComponent name="Hash" className="w-4 h-4 text-indigo-500" />
              {t.rounds}
            </h3>
            {isOwner && (
              <button
                onClick={actions.addRound}
                className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg transition font-semibold"
              >
                <Plus size={14} />
                {t.addRound}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {rounds.map((round) => {
              const isActive = round.id === activeRoundId;
              const isEditing = editingRoundId === round.id;

              return (
                <div
                  key={round.id}
                  onClick={() => !isEditing && actions.switchRound(round.id)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/50 shadow-sm'
                      : 'bg-white dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800/50 hover:border-zinc-200 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => {
                          actions.updateRound(round.id, editingTitle);
                          setEditingRoundId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            actions.updateRound(round.id, editingTitle);
                            setEditingRoundId(null);
                          }
                        }}
                        className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white text-sm px-2 py-1 rounded border border-indigo-500 w-full outline-none"
                      />
                    ) : (
                      <span
                        className={`text-sm font-bold truncate pr-2 ${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-zinc-700 dark:text-zinc-300'}`}
                        onDoubleClick={() => {
                          if (isOwner) {
                            setEditingRoundId(round.id);
                            setEditingTitle(round.title);
                          }
                        }}
                      >
                        {round.title}
                      </span>
                    )}
                    {round.finished && (
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded-full min-w-[2rem] text-center">
                        {round.result}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <div className="text-[10px] items-center gap-1 flex text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      {t.activeRound}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Footer / Hand */}
      <footer className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 z-50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
          {currentDeck &&
            currentDeck.map((val) => (
              <Card
                key={val}
                value={val}
                onSelect={handleVote}
                isSelected={selectedCard === val}
                disabled={!room?.open || isRevealed || isRoundLocked}
              />
            ))}
        </div>
      </footer>

      {/* Modals */}
      <Modal
        isOpen={modalType === 'kicked'}
        onClose={closeModals}
        title={t.kick || 'Kicked'}
      >
        <p>{t.kickMessage || 'You have been kicked from the room.'}</p>
      </Modal>

      <Modal
        isOpen={modalType === 'error'}
        onClose={closeModals}
        title={t.error || 'Error'}
      >
        <p>{modalData}</p>
      </Modal>

      <Modal
        isOpen={modalType === 'confirmKick'}
        onClose={() => setModalType(null)}
        title={t.kick || 'Kick Participant'}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 font-medium"
            >
              {t.cancel || 'Cancel'}
            </button>
            <button
              onClick={() => {
                actions.kickParticipant(modalData);
                setModalType(null);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition"
            >
              {t.kick || 'Kick'}
            </button>
          </div>
        }
      >
        <p>
          ¿Estás seguro de que deseas expulsar a <strong>{modalData}</strong>?
        </p>
      </Modal>

      <Modal
        isOpen={modalType === 'confirmClose'}
        onClose={() => setModalType(null)}
        title={t.closeRoom || 'Close Room'}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 font-medium"
            >
              {t.cancel || 'Cancel'}
            </button>
            <button
              onClick={() => {
                actions.closeRoom();
                setModalType(null);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition"
            >
              {t.closeRoom || 'Close'}
            </button>
          </div>
        }
      >
        <p>
          ¿Estás seguro de que deseas cerrar la sala? Todos serán desconectados.
        </p>
      </Modal>
    </div>
  );
};

export default App;
