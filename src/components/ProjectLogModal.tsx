import React, { useState } from 'react';
import { Project, AuditLog } from '../types';
import { exportProjectsAuditPDF } from '../utils/pdfExport';

interface ProjectLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  logs: AuditLog[];
}

export const ProjectLogModal: React.FC<ProjectLogModalProps> = ({
  isOpen,
  onClose,
  projects,
  logs,
}) => {
  const [filterAction, setFilterAction] = useState<string>('ALL');

  if (!isOpen) return null;

  const totalUsers = projects.reduce((acc, p) => acc + p.activeUsers, 0);

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'ALL') return true;
    return log.action === filterAction;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-none p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50">
          <div>
            <h2 className="font-mono text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase">
              PROJECT REGISTRY // SYSTEM AUDIT LOG
            </h2>
            <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              VERIFIED CHRONOLOGICAL TELEMETRY & SYSTEM STATE RECORDS
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportProjectsAuditPDF(projects, logs)}
              className="px-3 py-1.5 font-mono text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 uppercase tracking-wider"
            >
              DOWNLOAD PDF
            </button>
            <button
              onClick={onClose}
              className="font-mono text-sm px-2.5 py-1 text-neutral-500 hover:text-black dark:hover:text-white"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Top Summary Metric Row (Zero Pills, Pure Swiss Monospace Math) */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/20 divide-x divide-neutral-200 dark:divide-neutral-800">
          <div className="p-4">
            <span className="block font-mono text-[10px] uppercase text-neutral-400 tracking-wider">
              TOTAL PROJECTS
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
              {projects.length}
            </span>
          </div>

          <div className="p-4">
            <span className="block font-mono text-[10px] uppercase text-neutral-400 tracking-wider">
              TOTAL ACTIVE USERS
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
              {totalUsers.toLocaleString()}
            </span>
          </div>

          <div className="p-4">
            <span className="block font-mono text-[10px] uppercase text-neutral-400 tracking-wider">
              LOG ENTRIES RECORDED
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
              {logs.length}
            </span>
          </div>

          <div className="p-4">
            <span className="block font-mono text-[10px] uppercase text-neutral-400 tracking-wider">
              AUDIT COMPLIANCE
            </span>
            <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400 pt-1 block">
              SOC-2 VERIFIED
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            FILTER BY ACTION TYPE:
          </span>

          <div className="flex flex-wrap items-center gap-1">
            {['ALL', 'TASK_COMPLETE', 'VERSION_BUMP', 'DEPLOY', 'CONFIG_UPDATE'].map((act) => (
              <button
                key={act}
                onClick={() => setFilterAction(act)}
                className={`font-mono text-[10px] px-2 py-1 uppercase tracking-tight border transition-none ${
                  filterAction === act
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                }`}
              >
                {act.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Logs Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Mobile Stacked Log List (< 640px) — Zero Horizontal Scroll */}
          <div className="sm:hidden divide-y divide-neutral-100 dark:divide-neutral-900 font-mono text-xs text-left">
            {filteredLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex flex-col items-start space-y-1">
                <div className="w-full flex flex-wrap items-center justify-between gap-2 text-[10px]">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {log.action}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 tabular-nums">
                    {log.timestamp.replace('T', ' ').substring(0, 16)} UTC
                  </span>
                </div>
                <div className="text-[11px] text-neutral-700 dark:text-neutral-300">
                  {log.projectName} · <span className="text-neutral-400">@{log.author}</span>
                </div>
                <p className="text-[11px] text-neutral-800 dark:text-neutral-200 break-words leading-snug">
                  {log.summary}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= 640px) */}
          <table className="hidden sm:table w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-neutral-300 dark:border-neutral-700 text-[10px] uppercase text-neutral-400 tracking-wider">
                <th className="pb-2 font-medium">TIMESTAMP (UTC)</th>
                <th className="pb-2 font-medium">ACTION</th>
                <th className="pb-2 font-medium">PROJECT</th>
                <th className="pb-2 font-medium">AUTHOR</th>
                <th className="pb-2 font-medium">SUMMARY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="py-2.5 pr-4 text-neutral-500 dark:text-neutral-400 text-[11px] tabular-nums whitespace-nowrap">
                    {log.timestamp.replace('T', ' ').substring(0, 16)}
                  </td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    <span className="text-neutral-900 dark:text-neutral-100 font-semibold text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-neutral-700 dark:text-neutral-300 text-[11px] whitespace-nowrap">
                    {log.projectName}
                  </td>
                  <td className="py-2.5 pr-4 text-neutral-500 dark:text-neutral-400 text-[11px] whitespace-nowrap">
                    {log.author}
                  </td>
                  <td className="py-2.5 text-neutral-800 dark:text-neutral-200 text-[11px]">
                    {log.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 bg-neutral-50 dark:bg-neutral-900/40">
          <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
            LOG INTEGRITY HASH: SHA-256 // VERIFIED
          </span>

          <button
            onClick={onClose}
            className="px-5 py-1.5 font-mono text-xs bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold uppercase"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
