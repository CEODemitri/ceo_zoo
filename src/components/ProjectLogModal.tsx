import React, { useState, useMemo } from 'react';
import { Project, AuditLog, Task, TaskStatus } from '../types';
import {
  exportProjectsAuditPDF,
  buildVersionSprintLogHierarchy,
} from '../utils/pdfExport';

interface ProjectLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  logs: AuditLog[];
  tasks: Task[];
}

export const ProjectLogModal: React.FC<ProjectLogModalProps> = ({
  isOpen,
  onClose,
  projects,
  logs,
  tasks,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');

  const versionGroups = useMemo(
    () => buildVersionSprintLogHierarchy(projects, logs, tasks),
    [projects, logs, tasks]
  );

  if (!isOpen) return null;

  const filteredVersionGroups = versionGroups
    .filter((vg) => selectedProjectId === 'ALL' || vg.projectId === selectedProjectId)
    .map((vg) => ({
      ...vg,
      sprints: vg.sprints
        .map((sg) => ({
          ...sg,
          deliverables:
            statusFilter === 'ALL'
              ? sg.deliverables
              : sg.deliverables.filter((d) => d.status === statusFilter),
        }))
        .filter((sg) => sg.deliverables.length > 0 || statusFilter === 'ALL'),
    }))
    .filter((vg) => vg.sprints.length > 0);

  const totalSprints = versionGroups.reduce((acc, vg) => acc + vg.sprints.length, 0);
  const totalDeliverables = versionGroups.reduce(
    (acc, vg) =>
      acc + vg.sprints.reduce((sAcc, sg) => sAcc + sg.deliverables.length, 0),
    0
  );
  const completedDeliverables = versionGroups.reduce(
    (acc, vg) =>
      acc +
      vg.sprints.reduce(
        (sAcc, sg) =>
          sAcc + sg.deliverables.filter((d) => d.status === 'done').length,
        0
      ),
    0
  );

  const getStatusBadgeStyle = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return 'bg-[#181715] text-[#F3F1EC] dark:bg-[#F3F1EC] dark:text-[#181715] font-semibold';
      case 'in_progress':
        return 'bg-[#D94E28] text-white dark:bg-[#E85D36] dark:text-white font-semibold';
      case 'review':
        return 'bg-[#D8D2C5] text-[#181715] dark:bg-[#2A2A32] dark:text-[#F3F1EC] font-medium';
      default:
        return 'bg-[#E5E0D6] text-[#5C5852] dark:bg-[#1E1E24] dark:text-[#A6A29A]';
    }
  };

  const formatStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return 'DONE';
      case 'in_progress':
        return 'IN PROGRESS';
      case 'review':
        return 'REVIEW';
      default:
        return 'BACKLOG';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-5xl bg-[#EFECE6] dark:bg-[#141417] text-[#181715] dark:text-[#F3F1EC] shadow-2xl flex flex-col max-h-[92vh] text-left">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-[#E5E0D6]/70 dark:bg-[#1E1E24]/70">
          <div>
            <h2 className="font-serif text-base sm:text-lg font-semibold tracking-tight text-[#181715] dark:text-[#F3F1EC]">
              Version & Sprint Deliverables Log
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8C867E] dark:text-[#6E6A63] mt-0.5">
              ORGANIZED BY VERSION · THEN SPRINT · WITH ALL ASSOCIATED DELIVERABLES
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => exportProjectsAuditPDF(projects, logs, tasks)}
              className="px-3 py-1.5 font-mono text-xs bg-[#D94E28] hover:bg-[#C2411E] dark:bg-[#E85D36] dark:hover:bg-[#D94E28] text-white font-semibold uppercase tracking-wider transition-colors whitespace-nowrap"
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
          <div className="p-3 sm:p-4">
            <span className="block font-mono text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] tracking-wider">
              VERSIONS LOGGED
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold tabular-nums text-[#181715] dark:text-[#F3F1EC]">
              {versionGroups.length}
            </span>
          </div>

          <div className="p-3 sm:p-4">
            <span className="block font-mono text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] tracking-wider">
              SPRINTS RECORDED
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold tabular-nums text-[#181715] dark:text-[#F3F1EC]">
              {totalSprints}
            </span>
          </div>

          <div className="p-3 sm:p-4">
            <span className="block font-mono text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] tracking-wider">
              TOTAL DELIVERABLES
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold tabular-nums text-[#181715] dark:text-[#F3F1EC]">
              {totalDeliverables}
            </span>
          </div>

          <div className="p-3 sm:p-4">
            <span className="block font-mono text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] tracking-wider">
              DELIVERABLES DONE
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold tabular-nums text-[#181715] dark:text-[#F3F1EC]">
              {completedDeliverables}/{totalDeliverables}
            </span>
          </div>
        </div>

        {/* Filter Bar: Project & Deliverable Status */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-[#181715]/[0.07] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-[#8C867E] dark:text-[#6E6A63] uppercase mr-1">
              PROJECT:
            </span>
            <button
              type="button"
              onClick={() => setSelectedProjectId('ALL')}
              className={`text-[10px] px-2 py-0.5 uppercase transition-colors ${
                selectedProjectId === 'ALL'
                  ? 'bg-[#181715] text-[#F3F1EC] dark:bg-[#F3F1EC] dark:text-[#181715] font-semibold'
                  : 'bg-[#E5E0D6] hover:bg-[#DBD5C9] dark:bg-[#1E1E24] dark:hover:bg-[#282830] text-[#5C5852] dark:text-[#A6A29A]'
              }`}
            >
              ALL ({projects.length})
            </button>
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProjectId(p.id)}
                className={`text-[10px] px-2 py-0.5 uppercase transition-colors ${
                  selectedProjectId === p.id
                    ? 'bg-[#181715] text-[#F3F1EC] dark:bg-[#F3F1EC] dark:text-[#181715] font-semibold'
                    : 'bg-[#E5E0D6] hover:bg-[#DBD5C9] dark:bg-[#1E1E24] dark:hover:bg-[#282830] text-[#5C5852] dark:text-[#A6A29A]'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-[#8C867E] dark:text-[#6E6A63] uppercase mr-1">
              STATUS:
            </span>
            {(['ALL', 'done', 'in_progress', 'review', 'backlog'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`text-[10px] px-2 py-0.5 uppercase transition-colors ${
                  statusFilter === st
                    ? 'bg-[#D94E28] dark:bg-[#E85D36] text-white font-semibold'
                    : 'bg-[#E5E0D6] hover:bg-[#DBD5C9] dark:bg-[#1E1E24] dark:hover:bg-[#282830] text-[#5C5852] dark:text-[#A6A29A]'
                }`}
              >
                {st === 'ALL' ? 'ALL' : formatStatusLabel(st)}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Hierarchy Content: Version -> Sprint -> Deliverables */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 font-mono text-xs">
          {filteredVersionGroups.length === 0 ? (
            <div className="py-8 text-left text-[#8C867E] dark:text-[#6E6A63]">
              No version or sprint deliverable records match the active filter.
            </div>
          ) : (
            filteredVersionGroups.map((vGroup) => {
              const versionDeliverablesCount = vGroup.sprints.reduce(
                (acc, s) => acc + s.deliverables.length,
                0
              );
              const versionDoneCount = vGroup.sprints.reduce(
                (acc, s) =>
                  acc + s.deliverables.filter((d) => d.status === 'done').length,
                0
              );

              return (
                <section
                  key={vGroup.key}
                  className="bg-[#F6F4EF] dark:bg-[#0C0C0E] p-4 sm:p-5 space-y-4 border-l-2 border-[#D94E28] dark:border-[#E85D36]"
                >
                  {/* LEVEL 1: VERSION HEADER */}
                  <div className="flex flex-wrap items-baseline justify-between gap-2 pb-2.5 border-b border-[#181715]/[0.08] dark:border-white/[0.07]">
                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <span className="px-2 py-0.5 bg-[#D94E28] dark:bg-[#E85D36] text-white font-semibold text-xs tabular-nums tracking-wide">
                        VERSION {vGroup.version}
                      </span>
                      <h3 className="font-serif text-base sm:text-lg font-semibold text-[#181715] dark:text-[#F3F1EC]">
                        {vGroup.projectName}
                      </h3>
                      <span className="text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63]">
                        · {vGroup.businessType}
                      </span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#5C5852] dark:text-[#A6A29A]">
                        {vGroup.isCurrentVersion ? 'ACTIVE VERSION' : 'PREVIOUS VERSION'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-[#8C867E] dark:text-[#6E6A63] tabular-nums">
                      <span>
                        {versionDoneCount}/{versionDeliverablesCount} DELIVERABLES DONE
                      </span>
                      <span>·</span>
                      <span>
                        {vGroup.latestTimestamp.replace('T', ' ').substring(0, 16)} UTC
                      </span>
                    </div>
                  </div>

                  {/* LEVEL 2: SPRINTS ASSOCIATED WITH THIS VERSION */}
                  <div className="space-y-4">
                    {vGroup.sprints.map((sGroup) => {
                      const sprintDone = sGroup.deliverables.filter(
                        (d) => d.status === 'done'
                      ).length;

                      return (
                        <div
                          key={sGroup.sprintName}
                          className="bg-[#EFECE6] dark:bg-[#141417] p-3.5 sm:p-4 space-y-3"
                        >
                          {/* Sprint Header */}
                          <div className="flex flex-col items-start space-y-1">
                            <div className="w-full flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] uppercase tracking-[0.12em] text-[#D94E28] dark:text-[#E85D36] font-semibold">
                                  SPRINT
                                </span>
                                <span className="font-sans text-xs sm:text-sm font-semibold text-[#181715] dark:text-[#F3F1EC]">
                                  {sGroup.sprintName}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#5C5852] dark:text-[#A6A29A] tabular-nums">
                                {sprintDone}/{sGroup.deliverables.length} DELIVERABLES COMPLETED
                              </span>
                            </div>

                            {sGroup.sprintGoal && (
                              <p className="text-[11px] text-[#5C5852] dark:text-[#A6A29A] leading-snug">
                                OBJECTIVE: {sGroup.sprintGoal}
                              </p>
                            )}
                          </div>

                          {/* LEVEL 3: EACH AND ALL DELIVERABLES ASSOCIATED WITH THIS SPRINT */}
                          <div className="space-y-1">
                            <div className="text-[10px] uppercase tracking-[0.12em] text-[#8C867E] dark:text-[#6E6A63] pb-1">
                              ASSOCIATED SPRINT DELIVERABLES ({sGroup.deliverables.length})
                            </div>

                            {sGroup.deliverables.length === 0 ? (
                              <div className="py-2 text-[11px] text-[#8C867E] dark:text-[#6E6A63]">
                                No deliverables recorded for this sprint under the active status filter.
                              </div>
                            ) : (
                              <div className="divide-y divide-[#181715]/[0.06] dark:divide-white/[0.05] border-t border-b border-[#181715]/[0.08] dark:border-white/[0.07]">
                                {sGroup.deliverables.map((deliv, index) => (
                                  <div
                                    key={deliv.id}
                                    className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4"
                                  >
                                    <div className="flex items-start gap-2.5 min-w-0">
                                      <span className="text-[10px] text-[#8C867E] dark:text-[#6E6A63] tabular-nums pt-0.5 shrink-0">
                                        {String(index + 1).padStart(2, '0')}.
                                      </span>
                                      <span
                                        className={`text-[9px] px-1.5 py-0.5 uppercase tracking-wider shrink-0 ${getStatusBadgeStyle(
                                          deliv.status
                                        )}`}
                                      >
                                        {formatStatusLabel(deliv.status)}
                                      </span>
                                      <span
                                        className={`font-sans text-xs leading-snug break-words ${
                                          deliv.status === 'done'
                                            ? 'text-[#5C5852] dark:text-[#A6A29A]'
                                            : 'text-[#181715] dark:text-[#F3F1EC] font-medium'
                                        }`}
                                      >
                                        {deliv.title}
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 pl-6 sm:pl-0 shrink-0 text-[10px] text-[#8C867E] dark:text-[#6E6A63]">
                                      {deliv.tags &&
                                        deliv.tags.map((tag) => (
                                          <span
                                            key={tag}
                                            className="px-1.5 py-0.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#5C5852] dark:text-[#A6A29A]"
                                          >
                                            #{tag}
                                          </span>
                                        ))}
                                      {deliv.assignedTo && (
                                        <span>@{deliv.assignedTo}</span>
                                      )}
                                      <span className="tabular-nums">
                                        {deliv.updatedAt.replace('T', ' ').substring(0, 16)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Recorded Version/Sprint Activity Events (if any) */}
                          {sGroup.events.length > 0 && (
                            <div className="pt-1 space-y-1">
                              <div className="text-[9px] uppercase tracking-[0.12em] text-[#8C867E] dark:text-[#6E6A63]">
                                SPRINT LOG EVENTS ({sGroup.events.length})
                              </div>
                              <div className="space-y-1">
                                {sGroup.events.map((ev) => (
                                  <div
                                    key={ev.id}
                                    className="text-[11px] text-[#5C5852] dark:text-[#A6A29A] flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
                                  >
                                    <span className="text-[10px] font-semibold text-[#D94E28] dark:text-[#E85D36]">
                                      [{ev.action}]
                                    </span>
                                    <span className="text-[#181715] dark:text-[#F3F1EC]">
                                      {ev.summary}
                                    </span>
                                    <span className="text-[10px] text-[#8C867E] dark:text-[#6E6A63] tabular-nums">
                                      · @{ev.author} · {ev.timestamp.replace('T', ' ').substring(0, 16)} UTC
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-[#E5E0D6]/60 dark:bg-[#1E1E24]/60 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-[#8C867E] dark:text-[#6E6A63] uppercase tracking-[0.12em]">
            HIERARCHY: VERSION → SPRINT → DELIVERABLES
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

