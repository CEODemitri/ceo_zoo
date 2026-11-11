import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, signIn, signUp, authMode } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(authMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'signin') {
      const res = signIn(username, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed.');
      } else {
        setUsername('');
        setPassword('');
      }
    } else {
      const res = signUp(username, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed.');
      } else {
        setUsername('');
        setPassword('');
      }
    }
  };

  const handleQuickDemo = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    signIn(user, pass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
          <div>
            <h2 className="font-mono text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase">
              {mode === 'signin' ? 'OPERATOR SIGN IN' : 'REGISTER NEW OPERATOR'}
            </h2>
            <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Zoo // AUTHENTICATION PROTOCOL
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="font-mono text-sm px-2 py-1 text-neutral-500 hover:text-black dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 font-mono text-xs space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 font-mono text-[11px]">
              ERROR: {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase text-neutral-600 dark:text-neutral-400 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex.dev"
              className="w-full px-3 py-2 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-black dark:focus:border-white"
            />
            <span className="block text-[10px] text-neutral-400 mt-1">
              Single-word identifier or handle. No email needed.
            </span>
          </div>

          <div>
            <label className="block text-[11px] uppercase text-neutral-600 dark:text-neutral-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold uppercase tracking-wider text-xs"
          >
            {mode === 'signin' ? 'ENTER DASHBOARD' : 'CREATE ACCOUNT & SIGN IN'}
          </button>

          {/* Mode Switch */}
          <div className="pt-2 text-center border-t border-neutral-100 dark:border-neutral-900">
            {mode === 'signin' ? (
              <p className="text-neutral-500 text-[11px]">
                No account registered yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setMode('signup');
                  }}
                  className="text-neutral-900 dark:text-neutral-100 underline underline-offset-2 hover:font-bold"
                >
                  Create new username
                </button>
              </p>
            ) : (
              <p className="text-neutral-500 text-[11px]">
                Already have an operator account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setMode('signin');
                  }}
                  className="text-neutral-900 dark:text-neutral-100 underline underline-offset-2 hover:font-bold"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>

          {/* Quick preset switch */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400">
            <span>QUICK PRESETS:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('alex.dev', 'password123')}
                className="underline hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                alex.dev
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => handleQuickDemo('lead_architect', 'kern2026')}
                className="underline hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                lead_architect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
