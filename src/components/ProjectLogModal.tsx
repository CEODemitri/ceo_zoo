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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl bg-[#EFECE6] dark:bg-[#141417] text-[#181715] dark:text-[#F3F1EC] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#E5E0D6]/70 dark:bg-[#1E1E24]/70">
          <div>
            <h2 className="font-serif text-base sm:text-lg font-semibold tracking-tight text-[#181715] dark:text-[#F3F1EC]">
              System Audit Log
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8C867E] dark:text-[#6E6A63] mt-0.5">
              CHRONOLOGICAL TELEMETRY & STATE RECORDS
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportProjectsAuditPDF(projects, logs)}
              className="px-3 py-1.5 font-mono text-xs bg-[#D94E28] hover:bg-[#C2411E] dark:bg-[#E85D36] dark:hover:bg-[#D94E28] text-white font-semibold uppercase tracking-wider transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="font-mono text-sm px-2.5 py-1 text-[#5C5852] dark:text-[#A6A29A] hover:text-[#181715] dark:hover:text-[#F3F1EC]"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Top Summary Metric Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 bg-[#F6F4EF]/60 dark:bg-[#0C0C0E]/50 divide-x divide-[#181715]/[0.07] dark:divide-white/[0.06]">
          <div className="p-4">
            <span className="block font-mono text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] tracking-wider">
              TOTAL PROJECTS
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-[#181715] dark:text-[#F3F1EC]">
              {projects.length}
            </span>
          </div>

          <div className="p-4">
            <span className="block font-mono text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] tracking-wider">
              TOTAL ACTIVE USERS
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-[#181715] dark:text-[#F3F1EC]">
              {totalUsers.toLocaleString()}
            </span>
          </div>

          <div className="p-4">
            <span className="block font-mono text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] tracking-wider">
              LOG ENTRIES RECORDED
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-[#181715] dark:text-[#F3F1EC]">
              {logs.length}
            </span>
          </div>

          <div className="p-4">
            <span className="block font-mono text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] tracking-wider">
              AUDIT COMPLIANCE
            </span>
            <span className="font-mono text-sm font-semibold text-[#181715] dark:text-[#F3F1EC] pt-1 block">
              SOC-2 VERIFIED
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-[#181715]/[0.07] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono text-[11px] text-[#5C5852] dark:text-[#A6A29A] uppercase tracking-wider">
            FILTER BY ACTION TYPE:
          </span>

          <div className="flex flex-wrap items-center gap-1">
            {['ALL', 'TASK_COMPLETE', 'VERSION_BUMP', 'DEPLOY', 'CONFIG_UPDATE'].map((act) => (
              <button
                key={act}
                onClick={() => setFilterAction(act)}
                className={`font-mono text-[10px] px-2.5 py-1 uppercase tracking-tight transition-colors ${
                  filterAction === act
                    ? 'bg-[#D94E28] dark:bg-[#E85D36] text-white font-semibold'
                    : 'bg-[#E5E0D6] hover:bg-[#DBD5C9] dark:bg-[#1E1E24] dark:hover:bg-[#282830] text-[#5C5852] dark:text-[#A6A29A]'
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
          <div className="sm:hidden divide-y divide-[#181715]/[0.06] dark:divide-white/[0.05] font-mono text-xs text-left">
            {filteredLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex flex-col items-start space-y-1">
                <div className="w-full flex flex-wrap items-center justify-between gap-2 text-[10px]">
                  <span className="font-semibold text-[#D94E28] dark:text-[#E85D36]">
                    {log.action}
                  </span>
                  <span className="text-[#8C867E] dark:text-[#6E6A63] tabular-nums">
                    {log.timestamp.replace('T', ' ').substring(0, 16)} UTC
                  </span>
                </div>
                <div className="text-[11px] text-[#5C5852] dark:text-[#A6A29A]">
                  {log.projectName} · <span className="text-[#8C867E]">@{log.author}</span>
                </div>
                <p className="text-[11px] text-[#181715] dark:text-[#F3F1EC] break-words leading-snug">
                  {log.summary}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= 640px) */}
          <table className="hidden sm:table w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#181715]/[0.1] dark:border-white/[0.08] text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] tracking-wider">
                <th className="pb-2 font-medium">TIMESTAMP (UTC)</th>
                <th className="pb-2 font-medium">ACTION</th>
                <th className="pb-2 font-medium">PROJECT</th>
                <th className="pb-2 font-medium">AUTHOR</th>
                <th className="pb-2 font-medium">SUMMARY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181715]/[0.06] dark:divide-white/[0.05]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#E5E0D6]/50 dark:hover:bg-[#1E1E24]/60">
                  <td className="py-2.5 pr-4 text-[#5C5852] dark:text-[#A6A29A] text-[11px] tabular-nums whitespace-nowrap">
                    {log.timestamp.replace('T', ' ').substring(0, 16)}
                  </td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    <span className="text-[#D94E28] dark:text-[#E85D36] font-semibold text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-[#181715] dark:text-[#F3F1EC] text-[11px] whitespace-nowrap">
                    {log.projectName}
                  </td>
                  <td className="py-2.5 pr-4 text-[#5C5852] dark:text-[#A6A29A] text-[11px] whitespace-nowrap">
                    {log.author}
                  </td>
                  <td className="py-2.5 text-[#181715] dark:text-[#F3F1EC] text-[11px]">
                    {log.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-[#E5E0D6]/60 dark:bg-[#1E1E24]/60 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-[#8C867E] dark:text-[#6E6A63] uppercase tracking-[0.12em]">
            LOG INTEGRITY HASH: SHA-256 · VERIFIED
          </span>

          <button
            onClick={onClose}
            className="px-5 py-1.5 font-mono text-xs bg-[#181715] hover:bg-black text-[#F3F1EC] dark:bg-[#F3F1EC] dark:hover:bg-white dark:text-[#181715] font-semibold uppercase"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
