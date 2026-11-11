import React, { useState, useRef, useEffect } from 'react';
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

const STORAGE_PNG_KEY = 'zoo_registry_corner_png_v1';

// Default sleek Swiss futuristic wireframe graphic (transparent geometric emblem for Zoo)
const DEFAULT_SWISS_GRAPHIC = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" fill="none"><g stroke="%2371717A" stroke-width="1.2" opacity="0.32"><path d="M200 40 L340 120 L340 280 L200 360 L60 280 L60 120 Z"/><path d="M200 40 L200 360"/><path d="M60 120 L340 280"/><path d="M340 120 L60 280"/><circle cx="200" cy="200" r="110" stroke-dasharray="3 3"/><circle cx="200" cy="200" r="60"/><path d="M200 40 L280 20 L360 80 L340 120"/><path d="M60 120 L40 80 L120 20 L200 40"/><path d="M200 360 L280 440 L360 400 L340 280"/><path d="M60 280 L40 400 L120 440 L200 360"/><text x="200" y="470" font-family="monospace" font-size="11" fill="%2371717A" text-anchor="middle" letter-spacing="4">ZOO // GEOMETRIC CORE</text></g></svg>`;

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PNG Image state (persisted in localStorage, default loaded)
  const [pngImage, setPngImage] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PNG_KEY);
      if (saved) return saved;
      return DEFAULT_SWISS_GRAPHIC;
    } catch {
      return DEFAULT_SWISS_GRAPHIC;
    }
  });

  const [pngOpacity, setPngOpacity] = useState<number>(85);

  useEffect(() => {
    if (pngImage) {
      try {
        localStorage.setItem(STORAGE_PNG_KEY, pngImage);
      } catch {
        // quota exceeded or private mode
      }
    }
  }, [pngImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPngImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePng = () => {
    setPngImage(null);
    localStorage.removeItem(STORAGE_PNG_KEY);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetDefault = () => {
    setPngImage(DEFAULT_SWISS_GRAPHIC);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section className="relative overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      {/* 75% Height Bottom-Right PNG Area */}
      <div
        className="absolute right-0 bottom-0 h-[75%] max-w-[48%] pointer-events-none select-none z-0 flex items-end justify-end overflow-hidden pr-4 sm:pr-8 pb-0"
        aria-hidden="true"
      >
        {pngImage && (
          <img
            src={pngImage}
            alt="Container Brand Graphic"
            className="h-full w-auto max-w-full object-contain object-right-bottom transition-none drop-shadow-sm"
            style={{ opacity: pngOpacity / 100 }}
          />
        )}
      </div>

      {/* Hidden File Input for PNG Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/*"
        className="hidden"
      />

      {/* Section Header with Generous Open Space */}
      <div className="relative z-10 px-6 sm:px-10 py-6 sm:py-8 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-6 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-[2px]">
        <div className="space-y-1.5">
          <h2 className="font-mono text-base sm:text-lg font-bold tracking-tight text-neutral-950 dark:text-neutral-50 uppercase">
            01. PROJECT REGISTRY // REPOSITORY INDEX
          </h2>
          <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
            CENTRAL INVENTORY · BUSINESS CLASSIFICATION · VERSION TELEMETRY · GLOBAL REACH
          </p>
        </div>

        {/* Section Actions & PNG Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* PNG Area Trigger */}
          <div className="flex items-center gap-1.5 border border-neutral-300 dark:border-neutral-700 px-2 py-1 font-mono text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hover:text-black dark:hover:text-white uppercase font-semibold text-[11px]"
              title="Add or replace the PNG graphic in the bottom right corner"
            >
              {pngImage ? 'REPLACE PNG' : '+ ADD PNG'}
            </button>
            {pngImage && (
              <>
                <span className="text-neutral-300 dark:text-neutral-700">·</span>
                <button
                  onClick={handleRemovePng}
                  className="hover:text-red-500 text-neutral-400 uppercase text-[10px]"
                  title="Remove PNG graphic"
                >
                  REMOVE
                </button>
                <span className="text-neutral-300 dark:text-neutral-700">·</span>
                <button
                  onClick={handleResetDefault}
                  className="hover:text-neutral-900 dark:hover:text-neutral-100 text-neutral-400 uppercase text-[10px]"
                  title="Reset to default Swiss wireframe"
                >
                  RESET
                </button>
              </>
            )}
          </div>

          <button
            onClick={onOpenLogModal}
            className="px-3.5 py-1.5 font-mono text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 uppercase tracking-wide transition-none"
            title="Inspect chronological deployment and change log records"
          >
            VIEW AUDIT LOG MODAL
          </button>

          <button
            onClick={() => exportProjectsAuditPDF(projects, logs)}
            className="px-3.5 py-1.5 font-mono text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 uppercase tracking-wide transition-none"
            title="Export official PDF compliance document"
          >
            DOWNLOAD PDF
          </button>

          <button
            onClick={onOpenNewProject}
            className="px-4 py-1.5 font-mono text-xs bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold uppercase tracking-wider transition-none sm:hidden"
          >
            + ADD
          </button>
        </div>
      </div>

      {/* Registry Table with Generous Row Heights & Open Space */}
      <div className="relative z-10 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/30 text-[11px] uppercase text-neutral-500 dark:text-neutral-400 tracking-wider">
              <th className="py-4 px-6 sm:px-10 font-semibold">PROJECT NAME</th>
              <th className="py-4 px-6 font-semibold">BUSINESS TYPE</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">START DATE</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">VERSION</th>
              <th className="py-4 px-6 text-right font-semibold whitespace-nowrap">ACTIVE USERS</th>
              <th className="py-4 px-6 sm:px-10 text-right font-semibold">OPERATIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
            {projects.map((proj) => (
              <tr
                key={proj.id}
                className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition-none group"
              >
                {/* Project Name */}
                <td className="py-5 sm:py-6 px-6 sm:px-10">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => onSelectProject(proj.id)}
                      className="text-left font-semibold text-neutral-950 dark:text-neutral-50 hover:underline text-sm sm:text-base"
                    >
                      {proj.name}
                    </button>
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate max-w-sm">
                      {proj.details.liveSite.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                </td>

                {/* Business Type */}
                <td className="py-5 sm:py-6 px-6 text-neutral-700 dark:text-neutral-300 whitespace-nowrap text-xs sm:text-sm">
                  {proj.businessType}
                </td>

                {/* Start Date */}
                <td className="py-5 sm:py-6 px-6 text-neutral-600 dark:text-neutral-400 tabular-nums whitespace-nowrap text-xs sm:text-sm">
                  {proj.startDate}
                </td>

                {/* Version Number with bump triggers */}
                <td className="py-5 sm:py-6 px-6 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums text-xs sm:text-sm">
                      {proj.version}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-none flex items-center gap-1 text-[11px]">
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
                <td className="py-5 sm:py-6 px-6 text-right font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums whitespace-nowrap text-xs sm:text-sm">
                  {proj.activeUsers.toLocaleString()}
                </td>

                {/* Actions */}
                <td className="py-5 sm:py-6 px-6 sm:px-10 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-3 text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">
                    <button
                      onClick={() => onSelectProject(proj.id)}
                      className="text-neutral-900 dark:text-neutral-100 hover:underline uppercase text-xs font-semibold"
                    >
                      SPRINT TASKS →
                    </button>
                    <span className="text-neutral-300 dark:text-neutral-700">/</span>
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 uppercase text-xs"
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

      {/* Registry Footer Telemetry with Open Space */}
      <div className="relative z-10 px-6 sm:px-10 py-5 sm:py-6 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-[2px] flex flex-wrap items-center justify-between gap-6 font-mono text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex flex-wrap items-center gap-3">
          <span>TOTAL MONITORED SYSTEMS: </span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
            {projects.length}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span>AGGREGATE ACTIVE USERS: </span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
            {totalUsers.toLocaleString()}
          </span>
        </div>

        <div className="text-[11px] tracking-wider uppercase text-neutral-400 flex items-center gap-3">
          {pngImage && (
            <span>PNG ACTIVE: 75% HEIGHT CORNER ANCHOR · </span>
          )}
          <span>AUDITABLE PDF & MODAL PERSISTED</span>
        </div>
      </div>
    </section>
  );
};
