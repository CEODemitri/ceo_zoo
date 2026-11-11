import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface TopBarProps {
  onOpenAuditLog: () => void;
  onOpenNewProject: () => void;
  activeSection: 'all' | 'projects' | 'sprints';
  onSelectSection: (section: 'all' | 'projects' | 'sprints') => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenAuditLog,
  onOpenNewProject,
  activeSection,
  onSelectSection,
}) => {
  const { user, openAuthModal, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-0 sm:h-14 flex flex-wrap items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectSection('all');
            }}
            className="font-mono text-sm font-bold tracking-tight text-neutral-950 dark:text-neutral-50 whitespace-nowrap hover:opacity-80"
          >
            Zoo
          </a>
          <span className="hidden sm:inline font-mono text-[11px] text-neutral-400 dark:text-neutral-600">
            SYSTEM CONSOLE
          </span>
        </div>

        {/* Zone 2: Navigation Links (Desktop inline, Mobile wraps cleanly on second row with zero horizontal scroll) */}
        <nav className="order-3 md:order-2 w-full md:w-auto pt-1.5 md:pt-0 border-t md:border-t-0 border-neutral-100 dark:border-neutral-900 flex flex-wrap items-center justify-start gap-4 sm:gap-6 text-[11px] sm:text-xs font-mono">
          <button
            onClick={() => onSelectSection('all')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-none ${
              activeSection === 'all'
                ? 'border-neutral-900 text-neutral-950 dark:border-neutral-100 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => onSelectSection('projects')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-none ${
              activeSection === 'projects'
                ? 'border-neutral-900 text-neutral-950 dark:border-neutral-100 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
            }`}
          >
            Projects
          </button>

          <button
            onClick={() => onSelectSection('sprints')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-none ${
              activeSection === 'sprints'
                ? 'border-neutral-900 text-neutral-950 dark:border-neutral-100 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
            }`}
          >
            Current Sprints
          </button>

          <button
            onClick={onOpenAuditLog}
            className="whitespace-nowrap pb-0.5 border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-none"
          >
            Audit Log
          </button>
        </nav>

        {/* Zone 3: Actions & Profile */}
        <div className="order-2 md:order-3 flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="font-mono text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 uppercase tracking-tight"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? 'LIGHT' : 'DARK'}
          </button>

          {/* User Session Button */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden lg:flex flex-col text-right">
                <span className="font-mono text-xs text-neutral-900 dark:text-neutral-100 font-semibold leading-tight">
                  {user.username}
                </span>
                <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                  {user.role}
                </span>
              </div>
              <button
                onClick={signOut}
                className="font-mono text-[10px] sm:text-[11px] px-2 py-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 uppercase"
                title="Sign out of operator session"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="px-2.5 sm:px-3 py-1 font-mono text-[11px] sm:text-xs bg-neutral-900 hover:bg-black text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-950 font-medium uppercase tracking-wider"
            >
              SIGN IN
            </button>
          )}

          {/* New Project Primary CTA */}
          <button
            onClick={onOpenNewProject}
            className="hidden sm:inline-flex px-3.5 py-1.5 font-mono text-xs bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold uppercase tracking-wider"
          >
            + NEW PROJECT
          </button>
        </div>
      </div>
    </header>
  );
};
