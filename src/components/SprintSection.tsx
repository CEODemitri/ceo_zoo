import React, { useState, useMemo } from 'react';
import { Project, Task, TaskStatus, ProjectDetails } from '../types';
import { RainbowProgress } from './RainbowProgress';
import { ProjectDetailsCard } from './ProjectDetailsCard';

interface SprintSectionProps {
  projects: Project[];
  tasks: Task[];
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onAddTask: (projectId: string, title: string, tags: string[]) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateProjectDetails: (projectId: string, details: ProjectDetails) => void;
}

export const SprintSection: React.FC<SprintSectionProps> = ({
  projects,
  tasks,
  onToggleTaskComplete,
  onUpdateTaskStatus,
  onAddTask,
  onDeleteTask,
  onUpdateProjectDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Expanded project details panels state (map of projectId -> boolean)
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({
    'proj-hyperion': true, // Open the first project's credentials by default to showcase
  });

  // Track inline new task title per project
  const [newTaskInput, setNewTaskInput] = useState<Record<string, string>>({});
  const [newTaskTags, setNewTaskTags] = useState<Record<string, string>>({});

  const toggleDetails = (projectId: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  // Collect all unique tags across all tasks for the quick filter
  const allTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).slice(0, 10);
  }, [tasks]);

  // Format relative timestamp
  const formatTimeAgo = (isoString: string): string => {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'JUST NOW';
      if (diffMins < 60) return `${diffMins}M AGO`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}H AGO`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}D AGO`;
    } catch {
      return isoString;
    }
  };

  const handleAddNewTask = (projectId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = newTaskInput[projectId]?.trim();
    if (!title) return;

    const rawTags = newTaskTags[projectId]?.trim() || '';
    const parsedTags = rawTags
      ? rawTags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : ['sprint-task'];

    onAddTask(projectId, title, parsedTags);
    setNewTaskInput((prev) => ({ ...prev, [projectId]: '' }));
    setNewTaskTags((prev) => ({ ...prev, [projectId]: '' }));
  };

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="font-mono text-sm sm:text-base font-bold tracking-tight text-neutral-950 dark:text-neutral-50 uppercase">
              02. ACTIVE SPRINT DELIVERABLES // TASK QUEUES
            </h2>
            <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              SEVEN-ARC SPECTRAL VELOCITY INDICATOR · EXPANDABLE DEPLOYMENT DETAILS · LIVE TASK FILTERING
            </p>
          </div>

          <div className="font-mono text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
            TOTAL SPRINT TASKS: <span className="font-bold text-neutral-900 dark:text-neutral-100">{tasks.length}</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="pt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono text-xs">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH BY TASK TITLE, TAG, OR ASSIGNEE..."
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-black dark:focus:border-white text-xs placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Segmented Controls (Functional buttons, zero pills) */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] uppercase text-neutral-400 mr-1.5 hidden lg:inline">
              STATUS:
            </span>
            {(['ALL', 'done', 'in_progress', 'review', 'backlog'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-[11px] uppercase border transition-none whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Tag Filter Strip (Zero pills: unboxed text with typographic slash) */}
        {allTags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-900 flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="text-neutral-400 uppercase text-[10px] mr-1">FILTER BY TAG:</span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="text-neutral-900 dark:text-neutral-100 font-bold underline mr-2"
              >
                [CLEAR #{selectedTag}]
              </button>
            )}
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`transition-none hover:underline ${
                  selectedTag === tag
                    ? 'font-bold text-neutral-950 dark:text-neutral-50'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Projects Sprint Cards */}
      <div className="space-y-6">
        {projects.map((project) => {
          // Filter tasks belonging to this project
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const completedCount = projectTasks.filter((t) => t.status === 'done').length;

          // Apply search & status filter
          const displayedTasks = projectTasks.filter((t) => {
            const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
            const matchesSearch =
              !searchQuery ||
              t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (t.assignedTo && t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesTag = !selectedTag || t.tags.includes(selectedTag);

            return matchesStatus && matchesSearch && matchesTag;
          });

          const isDetailsOpen = !!expandedDetails[project.id];

          return (
            <article
              key={project.id}
              id={`project-${project.id}`}
              className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
            >
              {/* Project Card Header */}
              <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Title Area: Project Name, Version Number */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <h3 className="font-mono text-base sm:text-lg font-bold tracking-tight text-neutral-950 dark:text-neutral-50 uppercase">
                        {project.name}
                      </h3>
                      {/* Version number (Zero pills: unboxed sharp text) */}
                      <span className="font-mono text-xs font-semibold text-neutral-600 dark:text-neutral-300 tabular-nums">
                        {project.version}
                      </span>
                      <span className="text-neutral-300 dark:text-neutral-700">·</span>
                      <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                        {project.businessType}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {project.currentSprintName}
                      </span>
                    </div>
                  </div>

                  {/* Isolated Last Touched Date + 7-Bow Rainbow Sprint Progress Gauge */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0">
                    {/* The 7-Arc Rainbow Progress Bar */}
                    <div className="flex flex-col items-start lg:items-end">
                      <span className="font-mono text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                        SPRINT VELOCITY
                      </span>
                      <RainbowProgress
                        completedCount={completedCount}
                        totalCount={projectTasks.length}
                        size="md"
                        showLabel={true}
                      />
                    </div>

                    {/* Isolated Last Touched Date Box */}
                    <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 px-3 py-2 text-right font-mono">
                      <div className="text-[9px] uppercase tracking-wider text-neutral-400">
                        LAST TOUCHED
                      </div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                        {formatTimeAgo(project.lastTouched)}
                      </div>
                      <div className="text-[9px] text-neutral-400 tabular-nums">
                        {project.lastTouched.replace('T', ' ').substring(0, 16)} UTC
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sprint Goal / Notes Bar */}
                {project.sprintGoal && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-900 font-mono text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                    <span className="text-[10px] uppercase text-neutral-400 tracking-wider shrink-0 mt-0.5">
                      OBJECTIVE:
                    </span>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-normal">
                      {project.sprintGoal}
                    </p>
                  </div>
                )}

                {/* Details Card Toggle Button */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
                  <button
                    onClick={() => toggleDetails(project.id)}
                    className="font-mono text-xs text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white flex items-center gap-2 uppercase tracking-wide group"
                  >
                    <span className="text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
                      {isDetailsOpen ? '▲' : '▼'}
                    </span>
                    <span>
                      {isDetailsOpen
                        ? 'HIDE PROJECT DETAILS & CREDENTIALS'
                        : 'EXPAND PROJECT DETAILS, HOSTING & CREDENTIALS'}
                    </span>
                  </button>

                  <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                    {completedCount}/{projectTasks.length} TASKS COMPLETED
                  </span>
                </div>
              </div>

              {/* Expandable Project Details Card Panel (Live site, host, credentials) */}
              {isDetailsOpen && (
                <ProjectDetailsCard
                  details={project.details}
                  projectId={project.id}
                  projectName={project.name}
                  onUpdateDetails={(updated) => onUpdateProjectDetails(project.id, updated)}
                />
              )}

              {/* Tasks List */}
              <div className="p-4 sm:p-6 bg-white dark:bg-neutral-950">
                <div className="mb-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400">
                    NEXT SPRINT DELIVERABLES ({displayedTasks.length})
                  </span>
                </div>

                {displayedTasks.length === 0 ? (
                  <div className="py-6 text-center border border-dashed border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-400">
                    No tasks match the active filters. Adjust your search or add a new sprint task below.
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-900 border-t border-b border-neutral-200 dark:border-neutral-800">
                    {displayedTasks.map((task) => {
                      const isDone = task.status === 'done';

                      return (
                        <div
                          key={task.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-none"
                        >
                          {/* Task Checkbox & Title */}
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => onToggleTaskComplete(task.id)}
                              className={`mt-0.5 w-4 h-4 shrink-0 border flex items-center justify-center font-mono text-[11px] font-bold transition-none ${
                                isDone
                                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white'
                                  : 'border-neutral-400 hover:border-black dark:border-neutral-600 dark:hover:border-white'
                              }`}
                              title={isDone ? 'Mark as incomplete' : 'Mark as done'}
                              aria-label={isDone ? 'Mark as incomplete' : 'Mark as done'}
                            >
                              {isDone ? '✓' : ''}
                            </button>

                            <div className="space-y-1">
                              <span
                                onClick={() => onToggleTaskComplete(task.id)}
                                className={`font-mono text-xs sm:text-sm cursor-pointer select-none ${
                                  isDone
                                    ? 'line-through text-neutral-400 dark:text-neutral-500'
                                    : 'text-neutral-900 dark:text-neutral-100 font-medium'
                                }`}
                              >
                                {task.title}
                              </span>

                              {/* Zero-Pill Tags & Metadata */}
                              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
                                {task.assignedTo && (
                                  <>
                                    <span>@{task.assignedTo}</span>
                                    <span>·</span>
                                  </>
                                )}
                                {task.tags.map((tag, idx) => (
                                  <React.Fragment key={tag}>
                                    <span className="text-neutral-500 dark:text-neutral-400">
                                      #{tag}
                                    </span>
                                    {idx < task.tags.length - 1 && <span>·</span>}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Status Selector & Delete */}
                          <div className="flex items-center gap-3 shrink-0 sm:self-center pl-7 sm:pl-0 font-mono text-xs">
                            <select
                              value={task.status}
                              onChange={(e) =>
                                onUpdateTaskStatus(task.id, e.target.value as TaskStatus)
                              }
                              className="px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] uppercase font-mono text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
                            >
                              <option value="backlog">Backlog</option>
                              <option value="in_progress">In Progress</option>
                              <option value="review">Review</option>
                              <option value="done">Done</option>
                            </select>

                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="text-neutral-300 hover:text-red-600 dark:text-neutral-700 dark:hover:text-red-400 text-xs px-1"
                              title="Delete task from sprint"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Inline "Add Next Task" input row */}
                <form
                  onSubmit={(e) => handleAddNewTask(project.id, e)}
                  className="mt-4 flex flex-col sm:flex-row items-stretch gap-2 font-mono text-xs"
                >
                  <input
                    type="text"
                    value={newTaskInput[project.id] || ''}
                    onChange={(e) =>
                      setNewTaskInput((prev) => ({ ...prev, [project.id]: e.target.value }))
                    }
                    placeholder="+ ADD NEXT TASK FOR CURRENT SPRINT..."
                    className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-black dark:focus:border-white text-xs"
                  />
                  <input
                    type="text"
                    value={newTaskTags[project.id] || ''}
                    onChange={(e) =>
                      setNewTaskTags((prev) => ({ ...prev, [project.id]: e.target.value }))
                    }
                    placeholder="TAGS (comma-separated, e.g. api, db)"
                    className="sm:w-60 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-black dark:focus:border-white text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold uppercase tracking-wider text-xs whitespace-nowrap"
                  >
                    ADD TASK
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
