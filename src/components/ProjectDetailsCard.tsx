import React, { useState } from 'react';
import { ProjectDetails } from '../types';

interface ProjectDetailsCardProps {
  details: ProjectDetails;
  projectId: string;
  projectName: string;
  onUpdateDetails: (updated: ProjectDetails) => void;
}

export const ProjectDetailsCard: React.FC<ProjectDetailsCardProps> = ({
  details,
  projectName,
  onUpdateDetails,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for editing
  const [liveSite, setLiveSite] = useState(details.liveSite);
  const [hostedCompany, setHostedCompany] = useState(details.hostedCompany);
  const [adminName, setAdminName] = useState(details.adminName);
  const [adminPassword, setAdminPassword] = useState(details.adminPassword || '');
  const [notes, setNotes] = useState(details.notes || '');

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 1800);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDetails({
      liveSite,
      hostedCompany,
      adminName,
      adminPassword,
      notes,
    });
    setIsEditing(false);
  };

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 p-4 sm:p-6 text-xs transition-none">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            SYSTEM DETAILS & CREDENTIALS
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
            {projectName}
          </span>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="font-mono text-[11px] uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white underline underline-offset-4"
        >
          {isEditing ? '[ CANCEL EDIT ]' : '[ EDIT DETAILS ]'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[11px] uppercase text-neutral-500 dark:text-neutral-400 mb-1">
              Live Production Site URL
            </label>
            <input
              type="text"
              value={liveSite}
              onChange={(e) => setLiveSite(e.target.value)}
              className="w-full font-mono text-xs px-3 py-2 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 text-neutral-900 dark:text-neutral-100"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase text-neutral-500 dark:text-neutral-400 mb-1">
              Hosted Platform / Cloud Provider
            </label>
            <input
              type="text"
              value={hostedCompany}
              onChange={(e) => setHostedCompany(e.target.value)}
              className="w-full font-mono text-xs px-3 py-2 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 text-neutral-900 dark:text-neutral-100"
              placeholder="AWS, Vercel, Cloudflare, etc."
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase text-neutral-500 dark:text-neutral-400 mb-1">
              Admin Username / Operator ID
            </label>
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full font-mono text-xs px-3 py-2 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 text-neutral-900 dark:text-neutral-100"
              placeholder="admin_username"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase text-neutral-500 dark:text-neutral-400 mb-1">
              Admin Password (Optional)
            </label>
            <input
              type="text"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full font-mono text-xs px-3 py-2 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 text-neutral-900 dark:text-neutral-100"
              placeholder="Secret password token"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-mono text-[11px] uppercase text-neutral-500 dark:text-neutral-400 mb-1">
              Infrastructure / Deployment Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full font-mono text-xs px-3 py-2 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 text-neutral-900 dark:text-neutral-100"
              placeholder="Deployment remarks, cluster topology, or security policies..."
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 font-mono text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-mono text-xs bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold"
            >
              SAVE DETAILS
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Live Site */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase text-neutral-500 dark:text-neutral-400 tracking-wider">
              LIVE SITE
            </span>
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-neutral-950 px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-800">
              <a
                href={details.liveSite}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-neutral-900 dark:text-neutral-100 hover:underline truncate"
                title={details.liveSite}
              >
                {details.liveSite.replace(/^https?:\/\//, '')}
              </a>
              <button
                onClick={() => copyToClipboard(details.liveSite, 'site')}
                className="font-mono text-[10px] text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 uppercase shrink-0"
              >
                {copiedField === 'site' ? 'COPIED' : 'COPY'}
              </button>
            </div>
          </div>

          {/* Hosted Company */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase text-neutral-500 dark:text-neutral-400 tracking-wider">
              HOSTED PLATFORM
            </span>
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-neutral-950 px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-800">
              <span className="font-mono text-neutral-800 dark:text-neutral-200 truncate">
                {details.hostedCompany}
              </span>
              <button
                onClick={() => copyToClipboard(details.hostedCompany, 'host')}
                className="font-mono text-[10px] text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 uppercase shrink-0"
              >
                {copiedField === 'host' ? 'COPIED' : 'COPY'}
              </button>
            </div>
          </div>

          {/* Admin Name */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase text-neutral-500 dark:text-neutral-400 tracking-wider">
              ADMIN NAME
            </span>
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-neutral-950 px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-800">
              <span className="font-mono text-neutral-800 dark:text-neutral-200 truncate">
                {details.adminName}
              </span>
              <button
                onClick={() => copyToClipboard(details.adminName, 'admin')}
                className="font-mono text-[10px] text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 uppercase shrink-0"
              >
                {copiedField === 'admin' ? 'COPIED' : 'COPY'}
              </button>
            </div>
          </div>

          {/* Admin Password */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase text-neutral-500 dark:text-neutral-400 tracking-wider">
              ADMIN PASSWORD
            </span>
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-neutral-950 px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-800">
              <span className="font-mono text-neutral-800 dark:text-neutral-200 truncate select-all">
                {details.adminPassword
                  ? showPassword
                    ? details.adminPassword
                    : '••••••••••••'
                  : 'N/A (Keys Enforced)'}
              </span>
              {details.adminPassword && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="font-mono text-[10px] text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 uppercase"
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                  <span className="text-neutral-300 dark:text-neutral-700">·</span>
                  <button
                    onClick={() => copyToClipboard(details.adminPassword!, 'pass')}
                    className="font-mono text-[10px] text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 uppercase"
                  >
                    {copiedField === 'pass' ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Deployment Remarks / Notes */}
          {details.notes && (
            <div className="md:col-span-2 lg:col-span-4 mt-1 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-start gap-2">
              <span className="font-mono text-[10px] uppercase text-neutral-400 tracking-wider shrink-0 mt-0.5">
                OPERATIONS NOTE:
              </span>
              <p className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {details.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
