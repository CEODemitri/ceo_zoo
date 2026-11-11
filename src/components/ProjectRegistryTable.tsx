import React from 'react';
import { Project, AuditLog } from '../types';
import { exportProjectsAuditPDF } from '../utils/pdfExport';

interface ProjectRegistryTableProps {
  projects: Project[];
  logs: AuditLog[];
  onOpenLogModal: () => void;
  onOpenNewProject: () => void;
  onSelectProject: (projectId: string) => void;
  onBumpVersion: (projectId: string, type: 'patch' | 'minor') => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectRegistryTable: React.FC<ProjectRegistryTableProps> = ({
  projects,
  logs,
  onOpenLogModal,
  onOpenNewProject,
  onSelectProject,
  onBumpVersion,
  onDeleteProject,
}) => {
  const totalUsers = projects.reduce((acc, p) => acc + p.activeUsers, 0);

  return (
    <section className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      {/* Section Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-mono text-sm sm:text-base font-bold tracking-tight text-neutral-950 dark:text-neutral-50 uppercase">
            01. PROJECT REGISTRY // REPOSITORY INDEX
          </h2>
          <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            CENTRAL INVENTORY · BUSINESS CLASSIFICATION · VERSION TELEMETRY · GLOBAL REACH
          </p>
        </div>

        {/* Section Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenLogModal}
            className="px-3 py-1.5 font-mono text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 uppercase tracking-wide transition-none"
            title="Inspect chronological deployment and change log records"
          >
            VIEW AUDIT LOG MODAL
          </button>

          <button
            onClick={() => exportProjectsAuditPDF(projects, logs)}
            className="px-3 py-1.5 font-mono text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 uppercase tracking-wide transition-none"
            title="Export official PDF compliance document"
          >
            DOWNLOAD PDF
          </button>

          <button
            onClick={onOpenNewProject}
            className="px-3.5 py-1.5 font-mono text-xs bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold uppercase tracking-wider transition-none sm:hidden"
          >
            + ADD
          </button>
        </div>
      </div>

      {/* Registry Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/40 text-[10px] uppercase text-neutral-500 dark:text-neutral-400 tracking-wider">
              <th className="py-3 px-4 sm:px-6 font-semibold">PROJECT NAME</th>
              <th className="py-3 px-4 font-semibold">BUSINESS TYPE</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">START DATE</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">VERSION</th>
              <th className="py-3 px-4 text-right font-semibold whitespace-nowrap">ACTIVE USERS</th>
              <th className="py-3 px-4 sm:px-6 text-right font-semibold">OPERATIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
            {projects.map((proj) => (
              <tr
                key={proj.id}
                className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/30 transition-none group"
              >
                {/* Project Name */}
                <td className="py-3.5 px-4 sm:px-6">
                  <div className="flex flex-col">
                    <button
                      onClick={() => onSelectProject(proj.id)}
                      className="text-left font-semibold text-neutral-950 dark:text-neutral-50 hover:underline text-xs sm:text-sm"
                    >
                      {proj.name}
                    </button>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate max-w-xs">
                      {proj.details.liveSite.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                </td>

                {/* Business Type */}
                <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                  {proj.businessType}
                </td>

                {/* Start Date */}
                <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400 tabular-nums whitespace-nowrap">
                  {proj.startDate}
                </td>

                {/* Version Number with bump triggers */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                      {proj.version}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-none flex items-center gap-1 text-[10px]">
                      <button
                        onClick={() => onBumpVersion(proj.id, 'patch')}
                        className="text-neutral-400 hover:text-black dark:hover:text-white underline"
                        title="Bump patch version (+0.0.1)"
                      >
                        +patch
                      </button>
                      <span className="text-neutral-300 dark:text-neutral-700">·</span>
                      <button
                        onClick={() => onBumpVersion(proj.id, 'minor')}
                        className="text-neutral-400 hover:text-black dark:hover:text-white underline"
                        title="Bump minor version (+0.1.0)"
                      >
                        +minor
                      </button>
                    </div>
                  </div>
                </td>

                {/* Number of Users */}
                <td className="py-3.5 px-4 text-right font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums whitespace-nowrap">
                  {proj.activeUsers.toLocaleString()}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-3 text-neutral-500 dark:text-neutral-400 text-xs">
                    <button
                      onClick={() => onSelectProject(proj.id)}
                      className="text-neutral-900 dark:text-neutral-100 hover:underline uppercase text-[11px]"
                    >
                      SPRINT TASKS →
                    </button>
                    <span className="text-neutral-300 dark:text-neutral-700">/</span>
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 uppercase text-[11px]"
                      title="Decommission project from registry"
                    >
                      DEL
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Registry Footer Telemetry */}
      <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
        <div>
          <span>TOTAL MONITORED SYSTEMS: </span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
            {projects.length}
          </span>
          <span className="mx-2 text-neutral-300 dark:text-neutral-700">·</span>
          <span>AGGREGATE ACTIVE USERS: </span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
            {totalUsers.toLocaleString()}
          </span>
        </div>

        <div className="text-[10px] tracking-wider uppercase text-neutral-400">
          LOG RETENTION: AUDITABLE PDF & MODAL PERSISTED
        </div>
      </div>
    </section>
  );
};
