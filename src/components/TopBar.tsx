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
    <header className="sticky top-0 z-40 bg-[#F6F4EF]/92 dark:bg-[#0C0C0E]/92 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-12 py-2.5 sm:py-0 sm:h-15 flex flex-wrap items-center justify-between gap-2 sm:gap-8">
        {/* Zone 1: Single-Element Brand Wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectSection('all');
          }}
          className="font-serif text-lg sm:text-xl font-semibold tracking-tight text-[#181715] dark:text-[#F3F1EC] whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity"
        >
          Zoo
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="order-3 md:order-2 w-full md:w-auto pt-1.5 md:pt-0 flex flex-wrap items-center justify-start gap-5 sm:gap-7 text-xs font-medium">
          <button
            onClick={() => onSelectSection('all')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              activeSection === 'all'
                ? 'border-[#D94E28] dark:border-[#E85D36] text-[#181715] dark:text-[#F3F1EC] font-semibold'
                : 'border-transparent text-[#5C5852] hover:text-[#181715] dark:text-[#A6A29A] dark:hover:text-[#F3F1EC]'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => onSelectSection('projects')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              activeSection === 'projects'
                ? 'border-[#D94E28] dark:border-[#E85D36] text-[#181715] dark:text-[#F3F1EC] font-semibold'
                : 'border-transparent text-[#5C5852] hover:text-[#181715] dark:text-[#A6A29A] dark:hover:text-[#F3F1EC]'
            }`}
          >
            Projects
          </button>

          <button
            onClick={() => onSelectSection('sprints')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              activeSection === 'sprints'
                ? 'border-[#D94E28] dark:border-[#E85D36] text-[#181715] dark:text-[#F3F1EC] font-semibold'
                : 'border-transparent text-[#5C5852] hover:text-[#181715] dark:text-[#A6A29A] dark:hover:text-[#F3F1EC]'
            }`}
          >
            Current Sprints
          </button>

          <button
            onClick={onOpenAuditLog}
            className="whitespace-nowrap shrink-0 pb-1 border-b-2 border-transparent text-[#5C5852] hover:text-[#181715] dark:text-[#A6A29A] dark:hover:text-[#F3F1EC] transition-colors"
          >
            Audit Log
          </button>
        </nav>

        {/* Zone 3: Actions & Profile */}
        <div className="order-2 md:order-3 flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="font-mono text-[11px] px-2.5 py-1.5 bg-[#E5E0D6] hover:bg-[#DBD5C9] dark:bg-[#1E1E24] dark:hover:bg-[#282830] text-[#181715] dark:text-[#F3F1EC] uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {/* User Session Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex flex-col text-right">
                <span className="font-mono text-xs text-[#181715] dark:text-[#F3F1EC] font-semibold leading-tight">
                  {user.username}
                </span>
                <span className="font-mono text-[10px] text-[#8C867E] dark:text-[#6E6A63] leading-tight">
                  {user.role}
                </span>
              </div>
              <button
                onClick={signOut}
                className="font-mono text-[11px] px-2.5 py-1.5 bg-[#E5E0D6] hover:bg-[#DBD5C9] dark:bg-[#1E1E24] dark:hover:bg-[#282830] text-[#5C5852] dark:text-[#A6A29A] hover:text-[#181715] dark:hover:text-[#F3F1EC] uppercase whitespace-nowrap shrink-0 transition-colors"
                title="Sign out of operator session"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('signin')}
                className="font-mono text-[11px] px-2.5 py-1.5 bg-[#E5E0D6] hover:bg-[#DBD5C9] dark:bg-[#1E1E24] dark:hover:bg-[#282830] text-[#181715] dark:text-[#F3F1EC] uppercase whitespace-nowrap shrink-0 transition-colors"
                title="Login to operator session"
              >
                Login
              </button>
            </div>
          )}

          {/* New Project Primary Signal CTA */}
          <button
            onClick={onOpenNewProject}
            className="hidden sm:inline-flex px-3.5 py-1.5 font-mono text-xs bg-[#D94E28] hover:bg-[#C2411E] dark:bg-[#E85D36] dark:hover:bg-[#D94E28] text-white font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors"
          >
            + New Project
          </button>
        </div>
      </div>
    </header>
  );
};
