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

const STORAGE_PNG_KEY = 'zoo_registry_custom_png_v2';

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

  // Blank by default (shows the low-opacity elephant cutout until user taps to upload a PNG)
  const [pngImage, setPngImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_PNG_KEY) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (pngImage) {
        localStorage.setItem(STORAGE_PNG_KEY, pngImage);
      } else {
        localStorage.removeItem(STORAGE_PNG_KEY);
      }
    } catch {
      // ignore storage quota errors
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

  return (
    <section className="relative overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 min-h-[480px] flex flex-col justify-between text-left">
      {/* Hidden File Input activated by tapping the 75% height bottom-right corner space */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/*"
        className="hidden"
      />

      {/* Tappable 75% Height Bottom-Right Corner PNG Space (Most backwards element: z-0, very low opacity) */}
      <div
        onClick={() => fileInputRef.current?.click()}
        title="Tap space to upload or change PNG image"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className="absolute right-0 bottom-0 h-[75%] w-[55%] sm:w-[46%] z-0 cursor-pointer select-none flex items-end justify-end overflow-hidden focus:outline-none group"
      >
        {pngImage ? (
          <img
            src={pngImage}
            alt="Uploaded corner PNG"
            className="h-full w-auto max-w-full object-contain object-right-bottom opacity-[0.08] dark:opacity-[0.10] group-hover:opacity-[0.14] transition-none"
          />
        ) : (
          /* Low-opacity cutout of a side-view elephant with trunk facing upward, top 75% half anchored from right corner */
          <svg
            viewBox="0 0 420 340"
            className="h-full w-auto object-contain object-right-bottom text-neutral-900 dark:text-neutral-100 opacity-[0.06] dark:opacity-[0.08] group-hover:opacity-[0.11] transition-none translate-x-[28%] translate-y-[12%]"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Elephant side view cutout with raised trunk"
          >
            {/* Side-view elephant silhouette facing left with trunk curving high upward; right half & top 75% anchored to bottom-right */}
            <path d="M 88 28 C 78 28, 72 35, 73 45 C 75 68, 86 98, 104 118 C 115 130, 128 134, 138 128 C 122 142, 105 148, 88 144 C 82 142, 78 147, 83 152 C 102 162, 124 162, 144 150 C 148 168, 156 186, 170 202 L 166 340 L 218 340 L 222 252 C 254 258, 294 258, 330 250 L 334 340 L 392 340 L 408 220 C 416 172, 412 126, 382 96 C 348 64, 292 58, 244 72 C 230 52, 206 40, 180 42 C 158 44, 140 58, 130 78 C 114 72, 102 52, 98 34 C 96 29, 92 28, 88 28 Z" />
            {/* Ear cutout detail for crisp architectural side-profile depth */}
            <path
              d="M 192 68 C 228 66, 254 96, 248 142 C 244 174, 218 194, 192 184 C 176 178, 168 152, 172 120 C 175 90, 180 70, 192 68 Z"
              className="text-white dark:text-neutral-950"
              fill="currentColor"
              opacity="0.35"
            />
          </svg>
        )}
      </div>

      {/* TOP EDGE OF CONTAINER: Stacked left-aligned header rows + 25-30% compressed table */}
      <div className="relative z-10 pointer-events-none w-full px-3 sm:px-5 pt-2 pb-3 border-b border-neutral-200/70 dark:border-neutral-800/70 flex flex-col items-start justify-start space-y-1.5">
        <div className="flex flex-col items-start text-left space-y-0.5">
          <h2 className="font-mono text-sm sm:text-base font-bold tracking-tight text-neutral-950 dark:text-neutral-50 uppercase leading-none">
            01. PROJECT REGISTRY // REPOSITORY INDEX
          </h2>
          <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
            BUSINESS TYPE · START DATE · VERSION · USERS
          </p>
        </div>

        {/* Stacked Row of Actions (Left-Aligned, No PNG Buttons) */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-start gap-2 pt-0.5">
          <button
            onClick={onOpenLogModal}
            className="px-2 py-0.5 font-mono text-[11px] border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100/80 dark:hover:bg-neutral-900/80 text-neutral-800 dark:text-neutral-200 uppercase tracking-wide transition-none"
          >
            VIEW AUDIT LOG MODAL
          </button>

          <button
            onClick={() => exportProjectsAuditPDF(projects, logs)}
            className="px-2 py-0.5 font-mono text-[11px] border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100/80 dark:hover:bg-neutral-900/80 text-neutral-800 dark:text-neutral-200 uppercase tracking-wide transition-none"
          >
            DOWNLOAD PDF
          </button>

          <button
            onClick={onOpenNewProject}
            className="px-2 py-0.5 font-mono text-[11px] bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold uppercase tracking-wider transition-none sm:hidden"
          >
            + ADD PROJECT
          </button>
        </div>

        {/* ~25-35% More Compressed Reference Table (Leaves breathing room for PNG while allowing right-edge text to flow over image) */}
        <div className="pointer-events-auto w-full md:w-[74%] lg:w-[68%] pt-2 overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800/80 text-[9px] uppercase text-neutral-500 dark:text-neutral-400 tracking-wider">
                <th className="py-1 pr-3 font-semibold text-left align-top">PROJECT NAME</th>
                <th className="py-1 px-2.5 font-semibold text-left align-top">BUSINESS TYPE</th>
                <th className="py-1 px-2.5 font-semibold text-left align-top whitespace-nowrap">START DATE</th>
                <th className="py-1 px-2.5 font-semibold text-left align-top whitespace-nowrap">VERSION</th>
                <th className="py-1 pl-2.5 font-semibold text-left align-top whitespace-nowrap">ACTIVE USERS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/50 dark:divide-neutral-800/50">
              {projects.map((proj) => (
                <tr
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className="hover:bg-neutral-500/5 transition-none cursor-pointer group"
                  title="Jump to project in Section 02 to inspect or edit"
                >
                  {/* Project Name */}
                  <td className="py-1.5 pr-3 align-top text-left">
                    <div className="flex flex-col items-start justify-between space-y-0.5">
                      <span className="text-left font-semibold text-neutral-950 dark:text-neutral-50 group-hover:underline text-xs leading-none">
                        {proj.name}
                      </span>
                      <span className="text-[9px] text-neutral-400 dark:text-neutral-500 truncate max-w-[180px] leading-none">
                        {proj.details.liveSite.replace(/^https?:\/\//, '')}
                      </span>
                    </div>
                  </td>

                  {/* Business Type */}
                  <td className="py-1.5 px-2.5 align-top text-left text-neutral-700 dark:text-neutral-300 whitespace-nowrap text-[11px] leading-none">
                    {proj.businessType}
                  </td>

                  {/* Start Date */}
                  <td className="py-1.5 px-2.5 align-top text-left text-neutral-600 dark:text-neutral-400 tabular-nums whitespace-nowrap text-[11px] leading-none">
                    {proj.startDate}
                  </td>

                  {/* Version Number */}
                  <td className="py-1.5 px-2.5 align-top text-left whitespace-nowrap leading-none">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums text-[11px]">
                      {proj.version}
                    </span>
                  </td>

                  {/* Active Users */}
                  <td className="py-1.5 pl-2.5 align-top text-left font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums whitespace-nowrap text-[11px] leading-none">
                    {proj.activeUsers.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Swiss Vertical Space in Middle of Container (Click-through to PNG space on the right) */}
      <div className="flex-1 min-h-[140px] pointer-events-none" />

      {/* BOTTOM EDGE OF CONTAINER: Left-aligned stacked rows placed right at the bottom */}
      <div className="relative z-10 pointer-events-none w-full px-3 sm:px-5 pt-2.5 pb-1.5 border-t border-neutral-200/70 dark:border-neutral-800/70 flex flex-col items-start justify-end space-y-1 font-mono text-[11px] text-neutral-500 dark:text-neutral-400 text-left">
        <div className="flex flex-wrap items-center justify-start gap-2 leading-none">
          <span>AGGREGATED FROM SECTION 02</span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span>TOTAL MONITORED SYSTEMS:</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
            {projects.length}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span>AGGREGATE ACTIVE USERS:</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
            {totalUsers.toLocaleString()}
          </span>
        </div>

        <div className="text-[10px] tracking-wider uppercase text-neutral-400 leading-none">
          LOG RETENTION: AUDITABLE PDF & MODAL PERSISTED · TAP RIGHT CORNER FOR PNG
        </div>
      </div>
    </section>
  );
};
