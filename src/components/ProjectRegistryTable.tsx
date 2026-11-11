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
    <section className="relative overflow-hidden bg-[#EFECE6] dark:bg-[#141417] min-h-[480px] flex flex-col justify-between text-left">
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
            className="h-full w-auto max-w-full object-contain object-right-bottom opacity-[0.08] dark:opacity-[0.10] group-hover:opacity-[0.14] transition-opacity"
          />
        ) : (
          /* Low-opacity cutout of a side-view elephant with trunk facing upward, top 75% half anchored from right corner */
          <svg
            viewBox="0 0 420 340"
            className="h-full w-auto object-contain object-right-bottom text-[#181715] dark:text-[#F3F1EC] opacity-[0.06] dark:opacity-[0.08] group-hover:opacity-[0.11] transition-opacity translate-x-[28%] translate-y-[12%]"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Elephant side view cutout with raised trunk"
          >
            {/* Side-view elephant silhouette facing left with trunk curving high upward; right half & top 75% anchored to bottom-right */}
            <path d="M 88 28 C 78 28, 72 35, 73 45 C 75 68, 86 98, 104 118 C 115 130, 128 134, 138 128 C 122 142, 105 148, 88 144 C 82 142, 78 147, 83 152 C 102 162, 124 162, 144 150 C 148 168, 156 186, 170 202 L 166 340 L 218 340 L 222 252 C 254 258, 294 258, 330 250 L 334 340 L 392 340 L 408 220 C 416 172, 412 126, 382 96 C 348 64, 292 58, 244 72 C 230 52, 206 40, 180 42 C 158 44, 140 58, 130 78 C 114 72, 102 52, 98 34 C 96 29, 92 28, 88 28 Z" />
            {/* Ear cutout detail for crisp architectural side-profile depth */}
            <path
              d="M 192 68 C 228 66, 254 96, 248 142 C 244 174, 218 194, 192 184 C 176 178, 168 152, 172 120 C 175 90, 180 70, 192 68 Z"
              className="text-[#EFECE6] dark:text-[#141417]"
              fill="currentColor"
              opacity="0.45"
            />
          </svg>
        )}
      </div>

      {/* TOP EDGE OF CONTAINER: Stacked left-aligned header rows + 25-35% compressed table */}
      <div className="relative z-10 pointer-events-none w-full px-4 sm:px-6 pt-3 pb-4 flex flex-col items-start justify-start space-y-2">
        <div className="flex flex-col items-start text-left space-y-1">
          <h2 className="font-serif text-base sm:text-lg font-semibold tracking-tight text-[#181715] dark:text-[#F3F1EC] leading-none">
            01. Project Registry
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8C867E] dark:text-[#6E6A63] leading-tight">
            BUSINESS TYPE · START DATE · VERSION · USERS
          </p>
        </div>

        {/* Stacked Row of Tonal Actions (Left-Aligned, No PNG Buttons) */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-start gap-2 pt-0.5">
          <button
            onClick={onOpenLogModal}
            className="px-2.5 py-1 font-mono text-[11px] bg-[#E5E0D6] hover:bg-[#DBD5C9] dark:bg-[#1E1E24] dark:hover:bg-[#282830] text-[#181715] dark:text-[#F3F1EC] uppercase tracking-wider transition-colors whitespace-nowrap shrink-0"
          >
            View Audit Log
          </button>

          <button
            onClick={() => exportProjectsAuditPDF(projects, logs)}
            className="px-2.5 py-1 font-mono text-[11px] bg-[#E5E0D6] hover:bg-[#DBD5C9] dark:bg-[#1E1E24] dark:hover:bg-[#282830] text-[#181715] dark:text-[#F3F1EC] uppercase tracking-wider transition-colors whitespace-nowrap shrink-0"
          >
            Download PDF
          </button>

          <button
            onClick={onOpenNewProject}
            className="px-2.5 py-1 font-mono text-[11px] bg-[#D94E28] hover:bg-[#C2411E] dark:bg-[#E85D36] dark:hover:bg-[#D94E28] text-white font-semibold uppercase tracking-wider transition-colors sm:hidden whitespace-nowrap shrink-0"
          >
            + Add Project
          </button>
        </div>

        {/* Mobile View (< 640px): Zero-Horizontal-Scroll Stacked Project Reference List */}
        <div className="pointer-events-auto w-full pt-2 sm:hidden divide-y divide-[#181715]/[0.07] dark:divide-white/[0.06] border-t border-b border-[#181715]/[0.08] dark:border-white/[0.07] font-mono">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className="py-2.5 flex flex-col items-start justify-between space-y-1 hover:bg-[#E5E0D6]/60 dark:hover:bg-[#1E1E24]/70 cursor-pointer text-left transition-colors"
            >
              <div className="w-full flex flex-wrap items-baseline justify-between gap-2 leading-none">
                <span className="font-sans font-semibold text-[#181715] dark:text-[#F3F1EC] text-xs">
                  {proj.name}
                </span>
                <div className="flex items-center gap-2 text-[11px] tabular-nums">
                  <span className="font-semibold text-[#D94E28] dark:text-[#E85D36]">
                    {proj.version}
                  </span>
                  <span className="text-[#8C867E]/60">·</span>
                  <span className="font-semibold text-[#181715] dark:text-[#F3F1EC]">
                    {proj.activeUsers.toLocaleString()} USERS
                  </span>
                </div>
              </div>

              <div className="w-full flex flex-wrap items-center justify-start gap-x-2 gap-y-0.5 text-[10px] text-[#5C5852] dark:text-[#A6A29A] leading-tight">
                <span>{proj.businessType}</span>
                <span className="text-[#8C867E]/60">·</span>
                <span className="tabular-nums">{proj.startDate}</span>
                <span className="text-[#8C867E]/60">·</span>
                <span className="text-[#8C867E] dark:text-[#6E6A63] truncate max-w-[180px]">
                  {proj.details.liveSite.replace(/^https?:\/\//, '')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop/Tablet View (>= 640px): ~25-35% More Compressed Reference Table */}
        <div className="pointer-events-auto hidden sm:block w-full md:w-[74%] lg:w-[68%] pt-2 overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-[#181715]/[0.1] dark:border-white/[0.08] text-[9px] uppercase text-[#8C867E] dark:text-[#6E6A63] tracking-[0.12em]">
                <th className="py-1.5 pr-3 font-semibold text-left align-top">PROJECT NAME</th>
                <th className="py-1.5 px-2.5 font-semibold text-left align-top">BUSINESS TYPE</th>
                <th className="py-1.5 px-2.5 font-semibold text-left align-top whitespace-nowrap">START DATE</th>
                <th className="py-1.5 px-2.5 font-semibold text-left align-top whitespace-nowrap">VERSION</th>
                <th className="py-1.5 pl-2.5 font-semibold text-left align-top whitespace-nowrap">ACTIVE USERS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181715]/[0.06] dark:divide-white/[0.05]">
              {projects.map((proj) => (
                <tr
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className="hover:bg-[#E5E0D6]/50 dark:hover:bg-[#1E1E24]/60 transition-colors cursor-pointer group"
                  title="Jump to project in Section 02 to inspect or edit"
                >
                  {/* Project Name */}
                  <td className="py-2 pr-3 align-top text-left">
                    <div className="flex flex-col items-start justify-between space-y-0.5">
                      <span className="font-sans text-left font-semibold text-[#181715] dark:text-[#F3F1EC] group-hover:text-[#D94E28] dark:group-hover:text-[#E85D36] transition-colors text-xs leading-none">
                        {proj.name}
                      </span>
                      <span className="text-[9px] text-[#8C867E] dark:text-[#6E6A63] truncate max-w-[180px] leading-none">
                        {proj.details.liveSite.replace(/^https?:\/\//, '')}
                      </span>
                    </div>
                  </td>

                  {/* Business Type */}
                  <td className="py-2 px-2.5 align-top text-left text-[#5C5852] dark:text-[#A6A29A] text-[11px] leading-tight">
                    {proj.businessType}
                  </td>

                  {/* Start Date */}
                  <td className="py-2 px-2.5 align-top text-left text-[#5C5852] dark:text-[#A6A29A] tabular-nums whitespace-nowrap text-[11px] leading-none">
                    {proj.startDate}
                  </td>

                  {/* Version Number */}
                  <td className="py-2 px-2.5 align-top text-left whitespace-nowrap leading-none">
                    <span className="font-semibold text-[#181715] dark:text-[#F3F1EC] tabular-nums text-[11px]">
                      {proj.version}
                    </span>
                  </td>

                  {/* Active Users */}
                  <td className="py-2 pl-2.5 align-top text-left font-semibold text-[#181715] dark:text-[#F3F1EC] tabular-nums whitespace-nowrap text-[11px] leading-none">
                    {proj.activeUsers.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Vertical Space in Middle of Container (Click-through to PNG space on the right) */}
      <div className="flex-1 min-h-[140px] pointer-events-none" />

      {/* BOTTOM EDGE OF CONTAINER: Left-aligned row placed right at the bottom */}
      <div className="relative z-10 pointer-events-none w-full px-4 sm:px-6 pt-3 pb-2.5 border-t border-[#181715]/[0.07] dark:border-white/[0.06] flex flex-col items-start justify-end font-mono text-[11px] text-[#5C5852] dark:text-[#A6A29A] text-left">
        <div className="flex flex-wrap items-center justify-start gap-2 leading-none">
          <span>AGGREGATE USERS:</span>
          <span className="font-semibold text-[#181715] dark:text-[#F3F1EC] tabular-nums">
            {totalUsers.toLocaleString()}
          </span>
        </div>
      </div>
    </section>
  );
};
