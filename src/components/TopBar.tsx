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
          {/* Theme Toggle Slider Button (Icons only: Sun + Blue Sky & Cloud in Light Mode, Moon + Starry Night in Dark Mode) */}
          <button
            type="button"
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className={`relative inline-flex items-center w-14 h-7 p-0.5 rounded-full overflow-hidden shrink-0 cursor-pointer select-none transition-colors duration-300 border ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-[#0B1026] via-[#151D3B] to-[#1E2952] border-white/15'
                : 'bg-gradient-to-r from-[#4AA3E5] via-[#6BB8F0] to-[#8CCDF8] border-[#181715]/10'
            }`}
          >
            {/* Background Track Scenery: Blue Sky & Clouds (Light Mode) */}
            <span
              aria-hidden="true"
              className={`absolute inset-0 flex items-center justify-end pr-2 pointer-events-none transition-opacity duration-300 ${
                theme === 'dark' ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <svg
                width="24"
                height="16"
                viewBox="0 0 24 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Back soft cloud */}
                <path
                  d="M14.5 6.5C14.8 4.8 16.3 3.5 18.1 3.5C20.1 3.5 21.8 5.1 21.8 7.1C22.8 7.3 23.5 8.2 23.5 9.2C23.5 10.4 22.5 11.4 21.3 11.4H13.8C12.8 11.4 12 10.6 12 9.6C12 8.7 12.7 7.9 13.6 7.8C13.8 7.1 14.1 6.7 14.5 6.5Z"
                  fill="white"
                  fillOpacity="0.65"
                />
                {/* Foreground crisp cloud */}
                <path
                  d="M6.2 9.2C6.6 7.1 8.4 5.6 10.6 5.6C12.9 5.6 14.8 7.3 15.1 9.5C16.3 9.7 17.2 10.7 17.2 12C17.2 13.4 16.1 14.5 14.7 14.5H5.2C3.9 14.5 2.8 13.4 2.8 12.1C2.8 10.9 3.7 9.9 4.9 9.7C5.3 9.4 5.7 9.2 6.2 9.2Z"
                  fill="white"
                  fillOpacity="0.95"
                />
              </svg>
            </span>

            {/* Background Track Scenery: Starry Night (Dark Mode) */}
            <span
              aria-hidden="true"
              className={`absolute inset-0 flex items-center justify-start pl-2 pointer-events-none transition-opacity duration-300 ${
                theme === 'dark' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <svg
                width="26"
                height="18"
                viewBox="0 0 26 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* 4-point sparkle star 1 */}
                <path
                  d="M6 2.5L6.7 4.6L8.8 5.3L6.7 6L6 8.1L5.3 6L3.2 5.3L5.3 4.6L6 2.5Z"
                  fill="#FFF6D6"
                />
                {/* 4-point sparkle star 2 */}
                <path
                  d="M15.5 9.5L16 11L17.5 11.5L16 12L15.5 13.5L15 12L13.5 11.5L15 11L15.5 9.5Z"
                  fill="#E2E8F0"
                />
                {/* Star dots */}
                <circle cx="13" cy="4.5" r="1" fill="#FFF6D6" fillOpacity="0.9" />
                <circle cx="20.5" cy="6" r="0.8" fill="white" fillOpacity="0.75" />
                <circle cx="9.5" cy="13.5" r="0.9" fill="white" fillOpacity="0.8" />
                <circle cx="4" cy="12" r="0.7" fill="#FFF6D6" fillOpacity="0.65" />
              </svg>
            </span>

            {/* Sliding Toggle Thumb: Sun in Light Mode, Crescent Moon in Dark Mode */}
            <span
              aria-hidden="true"
              className={`relative z-10 w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-sm transform transition-transform duration-300 ${
                theme === 'dark'
                  ? 'translate-x-7 bg-[#1E2640] ring-1 ring-white/20'
                  : 'translate-x-0 bg-[#FFFDF7] ring-1 ring-[#F59E0B]/40'
              }`}
            >
              {theme === 'dark' ? (
                /* Moon Icon */
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646Z"
                    fill="#FDE68A"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                /* Sun Icon */
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="5" fill="#F59E0B" />
                  <path
                    d="M12 2V4.5M12 19.5V22M4.93 4.93L6.7 6.7M17.3 17.3L19.07 19.07M2 12H4.5M19.5 12H22M4.93 19.07L6.7 17.3M17.3 6.7L19.07 4.93"
                    stroke="#D97706"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
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
