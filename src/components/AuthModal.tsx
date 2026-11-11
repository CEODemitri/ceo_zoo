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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-[#EFECE6] dark:bg-[#141417] text-[#181715] dark:text-[#F3F1EC] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#E5E0D6]/70 dark:bg-[#1E1E24]/70">
          <div>
            <h2 className="font-serif text-base sm:text-lg font-semibold tracking-tight text-[#181715] dark:text-[#F3F1EC]">
              {mode === 'signin' ? 'Operator Sign In' : 'Register New Operator'}
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8C867E] dark:text-[#6E6A63] mt-0.5">
              Zoo · STUDIO SESSION
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="font-mono text-sm px-2 py-1 text-[#5C5852] dark:text-[#A6A29A] hover:text-[#181715] dark:hover:text-[#F3F1EC]"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 font-mono text-xs space-y-4">
          {errorMessage && (
            <div className="p-3 bg-[#D94E28]/10 text-[#D94E28] dark:text-[#E85D36] font-mono text-[11px]">
              ERROR: {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-1">
              Username
            </label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex.dev"
              className="w-full px-3 py-2 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#D94E28] hover:bg-[#C2411E] dark:bg-[#E85D36] dark:hover:bg-[#D94E28] text-white font-semibold uppercase tracking-wider text-xs transition-colors"
          >
            {mode === 'signin' ? 'Enter Studio' : 'Create Account & Sign In'}
          </button>

          {/* Mode Switch */}
          <div className="pt-2 text-center border-t border-[#181715]/[0.07] dark:border-white/[0.06]">
            {mode === 'signin' ? (
              <p className="text-[#5C5852] dark:text-[#A6A29A] text-[11px]">
                No account registered yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setMode('signup');
                  }}
                  className="text-[#D94E28] dark:text-[#E85D36] underline underline-offset-2 font-semibold"
                >
                  Create new username
                </button>
              </p>
            ) : (
              <p className="text-[#5C5852] dark:text-[#A6A29A] text-[11px]">
                Already have an operator account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setMode('signin');
                  }}
                  className="text-[#D94E28] dark:text-[#E85D36] underline underline-offset-2 font-semibold"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
