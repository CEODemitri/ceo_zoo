import React, { useState, useMemo, useRef } from 'react';
import { Pencil, Check, Trash2, Lock } from 'lucide-react';
import { Project, Task, TaskStatus, ProjectDetails } from '../types';
import { RainbowProgress } from './RainbowProgress';

interface SwipeableTaskRowProps {
  task: Task;
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onUpdateTaskTitle: (taskId: string, newTitle: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const SwipeableTaskRow: React.FC<SwipeableTaskRowProps> = ({
  task,
  onToggleTaskComplete,
  onUpdateTaskStatus,
  onUpdateTaskTitle,
  onDeleteTask,
}) => {
  const isDone = task.status === 'done';
  const [offsetX, setOffsetX] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const startXRef = useRef<number | null>(null);
  const baseOffsetRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const didMoveRef = useRef(false);

  const REVEAL_WIDTH = 56;

  const handleStart = (clientX: number) => {
    if (isEditingTitle) return;
    startXRef.current = clientX;
    baseOffsetRef.current = offsetX;
    isDraggingRef.current = true;
    didMoveRef.current = false;
  };

  const handleMove = (clientX: number) => {
    if (isEditingTitle || !isDraggingRef.current || startXRef.current === null) return;
    const deltaX = clientX - startXRef.current;
    if (Math.abs(deltaX) > 4) {
      didMoveRef.current = true;
    }
    const nextOffset = Math.min(0, Math.max(-REVEAL_WIDTH, baseOffsetRef.current + deltaX));
    setOffsetX(nextOffset);
  };

  const handleEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    startXRef.current = null;
    if (offsetX < -REVEAL_WIDTH / 2) {
      setOffsetX(-REVEAL_WIDTH);
    } else {
      setOffsetX(0);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isEditingTitle) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 8) {
      if (e.deltaX > 0) {
        setOffsetX(-REVEAL_WIDTH);
      } else {
        setOffsetX(0);
      }
    }
  };

  const commitTitleEdit = () => {
    const trimmed = draftTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdateTaskTitle(task.id, trimmed);
    } else {
      setDraftTitle(task.title);
    }
    setIsEditingTitle(false);
  };

  return (
    <div
      className="relative overflow-hidden select-none"
      onWheel={handleWheel}
    >
      {/* Revealed Trash Can Button Underneath on Right */}
      <button
        type="button"
        onClick={() => onDeleteTask(task.id)}
        className="absolute right-0 top-0 bottom-0 w-[56px] bg-[#D94E28] hover:bg-[#C2411E] text-white flex items-center justify-center z-0 cursor-pointer transition-colors"
        title="Delete task"
        aria-label="Delete task"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Sliding Foreground Task Row */}
      <div
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={() => {
          if (isDraggingRef.current) handleEnd();
        }}
        onClick={() => {
          if (!didMoveRef.current && offsetX < 0) {
            setOffsetX(0);
          }
        }}
        style={{ transform: `translateX(${offsetX}px)` }}
        className="relative z-10 bg-[#EFECE6] dark:bg-[#141417] pt-2 pb-2.5 pr-2 flex flex-col items-start justify-between space-y-1.5 hover:bg-[#E7E3DA] dark:hover:bg-[#1B1B20] transition-colors text-left cursor-grab active:cursor-grabbing"
      >
        {/* Top Row of Task Cell: Checkbox & Inline Editable Task Title */}
        <div className="flex items-start justify-start gap-2.5 w-full">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleTaskComplete(task.id);
            }}
            className={`mt-0.5 w-4 h-4 shrink-0 flex items-center justify-center font-mono text-[10px] font-bold transition-colors ${
              isDone
                ? 'bg-[#D94E28] dark:bg-[#E85D36] text-white'
                : 'bg-[#E2DDD2] hover:bg-[#D5CFC2] dark:bg-[#22222A] dark:hover:bg-[#2C2C36] text-transparent'
            }`}
            title={isDone ? 'Mark as incomplete' : 'Mark as done'}
            aria-label={isDone ? 'Mark as incomplete' : 'Mark as done'}
          >
            {isDone ? '✓' : ''}
          </button>

          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={draftTitle}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={commitTitleEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitTitleEdit();
                } else if (e.key === 'Escape') {
                  setDraftTitle(task.title);
                  setIsEditingTitle(false);
                }
              }}
              className="flex-1 font-sans text-xs sm:text-sm px-2 py-0.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36] text-left"
            />
          ) : (
            <span
              onClick={(e) => {
                if (didMoveRef.current) return;
                if (offsetX < 0) {
                  setOffsetX(0);
                  return;
                }
                e.stopPropagation();
                setDraftTitle(task.title);
                setIsEditingTitle(true);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setDraftTitle(task.title);
                setIsEditingTitle(true);
              }}
              title="Tap or double-click to edit task title"
              className={`font-sans text-xs sm:text-sm cursor-text select-none leading-snug text-left break-words ${
                isDone
                  ? 'line-through text-[#8C867E] dark:text-[#6E6A63]'
                  : 'text-[#181715] dark:text-[#F3F1EC] font-medium hover:text-[#D94E28] dark:hover:text-[#E85D36] transition-colors'
              }`}
            >
              {task.title}
            </span>
          )}
        </div>

        {/* Bottom Row of Task Cell: Status Selector Only */}
        <div className="pl-6.5 flex items-center justify-start font-mono text-[11px] leading-none">
          <select
            value={task.status}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              onUpdateTaskStatus(task.id, e.target.value as TaskStatus)
            }
            className="px-2 py-0.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[10px] uppercase font-mono text-[#5C5852] dark:text-[#A6A29A] focus:outline-none cursor-pointer"
          >
            <option value="backlog">Backlog</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
    </div>
  );
};

interface SprintSectionProps {
  projects: Project[];
  tasks: Task[];
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onUpdateTaskTitle: (taskId: string, newTitle: string) => void;
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
  onUpdateTaskTitle,
  onAddTask,
  onDeleteTask,
  onUpdateProjectDetails,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Expanded project details state (map of projectId -> boolean)
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({
    'proj-hyperion': false,
  });

  // Track which project cards are unlocked for editing (projectId -> draft Project)
  const [editingProjects, setEditingProjects] = useState<Record<string, Project>>({});

  // Track password visibility and clipboard copy feedback per project
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Track inline new task title per project
  const [newTaskInput, setNewTaskInput] = useState<Record<string, string>>({});
  const [newTaskTags, setNewTaskTags] = useState<Record<string, string>>({});

  const toggleDetails = (projectId: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const togglePasswordVisibility = (projectId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 1800);
  };

  // Unlock a project card for editing, or confirm edit & lock again
  const handleToggleEditLock = (project: Project) => {
    const draft = editingProjects[project.id];
    if (draft) {
      const cleanedDetails: ProjectDetails = {
        liveSite: draft.details.liveSite.trim(),
        hostedCompany: draft.details.hostedCompany.trim(),
        adminName: draft.details.adminName.trim(),
        adminPassword: draft.details.adminPassword || '',
        notes: draft.details.notes || '',
      };
      // Confirm edit & lock again -> saves to central state and updates Section 01 reference
      onUpdateProject({
        ...draft,
        name: draft.name.trim() || project.name,
        businessType: draft.businessType.trim() || project.businessType,
        version: draft.version.trim() || project.version,
        startDate: draft.startDate || project.startDate,
        activeUsers: Number(draft.activeUsers) || 0,
        details: cleanedDetails,
        lastTouched: new Date().toISOString(),
      });
      onUpdateProjectDetails(project.id, cleanedDetails);
      setEditingProjects((prev) => {
        const next = { ...prev };
        delete next[project.id];
        return next;
      });
    } else {
      // Unlock for editing and ensure details are revealed
      setExpandedDetails((prev) => ({ ...prev, [project.id]: true }));
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

  const updateDraftDetailField = <K extends keyof ProjectDetails>(
    projectId: string,
    field: K,
    value: ProjectDetails[K]
  ) => {
    setEditingProjects((prev) => {
      const current = prev[projectId];
      if (!current) return prev;
      return {
        ...prev,
        [projectId]: {
          ...current,
          details: {
            ...current.details,
            [field]: value,
          },
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
    <section className="space-y-10 text-left">
      {/* Section 02 Header Container: Borderless tonal card, text at top & bottom edges with open space between */}
      <div className="bg-[#EFECE6] dark:bg-[#141417] min-h-[210px] px-4 sm:px-6 pt-3 pb-3 flex flex-col justify-between items-start text-left">
        {/* Top Edge Stacked Rows */}
        <div className="w-full flex flex-col items-start space-y-1 border-b border-[#181715]/[0.07] dark:border-white/[0.06] pb-3">
          <h2 className="font-serif text-base sm:text-lg font-semibold tracking-tight text-[#181715] dark:text-[#F3F1EC] leading-none">
            02. Active Sprint Deliverables
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8C867E] dark:text-[#6E6A63] leading-tight">
            PRIMARY PROJECT RECORDS (AGGREGATED INTO SECTION 01) · SEVEN-ARC SPECTRAL VELOCITY · LIVE TASK FILTERING
          </p>
          <div className="font-mono text-[11px] text-[#5C5852] dark:text-[#A6A29A] tabular-nums leading-none pt-0.5">
            TOTAL SPRINT TASKS: <span className="font-bold text-[#181715] dark:text-[#F3F1EC]">{tasks.length}</span>
          </div>
        </div>

        {/* Open Vertical Space */}
        <div className="flex-1 min-h-[40px]" />

        {/* Bottom Edge Stacked Rows: Search, Status Filter & Tag Filter */}
        <div className="w-full pt-3 border-t border-[#181715]/[0.06] dark:border-white/[0.05] flex flex-col items-start space-y-2.5 font-mono text-xs">
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-start gap-2.5">
            {/* Search Input (Recessed Tonal Well) */}
            <div className="w-full sm:w-96 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH BY TASK TITLE, TAG, OR ASSIGNEE..."
                className="w-full px-3 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36] text-xs placeholder:text-[#8C867E] dark:placeholder:text-[#6E6A63] text-left"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C867E] hover:text-[#181715] dark:hover:text-[#F3F1EC] text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Buttons (Left-Aligned Tonal Row) */}
            <div className="flex flex-wrap items-center justify-start gap-1">
              <span className="text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] mr-1">
                STATUS:
              </span>
              {(['ALL', 'done', 'in_progress', 'review', 'backlog'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-[10px] uppercase transition-colors whitespace-nowrap shrink-0 ${
                    statusFilter === st
                      ? 'bg-[#D94E28] dark:bg-[#E85D36] text-white font-semibold'
                      : 'bg-[#E5E0D6] hover:bg-[#DBD5C9] dark:bg-[#1E1E24] dark:hover:bg-[#282830] text-[#5C5852] dark:text-[#A6A29A]'
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
              <span className="text-[#8C867E] dark:text-[#6E6A63] uppercase text-[10px]">FILTER BY TAG:</span>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-[#D94E28] dark:text-[#E85D36] font-bold underline whitespace-nowrap shrink-0"
                >
                  [CLEAR #{selectedTag}]
                </button>
              )}
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`transition-colors hover:underline whitespace-nowrap shrink-0 ${
                    selectedTag === tag
                      ? 'font-bold text-[#D94E28] dark:text-[#E85D36]'
                      : 'text-[#5C5852] dark:text-[#A6A29A]'
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
      <div className="space-y-10">
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
          const showPassword = !!visiblePasswords[project.id];

          return (
            <article
              key={project.id}
              id={`project-${project.id}`}
              className="bg-[#EFECE6] dark:bg-[#141417] text-left"
            >
              {/* Compressed & Combined Project Header + Details Container */}
              <div className="px-4 sm:px-6 py-3 border-b border-[#181715]/[0.07] dark:border-white/[0.06] flex flex-col items-start text-left">
                {/* Compact Title Bar (Always Visible: Toggle, Edit/Delete Icons, Title, Version, Velocity, Last Touched) */}
                <div className="w-full flex flex-wrap items-center justify-start gap-x-2.5 gap-y-1.5 leading-none">
                  {/* Sliding Toggle Control: Moving toggle leaves only title or reveals the rest of the details */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isDetailsOpen}
                    onClick={() => toggleDetails(project.id)}
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#5C5852] dark:text-[#A6A29A] hover:text-[#181715] dark:hover:text-[#F3F1EC] cursor-pointer select-none"
                    title={isDetailsOpen ? 'Collapse to title only' : 'Reveal project details & credentials'}
                  >
                    <span
                      className={`w-7 h-3.5 flex items-center p-0.5 transition-colors ${
                        isDetailsOpen
                          ? 'bg-[#D94E28] dark:bg-[#E85D36] justify-end'
                          : 'bg-[#D8D2C5] dark:bg-[#26262E] justify-start'
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 ${
                          isDetailsOpen
                            ? 'bg-white'
                            : 'bg-[#5C5852] dark:bg-[#A6A29A]'
                        }`}
                      />
                    </span>
                  </button>

                  {/* Edit/Confirm-Lock & Delete Action Icons */}
                  <div className="flex items-center gap-1">
                    {isEditingProject ? (
                      <button
                        type="button"
                        onClick={() => handleToggleEditLock(project)}
                        className="p-1.5 bg-[#D94E28] dark:bg-[#E85D36] text-white hover:opacity-90 flex items-center gap-0.5 font-mono text-[10px] uppercase transition-opacity"
                        title="Confirm edit and lock project again"
                        aria-label="Confirm edit and lock project again"
                      >
                        <Check className="w-3 h-3" />
                        <Lock className="w-2.5 h-2.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleEditLock(project)}
                        className="p-1.5 bg-[#E5E0D6] hover:bg-[#DBD5C9] dark:bg-[#1E1E24] dark:hover:bg-[#282830] text-[#5C5852] dark:text-[#A6A29A] hover:text-[#181715] dark:hover:text-[#F3F1EC] transition-colors"
                        title="Unlock to edit project & details"
                        aria-label="Edit project"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteProject(project.id)}
                      className="p-1.5 bg-[#E5E0D6] hover:bg-[#DBD5C9] dark:bg-[#1E1E24] dark:hover:bg-[#282830] text-[#5C5852] dark:text-[#A6A29A] hover:text-[#D94E28] dark:hover:text-[#E85D36] transition-colors"
                      title="Delete project"
                      aria-label="Delete project"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Project Title (Clicking also toggles details when locked) */}
                  <h3
                    onClick={() => !isEditingProject && toggleDetails(project.id)}
                    className="font-serif text-base sm:text-lg font-semibold tracking-tight text-[#181715] dark:text-[#F3F1EC] leading-none cursor-pointer select-none"
                  >
                    {project.name}
                  </h3>

                  <span className="font-mono text-xs font-semibold text-[#5C5852] dark:text-[#A6A29A] tabular-nums leading-none">
                    {project.version}
                  </span>

                  <span className="text-[#8C867E]/60">·</span>

                  {/* Compact Rainbow Velocity */}
                  <div className="inline-flex items-center gap-1.5">
                    <RainbowProgress
                      completedCount={completedCount}
                      totalCount={projectTasks.length}
                      size="sm"
                      showLabel={true}
                    />
                    <span className="font-mono text-[10px] text-[#5C5852] dark:text-[#A6A29A] tabular-nums leading-none">
                      ({completedCount}/{projectTasks.length})
                    </span>
                  </div>

                  <span className="text-[#8C867E]/60">·</span>

                  {/* Compact Last Touched */}
                  <span className="font-mono text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] tabular-nums leading-none">
                    TOUCHED <strong className="text-[#181715] dark:text-[#F3F1EC]">{formatTimeAgo(project.lastTouched)}</strong>
                  </span>
                </div>

                {/* Expanded Combined Details & Edit Drawer (Hidden when toggle is off and not editing) */}
                {(isDetailsOpen || isEditingProject) && (
                  <div className="w-full pt-3 mt-2.5 border-t border-[#181715]/[0.07] dark:border-white/[0.06] flex flex-col items-start space-y-2 font-mono text-xs text-left">
                    {isEditingProject && draft ? (
                      <div className="w-full flex flex-col items-start space-y-2.5">
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                          <div>
                            <label className="block text-[9px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-0.5">
                              PROJECT NAME
                            </label>
                            <input
                              type="text"
                              value={draft.name}
                              onChange={(e) => updateDraftField(project.id, 'name', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] text-xs focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-0.5">
                              VERSION
                            </label>
                            <input
                              type="text"
                              value={draft.version}
                              onChange={(e) => updateDraftField(project.id, 'version', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-0.5">
                              BUSINESS TYPE
                            </label>
                            <input
                              type="text"
                              value={draft.businessType}
                              onChange={(e) => updateDraftField(project.id, 'businessType', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] text-xs focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-0.5">
                              START DATE
                            </label>
                            <input
                              type="date"
                              value={draft.startDate}
                              onChange={(e) => updateDraftField(project.id, 'startDate', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-0.5">
                              USERS
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={draft.activeUsers}
                              onChange={(e) => updateDraftField(project.id, 'activeUsers', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                            />
                          </div>
                        </div>

                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-0.5">
                              CURRENT SPRINT TITLE
                            </label>
                            <input
                              type="text"
                              value={draft.currentSprintName}
                              onChange={(e) => updateDraftField(project.id, 'currentSprintName', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] text-xs focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-0.5">
                              SPRINT OBJECTIVE
                            </label>
                            <input
                              type="text"
                              value={draft.sprintGoal}
                              onChange={(e) => updateDraftField(project.id, 'sprintGoal', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] text-xs focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                            />
                          </div>
                        </div>

                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          <div>
                            <label className="block text-[9px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-0.5">
                              LIVE SITE URL
                            </label>
                            <input
                              type="text"
                              value={draft.details.liveSite}
                              onChange={(e) => updateDraftDetailField(project.id, 'liveSite', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] text-xs focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-0.5">
                              HOSTED COMPANY
                            </label>
                            <input
                              type="text"
                              value={draft.details.hostedCompany}
                              onChange={(e) => updateDraftDetailField(project.id, 'hostedCompany', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] text-xs focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-0.5">
                              ADMIN NAME
                            </label>
                            <input
                              type="text"
                              value={draft.details.adminName}
                              onChange={(e) => updateDraftDetailField(project.id, 'adminName', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] text-xs focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-0.5">
                              ADMIN PASSWORD
                            </label>
                            <input
                              type="text"
                              value={draft.details.adminPassword || ''}
                              onChange={(e) => updateDraftDetailField(project.id, 'adminPassword', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] text-xs focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                            />
                          </div>
                        </div>

                        <div className="w-full">
                          <label className="block text-[9px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-0.5">
                            OPERATIONS NOTE
                          </label>
                          <input
                            type="text"
                            value={draft.details.notes || ''}
                            onChange={(e) => updateDraftDetailField(project.id, 'notes', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] text-xs focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-start space-y-1.5 text-[11px] leading-tight">
                        {/* Row 1: Business Type, Start Date, Users, Sprint Name & Objective */}
                        <div className="w-full flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-[#5C5852] dark:text-[#A6A29A]">
                          <span className="font-semibold text-[#181715] dark:text-[#F3F1EC]">
                            {project.businessType}
                          </span>
                          <span className="text-[#8C867E]/60">·</span>
                          <span className="tabular-nums">STARTED {project.startDate}</span>
                          <span className="text-[#8C867E]/60">·</span>
                          <span className="font-semibold tabular-nums text-[#181715] dark:text-[#F3F1EC]">
                            {project.activeUsers.toLocaleString()} USERS
                          </span>
                          <span className="text-[#8C867E]/60">·</span>
                          <span className="text-[#181715] dark:text-[#F3F1EC] font-semibold">
                            {project.currentSprintName}
                          </span>
                          {project.sprintGoal && (
                            <>
                              <span className="text-[#8C867E]/60">—</span>
                              <span className="text-[#5C5852] dark:text-[#A6A29A]">
                                {project.sprintGoal}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Row 2: Live Site, Hosted Company, Admin Name, Admin Password */}
                        <div className="w-full flex flex-wrap items-center justify-start gap-x-3 gap-y-1">
                          <div className="inline-flex flex-wrap items-center gap-1">
                            <span className="text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63]">SITE:</span>
                            <a
                              href={project.details.liveSite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#181715] dark:text-[#F3F1EC] font-semibold hover:text-[#D94E28] dark:hover:text-[#E85D36] hover:underline break-all"
                            >
                              {project.details.liveSite}
                            </a>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(project.details.liveSite, `${project.id}-site`)}
                              className="text-[10px] text-[#8C867E] hover:text-[#D94E28] dark:hover:text-[#E85D36] uppercase underline"
                            >
                              [{copiedKey === `${project.id}-site` ? 'COPIED' : 'COPY'}]
                            </button>
                          </div>

                          <span className="text-[#8C867E]/60">·</span>

                          <div className="inline-flex flex-wrap items-center gap-1">
                            <span className="text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63]">HOST:</span>
                            <span className="text-[#181715] dark:text-[#F3F1EC] font-medium">
                              {project.details.hostedCompany}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(project.details.hostedCompany, `${project.id}-host`)}
                              className="text-[10px] text-[#8C867E] hover:text-[#D94E28] dark:hover:text-[#E85D36] uppercase underline"
                            >
                              [{copiedKey === `${project.id}-host` ? 'COPIED' : 'COPY'}]
                            </button>
                          </div>

                          <span className="text-[#8C867E]/60">·</span>

                          <div className="inline-flex flex-wrap items-center gap-1">
                            <span className="text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63]">ADMIN:</span>
                            <span className="text-[#181715] dark:text-[#F3F1EC] font-medium">
                              {project.details.adminName}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(project.details.adminName, `${project.id}-admin`)}
                              className="text-[10px] text-[#8C867E] hover:text-[#D94E28] dark:hover:text-[#E85D36] uppercase underline"
                            >
                              [{copiedKey === `${project.id}-admin` ? 'COPIED' : 'COPY'}]
                            </button>
                          </div>

                          <span className="text-[#8C867E]/60">·</span>

                          <div className="inline-flex flex-wrap items-center gap-1">
                            <span className="text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63]">PASS:</span>
                            <span className="text-[#181715] dark:text-[#F3F1EC] select-all">
                              {project.details.adminPassword
                                ? showPassword
                                  ? project.details.adminPassword
                                  : '••••••••'
                                : 'N/A'}
                            </span>
                            {project.details.adminPassword && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(project.id)}
                                  className="text-[10px] text-[#8C867E] hover:text-[#D94E28] dark:hover:text-[#E85D36] uppercase underline"
                                >
                                  [{showPassword ? 'HIDE' : 'SHOW'}]
                                </button>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(project.details.adminPassword!, `${project.id}-pass`)}
                                  className="text-[10px] text-[#8C867E] hover:text-[#D94E28] dark:hover:text-[#E85D36] uppercase underline"
                                >
                                  [{copiedKey === `${project.id}-pass` ? 'COPIED' : 'COPY'}]
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Row 3: Operations Note & Full UTC Timestamp */}
                        <div className="w-full flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-[#5C5852] dark:text-[#A6A29A]">
                          {project.details.notes && (
                            <>
                              <span>NOTE: {project.details.notes}</span>
                              <span className="text-[#8C867E]/60">·</span>
                            </>
                          )}
                          <span className="text-[10px] text-[#8C867E] dark:text-[#6E6A63] tabular-nums">
                            UPDATED {project.lastTouched.replace('T', ' ').substring(0, 16)} UTC
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tasks List Container: Left-aligned stacked rows at top & bottom */}
              <div className="px-4 sm:px-6 pt-3 pb-3 min-h-[280px] flex flex-col justify-between items-start text-left">
                {/* Top Edge: Task Queue Label + Stacked Task Rows */}
                <div className="w-full flex flex-col items-start">
                  <div className="pb-2 text-xs font-mono leading-none">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-[#8C867E] dark:text-[#6E6A63]">
                      NEXT SPRINT DELIVERABLES ({displayedTasks.length})
                    </span>
                  </div>

                  {displayedTasks.length === 0 ? (
                    <div className="w-full py-3 border-t border-b border-[#181715]/[0.07] dark:border-white/[0.06] font-mono text-xs text-[#8C867E] dark:text-[#6E6A63] text-left">
                      No tasks match the active filters. Adjust your search or add a new sprint task below.
                    </div>
                  ) : (
                    <div className="w-full divide-y divide-[#181715]/[0.06] dark:divide-white/[0.05] border-t border-b border-[#181715]/[0.08] dark:border-white/[0.07]">
                      {displayedTasks.map((task) => (
                        <SwipeableTaskRow
                          key={task.id}
                          task={task}
                          onToggleTaskComplete={onToggleTaskComplete}
                          onUpdateTaskStatus={onUpdateTaskStatus}
                          onUpdateTaskTitle={onUpdateTaskTitle}
                          onDeleteTask={onDeleteTask}
                        />
                      ))}
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
                    className="flex-1 px-3 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36] text-xs placeholder:text-[#8C867E] dark:placeholder:text-[#6E6A63] text-left"
                  />
                  <input
                    type="text"
                    value={newTaskTags[project.id] || ''}
                    onChange={(e) =>
                      setNewTaskTags((prev) => ({ ...prev, [project.id]: e.target.value }))
                    }
                    placeholder="TAGS (e.g. api, db)"
                    className="sm:w-52 px-3 py-1.5 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36] text-xs placeholder:text-[#8C867E] dark:placeholder:text-[#6E6A63] text-left"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#D94E28] hover:bg-[#C2411E] dark:bg-[#E85D36] dark:hover:bg-[#D94E28] text-white font-semibold uppercase tracking-wider text-xs whitespace-nowrap shrink-0 text-left transition-colors"
                  >
                    Add Task
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
