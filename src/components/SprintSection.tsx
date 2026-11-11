import React, { useState, useMemo } from 'react';
import { Pencil, Check, Trash2, Lock } from 'lucide-react';
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
  onUpdateProject: (updatedProject: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export const SprintSection: React.FC<SprintSectionProps> = ({
  projects,
  tasks,
  onToggleTaskComplete,
  onUpdateTaskStatus,
  onAddTask,
  onDeleteTask,
  onUpdateProjectDetails,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Expanded project details panels state (map of projectId -> boolean)
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({
    'proj-hyperion': true,
  });

  // Track which project cards are unlocked for editing (projectId -> draft Project)
  const [editingProjects, setEditingProjects] = useState<Record<string, Project>>({});

  // Track inline new task title per project
  const [newTaskInput, setNewTaskInput] = useState<Record<string, string>>({});
  const [newTaskTags, setNewTaskTags] = useState<Record<string, string>>({});

  const toggleDetails = (projectId: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  // Unlock a project card for editing, or confirm edit & lock again
  const handleToggleEditLock = (project: Project) => {
    const draft = editingProjects[project.id];
    if (draft) {
      // Confirm edit & lock again -> saves to central state and updates Section 01 reference
      onUpdateProject({
        ...draft,
        name: draft.name.trim() || project.name,
        businessType: draft.businessType.trim() || project.businessType,
        version: draft.version.trim() || project.version,
        startDate: draft.startDate || project.startDate,
        activeUsers: Number(draft.activeUsers) || 0,
        lastTouched: new Date().toISOString(),
      });
      setEditingProjects((prev) => {
        const next = { ...prev };
        delete next[project.id];
        return next;
      });
    } else {
      // Unlock for editing
      setEditingProjects((prev) => ({
        ...prev,
        [project.id]: {
          ...project,
          details: { ...project.details },
        },
      }));
    }
  };

  const updateDraftField = <K extends keyof Project>(
    projectId: string,
    field: K,
    value: Project[K]
  ) => {
    setEditingProjects((prev) => {
      const current = prev[projectId];
      if (!current) return prev;
      return {
        ...prev,
        [projectId]: {
          ...current,
          [field]: value,
        },
      };
    });
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
    <section className="space-y-12 text-left">
      {/* Section 02 Header Container: Text at Top & Bottom Edges with Open Space Between */}
      <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 min-h-[210px] px-3 sm:px-5 pt-2 pb-2 flex flex-col justify-between items-start text-left">
        {/* Top Edge Stacked Rows */}
        <div className="w-full flex flex-col items-start space-y-1 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <h2 className="font-mono text-sm sm:text-base font-bold tracking-tight text-neutral-950 dark:text-neutral-50 uppercase leading-none">
            02. ACTIVE SPRINT DELIVERABLES // SOURCE OF TRUTH
          </h2>
          <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
            PRIMARY PROJECT RECORDS (AGGREGATED INTO SECTION 01) · SEVEN-ARC SPECTRAL VELOCITY · LIVE TASK FILTERING
          </p>
          <div className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums leading-none pt-0.5">
            TOTAL SPRINT TASKS: <span className="font-bold text-neutral-900 dark:text-neutral-100">{tasks.length}</span>
          </div>
        </div>

        {/* Open Vertical Space */}
        <div className="flex-1 min-h-[40px]" />

        {/* Bottom Edge Stacked Rows: Search, Status Filter & Tag Filter */}
        <div className="w-full pt-3 border-t border-neutral-100 dark:border-neutral-900 flex flex-col items-start space-y-2 font-mono text-xs">
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-start gap-2">
            {/* Search Input */}
            <div className="w-full sm:w-96 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH BY TASK TITLE, TAG, OR ASSIGNEE..."
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-black dark:focus:border-white text-xs placeholder:text-neutral-400 text-left"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Buttons (Left-Aligned Row) */}
            <div className="flex flex-wrap items-center justify-start gap-1">
              <span className="text-[10px] uppercase text-neutral-400 mr-1">
                STATUS:
              </span>
              {(['ALL', 'done', 'in_progress', 'review', 'backlog'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 text-[10px] uppercase border transition-none whitespace-nowrap ${
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

          {/* Tag Filter Row Hugging Bottom Edge */}
          {allTags.length > 0 && (
            <div className="w-full flex flex-wrap items-center justify-start gap-2 font-mono text-[11px] leading-none">
              <span className="text-neutral-400 uppercase text-[10px]">FILTER BY TAG:</span>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-neutral-900 dark:text-neutral-100 font-bold underline"
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
      </div>

      {/* Projects Sprint Cards */}
      <div className="space-y-12">
        {projects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const completedCount = projectTasks.filter((t) => t.status === 'done').length;

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
          const draft = editingProjects[project.id];
          const isEditingProject = !!draft;

          return (
            <article
              key={project.id}
              id={`project-${project.id}`}
              className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-left"
            >
              {/* Project Card Header Container: Left-aligned stacked rows at top & bottom */}
              <div className="px-3 sm:px-5 pt-2 pb-2 min-h-[220px] border-b border-neutral-200 dark:border-neutral-800 flex flex-col justify-between items-start text-left">
                {/* Top Edge Stacked Rows */}
                <div className="w-full flex flex-col items-start space-y-2">
                  {/* Row 1: Project Title, Version Number, Business Type, Start Date, Users + 2 Action Icons (Edit/Confirm-Lock & Delete) */}
                  {isEditingProject ? (
                    <div className="w-full flex flex-col items-start space-y-2 pt-0.5">
                      <div className="w-full flex flex-wrap items-center justify-start gap-2">
                        {/* Two Action Icons: Confirm Edit & Lock Again + Delete Project */}
                        <div className="flex items-center gap-1.5 mr-1">
                          <button
                            type="button"
                            onClick={() => handleToggleEditLock(project)}
                            className="p-1.5 bg-neutral-900 text-white dark:bg-white dark:text-black border border-neutral-900 dark:border-white hover:opacity-90 flex items-center gap-1 font-mono text-[10px] uppercase"
                            title="Confirm edit and lock project again"
                            aria-label="Confirm edit and lock project again"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <Lock className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteProject(project.id)}
                            className="p-1.5 border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-red-600 hover:border-red-600 dark:hover:text-red-400 transition-none"
                            title="Delete project"
                            aria-label="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-mono text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          [EDITING UNLOCKED — UPDATES SECTION 01]
                        </span>
                      </div>

                      {/* Editable Fields Grid (Left-Aligned Stacked Rows) */}
                      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 font-mono text-xs">
                        <div>
                          <label className="block text-[9px] uppercase text-neutral-400 mb-0.5">
                            PROJECT NAME
                          </label>
                          <input
                            type="text"
                            value={draft.name}
                            onChange={(e) => updateDraftField(project.id, 'name', e.target.value)}
                            className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:border-black dark:focus:border-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase text-neutral-400 mb-0.5">
                            VERSION NUMBER
                          </label>
                          <input
                            type="text"
                            value={draft.version}
                            onChange={(e) => updateDraftField(project.id, 'version', e.target.value)}
                            className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs tabular-nums focus:outline-none focus:border-black dark:focus:border-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase text-neutral-400 mb-0.5">
                            BUSINESS TYPE
                          </label>
                          <input
                            type="text"
                            value={draft.businessType}
                            onChange={(e) =>
                              updateDraftField(project.id, 'businessType', e.target.value)
                            }
                            className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:border-black dark:focus:border-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase text-neutral-400 mb-0.5">
                            START DATE
                          </label>
                          <input
                            type="date"
                            value={draft.startDate}
                            onChange={(e) =>
                              updateDraftField(project.id, 'startDate', e.target.value)
                            }
                            className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs tabular-nums focus:outline-none focus:border-black dark:focus:border-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase text-neutral-400 mb-0.5">
                            NUMBER OF USERS
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={draft.activeUsers}
                            onChange={(e) =>
                              updateDraftField(project.id, 'activeUsers', Number(e.target.value))
                            }
                            className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs tabular-nums focus:outline-none focus:border-black dark:focus:border-white"
                          />
                        </div>
                      </div>

                      {/* Sprint Title & Goal Editable Row */}
                      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                        <div>
                          <label className="block text-[9px] uppercase text-neutral-400 mb-0.5">
                            CURRENT SPRINT TITLE
                          </label>
                          <input
                            type="text"
                            value={draft.currentSprintName}
                            onChange={(e) =>
                              updateDraftField(project.id, 'currentSprintName', e.target.value)
                            }
                            className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:border-black dark:focus:border-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase text-neutral-400 mb-0.5">
                            SPRINT OBJECTIVE
                          </label>
                          <input
                            type="text"
                            value={draft.sprintGoal}
                            onChange={(e) =>
                              updateDraftField(project.id, 'sprintGoal', e.target.value)
                            }
                            className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:border-black dark:focus:border-white"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Locked State Row 1: Action Icons (Edit & Delete) + Project Name + Version + Business Type + Start Date + Users */}
                      <div className="flex flex-wrap items-center justify-start gap-2 leading-none">
                        {/* Two Action Icons: 1. Edit Project (Unlocks), 2. Delete Project */}
                        <div className="flex items-center gap-1 mr-1">
                          <button
                            type="button"
                            onClick={() => handleToggleEditLock(project)}
                            className="p-1 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50 hover:border-neutral-400 dark:hover:border-neutral-600 transition-none"
                            title="Unlock to edit project (updates Section 01)"
                            aria-label="Edit project"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteProject(project.id)}
                            className="p-1 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:border-red-400 transition-none"
                            title="Delete project"
                            aria-label="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h3 className="font-mono text-base sm:text-lg font-bold tracking-tight text-neutral-950 dark:text-neutral-50 uppercase leading-none">
                          {project.name}
                        </h3>
                        <span className="font-mono text-xs font-semibold text-neutral-600 dark:text-neutral-300 tabular-nums leading-none">
                          {project.version}
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-700">·</span>
                        <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400 leading-none">
                          {project.businessType}
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-700">·</span>
                        <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400 tabular-nums leading-none">
                          STARTED {project.startDate}
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-700">·</span>
                        <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300 font-semibold tabular-nums leading-none">
                          {project.activeUsers.toLocaleString()} USERS
                        </span>
                      </div>

                      {/* Locked State Row 2: Sprint Title & Objective */}
                      <div className="flex flex-col items-start space-y-0.5 font-mono text-xs">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">
                          {project.currentSprintName}
                        </span>
                        {project.sprintGoal && (
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                            OBJECTIVE: {project.sprintGoal}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Row 3: Isolated Last Touched Date (Left-Aligned) */}
                  <div className="inline-flex items-center justify-start gap-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 px-2.5 py-1 font-mono text-[11px] leading-none">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                      LAST TOUCHED:
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                      {formatTimeAgo(project.lastTouched)}
                    </span>
                    <span className="text-neutral-300 dark:text-neutral-700">·</span>
                    <span className="text-[10px] text-neutral-400 tabular-nums">
                      {project.lastTouched.replace('T', ' ').substring(0, 16)} UTC
                    </span>
                  </div>
                </div>

                {/* Open Space in Middle of Header Container */}
                <div className="flex-1 min-h-[36px]" />

                {/* Bottom Edge Stacked Rows: Rainbow Progress & Expandable Details Trigger */}
                <div className="w-full pt-3 border-t border-neutral-100 dark:border-neutral-900 flex flex-col items-start justify-end space-y-2">
                  {/* Rainbow Progress Row */}
                  <div className="flex flex-wrap items-center justify-start gap-3">
                    <span className="font-mono text-[10px] uppercase text-neutral-400 tracking-wider leading-none">
                      SPRINT VELOCITY:
                    </span>
                    <RainbowProgress
                      completedCount={completedCount}
                      totalCount={projectTasks.length}
                      size="sm"
                      showLabel={true}
                    />
                    <span className="text-neutral-300 dark:text-neutral-700">·</span>
                    <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums leading-none">
                      {completedCount}/{projectTasks.length} TASKS COMPLETED
                    </span>
                  </div>

                  {/* Expand Details Toggle Row at Very Bottom Edge */}
                  <button
                    onClick={() => toggleDetails(project.id)}
                    className="font-mono text-xs text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white flex items-center justify-start gap-2 uppercase tracking-wide group leading-none"
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
                </div>
              </div>

              {/* Expandable Project Details Card Panel */}
              {isDetailsOpen && (
                <ProjectDetailsCard
                  details={project.details}
                  projectId={project.id}
                  projectName={project.name}
                  onUpdateDetails={(updated) => onUpdateProjectDetails(project.id, updated)}
                />
              )}

              {/* Tasks List Container: Left-aligned stacked rows at top & bottom */}
              <div className="px-3 sm:px-5 pt-2 pb-2 min-h-[280px] bg-white dark:bg-neutral-950 flex flex-col justify-between items-start text-left">
                {/* Top Edge: Task Queue Label + Stacked Task Rows */}
                <div className="w-full flex flex-col items-start">
                  <div className="pb-2 text-xs font-mono leading-none">
                    <span className="text-[11px] uppercase tracking-wider text-neutral-400">
                      NEXT SPRINT DELIVERABLES ({displayedTasks.length})
                    </span>
                  </div>

                  {displayedTasks.length === 0 ? (
                    <div className="w-full py-3 border-t border-b border-dashed border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-400 text-left">
                      No tasks match the active filters. Adjust your search or add a new sprint task below.
                    </div>
                  ) : (
                    <div className="w-full divide-y divide-neutral-100 dark:divide-neutral-900 border-t border-b border-neutral-200 dark:border-neutral-800">
                      {displayedTasks.map((task) => {
                        const isDone = task.status === 'done';

                        return (
                          <div
                            key={task.id}
                            className="pt-1.5 pb-3 flex flex-col items-start justify-between space-y-1.5 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-none text-left"
                          >
                            {/* Top Row of Task Cell: Checkbox & Task Title */}
                            <div className="flex items-start justify-start gap-2.5 w-full">
                              <button
                                onClick={() => onToggleTaskComplete(task.id)}
                                className={`mt-0.5 w-3.5 h-3.5 shrink-0 border flex items-center justify-center font-mono text-[10px] font-bold transition-none ${
                                  isDone
                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white'
                                    : 'border-neutral-400 hover:border-black dark:border-neutral-600 dark:hover:border-white'
                                }`}
                                title={isDone ? 'Mark as incomplete' : 'Mark as done'}
                                aria-label={isDone ? 'Mark as incomplete' : 'Mark as done'}
                              >
                                {isDone ? '✓' : ''}
                              </button>

                              <span
                                onClick={() => onToggleTaskComplete(task.id)}
                                className={`font-mono text-xs sm:text-sm cursor-pointer select-none leading-tight text-left ${
                                  isDone
                                    ? 'line-through text-neutral-400 dark:text-neutral-500'
                                    : 'text-neutral-900 dark:text-neutral-100 font-medium'
                                }`}
                              >
                                {task.title}
                              </span>
                            </div>

                            {/* Bottom Row of Task Cell: Left-aligned Tags, Status Selector & Delete */}
                            <div className="pl-6 flex flex-wrap items-center justify-start gap-2 font-mono text-[11px] text-neutral-400 dark:text-neutral-500 leading-none">
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  onUpdateTaskStatus(task.id, e.target.value as TaskStatus)
                                }
                                className="px-1.5 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] uppercase font-mono text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
                              >
                                <option value="backlog">Backlog</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                              </select>

                              {task.assignedTo && (
                                <>
                                  <span>·</span>
                                  <span>@{task.assignedTo}</span>
                                </>
                              )}

                              {task.tags.map((tag) => (
                                <React.Fragment key={tag}>
                                  <span>·</span>
                                  <span className="text-neutral-500 dark:text-neutral-400">
                                    #{tag}
                                  </span>
                                </React.Fragment>
                              ))}

                              <span>·</span>
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 text-[10px] uppercase"
                                title="Delete task from sprint"
                              >
                                DELETE
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Open Vertical Space in Middle of Tasks Container */}
                <div className="flex-1 min-h-[48px]" />

                {/* Bottom Edge: Inline "Add Next Task" form */}
                <form
                  onSubmit={(e) => handleAddNewTask(project.id, e)}
                  className="w-full pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 font-mono text-xs"
                >
                  <input
                    type="text"
                    value={newTaskInput[project.id] || ''}
                    onChange={(e) =>
                      setNewTaskInput((prev) => ({ ...prev, [project.id]: e.target.value }))
                    }
                    placeholder="+ ADD NEXT TASK FOR CURRENT SPRINT..."
                    className="flex-1 px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-black dark:focus:border-white text-xs text-left"
                  />
                  <input
                    type="text"
                    value={newTaskTags[project.id] || ''}
                    onChange={(e) =>
                      setNewTaskTags((prev) => ({ ...prev, [project.id]: e.target.value }))
                    }
                    placeholder="TAGS (e.g. api, db)"
                    className="sm:w-52 px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-black dark:focus:border-white text-xs text-left"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold uppercase tracking-wider text-xs whitespace-nowrap text-left"
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
