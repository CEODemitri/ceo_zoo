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
    <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 px-3 sm:px-5 pt-2 pb-2 min-h-[180px] flex flex-col justify-between items-start text-left text-xs transition-none">
      {/* Top Edge: Stacked Left-Aligned Title & Edit Trigger */}
      <div className="w-full flex flex-col items-start justify-start space-y-1 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-start gap-2 leading-none">
          <span className="font-mono text-[11px] tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            SYSTEM DETAILS & CREDENTIALS
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300 font-semibold">
            {projectName}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="font-mono text-[11px] uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white underline underline-offset-2"
          >
            {isEditing ? '[ CANCEL EDIT ]' : '[ EDIT DETAILS ]'}
          </button>
        </div>
      </div>

      {/* Open Space in Middle of Container */}
      <div className="flex-1 min-h-[28px]" />

      {/* Bottom Edge: Stacked Left-Aligned Credential Rows */}
      {isEditing ? (
        <form onSubmit={handleSave} className="w-full pt-2 flex flex-col items-start space-y-2.5 text-left">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-neutral-500 dark:text-neutral-400 mb-0.5">
                Live Production Site URL
              </label>
              <input
                type="text"
                value={liveSite}
                onChange={(e) => setLiveSite(e.target.value)}
                className="w-full font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 text-neutral-900 dark:text-neutral-100 text-left"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-neutral-500 dark:text-neutral-400 mb-0.5">
                Hosted Platform / Cloud Provider
              </label>
              <input
                type="text"
                value={hostedCompany}
                onChange={(e) => setHostedCompany(e.target.value)}
                className="w-full font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 text-neutral-900 dark:text-neutral-100 text-left"
                placeholder="AWS, Vercel, Cloudflare, etc."
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-neutral-500 dark:text-neutral-400 mb-0.5">
                Admin Username / Operator ID
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 text-neutral-900 dark:text-neutral-100 text-left"
                placeholder="admin_username"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-neutral-500 dark:text-neutral-400 mb-0.5">
                Admin Password (Optional)
              </label>
              <input
                type="text"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 text-neutral-900 dark:text-neutral-100 text-left"
                placeholder="Secret password token"
              />
            </div>
          </div>

          <div className="w-full">
            <label className="block font-mono text-[10px] uppercase text-neutral-500 dark:text-neutral-400 mb-0.5">
              Infrastructure / Deployment Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 text-neutral-900 dark:text-neutral-100 text-left"
              placeholder="Deployment remarks, cluster topology, or security policies..."
            />
          </div>

          <div className="flex items-center justify-start gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 font-mono text-xs bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold uppercase"
            >
              SAVE DETAILS
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-1.5 font-mono text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 uppercase"
            >
              CANCEL
            </button>
          </div>
        </form>
      ) : (
        <div className="w-full pt-2 flex flex-col items-start justify-end space-y-1.5 font-mono text-xs text-left">
          {/* Row 1: Live Site & Hosted Platform */}
          <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-1 leading-none">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase text-neutral-400">LIVE SITE:</span>
              <a
                href={details.liveSite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-900 dark:text-neutral-100 font-semibold hover:underline"
              >
                {details.liveSite}
              </a>
              <button
                onClick={() => copyToClipboard(details.liveSite, 'site')}
                className="text-[10px] text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 uppercase underline"
              >
                [{copiedField === 'site' ? 'COPIED' : 'COPY'}]
              </button>
            </div>

            <span className="text-neutral-300 dark:text-neutral-700">·</span>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase text-neutral-400">HOSTED COMPANY:</span>
              <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                {details.hostedCompany}
              </span>
              <button
                onClick={() => copyToClipboard(details.hostedCompany, 'host')}
                className="text-[10px] text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 uppercase underline"
              >
                [{copiedField === 'host' ? 'COPIED' : 'COPY'}]
              </button>
            </div>
          </div>

          {/* Row 2: Admin Name & Admin Password */}
          <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-1 leading-none">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase text-neutral-400">ADMIN NAME:</span>
              <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                {details.adminName}
              </span>
              <button
                onClick={() => copyToClipboard(details.adminName, 'admin')}
                className="text-[10px] text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 uppercase underline"
              >
                [{copiedField === 'admin' ? 'COPIED' : 'COPY'}]
              </button>
            </div>

            <span className="text-neutral-300 dark:text-neutral-700">·</span>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase text-neutral-400">ADMIN PASSWORD:</span>
              <span className="text-neutral-800 dark:text-neutral-200 select-all">
                {details.adminPassword
                  ? showPassword
                    ? details.adminPassword
                    : '••••••••••••'
                  : 'N/A (Keys Enforced)'}
              </span>
              {details.adminPassword && (
                <>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 uppercase underline"
                  >
                    [{showPassword ? 'HIDE' : 'SHOW'}]
                  </button>
                  <button
                    onClick={() => copyToClipboard(details.adminPassword!, 'pass')}
                    className="text-[10px] text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 uppercase underline"
                  >
                    [{copiedField === 'pass' ? 'COPIED' : 'COPY'}]
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Row 3: Operations Note */}
          {details.notes && (
            <div className="flex flex-wrap items-baseline justify-start gap-1.5 pt-0.5 leading-tight">
              <span className="text-[10px] uppercase text-neutral-400">OPERATIONS NOTE:</span>
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
                {details.notes}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
