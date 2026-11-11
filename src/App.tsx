/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Project, Task, AuditLog, TaskStatus, ProjectDetails } from './types';
import { INITIAL_PROJECTS, INITIAL_TASKS, INITIAL_AUDIT_LOGS } from './data/seedData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TopBar } from './components/TopBar';
import { ProjectRegistryTable } from './components/ProjectRegistryTable';
import { SprintSection } from './components/SprintSection';
import { ProjectLogModal } from './components/ProjectLogModal';
import { NewProjectModal } from './components/NewProjectModal';
import { AuthModal } from './components/AuthModal';

const STORAGE_PROJECTS_KEY = 'kern_projects_data_v1';
const STORAGE_TASKS_KEY = 'kern_tasks_data_v1';
const STORAGE_LOGS_KEY = 'zoo_logs_data_v2';

function DashboardContent() {
  const { user } = useAuth();

  // Persistent projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PROJECTS;
  });

  // Persistent tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TASKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TASKS;
  });

  // Persistent audit logs state
  const [logs, setLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_AUDIT_LOGS;
  });

  // UI Navigation & Modals
  const [activeSection, setActiveSection] = useState<'all' | 'projects' | 'sprints'>('all');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs));
    } catch {
      // ignore
    }
  }, [logs]);

  // Helper to record an audit log entry with version, sprint, and deliverables context
  const recordLog = (
    projectId: string,
    action: AuditLog['action'],
    summary: string
  ) => {
    const project = projects.find((p) => p.id === projectId);
    const projectDeliverables = tasks
      .filter((t) => t.projectId === projectId)
      .map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        tags: t.tags,
        assignedTo: t.assignedTo,
        updatedAt: t.updatedAt,
      }));
    const newEntry: AuditLog = {
      id: `log-${Date.now()}`,
      projectId,
      projectName: project ? project.name : 'Unknown System',
      version: project?.version,
      sprintName: project?.currentSprintName,
      sprintGoal: project?.sprintGoal,
      deliverables: projectDeliverables,
      timestamp: new Date().toISOString(),
      action,
      summary,
      author: user?.username || 'system_operator',
    };
    setLogs((prev) => [newEntry, ...prev]);
  };

  // Helper to touch project's last modified timestamp
  const touchProject = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, lastTouched: new Date().toISOString() } : p
      )
    );
  };

  // Task event handlers
  const handleToggleTaskComplete = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus: TaskStatus = task.status === 'done' ? 'in_progress' : 'done';
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      )
    );
    touchProject(task.projectId);
    recordLog(
      task.projectId,
      'TASK_COMPLETE',
      `${newStatus === 'done' ? 'Completed task' : 'Reopened task'}: "${task.title}"`
    );
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      )
    );
    touchProject(task.projectId);
    recordLog(
      task.projectId,
      'TASK_COMPLETE',
      `Updated status to [${newStatus.toUpperCase()}] for "${task.title}"`
    );
  };

  const handleUpdateTaskTitle = (taskId: string, newTitle: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, title: newTitle, updatedAt: new Date().toISOString() }
          : t
      )
    );
    touchProject(task.projectId);
    recordLog(
      task.projectId,
      'CONFIG_UPDATE',
      `Edited task title to "${newTitle}"`
    );
  };

  const handleAddTask = (projectId: string, title: string, tags: string[]) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      projectId,
      title,
      status: 'in_progress',
      tags,
      assignedTo: user?.username || 'operator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    touchProject(projectId);
    recordLog(projectId, 'CREATE', `Created sprint task: "${title}"`);
  };

  const [deletedTaskUndo, setDeletedTaskUndo] = useState<{
    task: Task;
    index: number;
  } | null>(null);
  const undoTimerRef = React.useRef<number | null>(null);

  const handleDeleteTask = (taskId: string) => {
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return;
    const task = tasks[index];

    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
    }

    setDeletedTaskUndo({ task, index });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    touchProject(task.projectId);

    undoTimerRef.current = window.setTimeout(() => {
      setDeletedTaskUndo(null);
      undoTimerRef.current = null;
    }, 5500);
  };

  const handleUndoDeleteTask = () => {
    if (!deletedTaskUndo) return;
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    const { task, index } = deletedTaskUndo;
    setTasks((prev) => {
      const next = [...prev];
      next.splice(Math.min(index, next.length), 0, task);
      return next;
    });
    touchProject(task.projectId);
    setDeletedTaskUndo(null);
  };

  // SemVer bump handler (e.g. v3.2.0 -> v3.2.1 or v3.3.0)
  const handleBumpVersion = (projectId: string, type: 'patch' | 'minor') => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const clean = p.version.replace(/^v/, '');
        const parts = clean.split('.').map(Number);
        const major = isNaN(parts[0]) ? 1 : parts[0];
        const minor = isNaN(parts[1]) ? 0 : parts[1];
        const patch = isNaN(parts[2]) ? 0 : parts[2];

        let newVersion = p.version;
        if (type === 'patch') {
          newVersion = `v${major}.${minor}.${patch + 1}`;
        } else if (type === 'minor') {
          newVersion = `v${major}.${minor + 1}.0`;
        }

        recordLog(
          projectId,
          'VERSION_BUMP',
          `Bumped version tag from ${p.version} to ${newVersion}`
        );

        return {
          ...p,
          version: newVersion,
          lastTouched: new Date().toISOString(),
        };
      })
    );
  };

  // Project details & credentials update
  const handleUpdateProjectDetails = (projectId: string, details: ProjectDetails) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, details, lastTouched: new Date().toISOString() }
          : p
      )
    );
    recordLog(projectId, 'CONFIG_UPDATE', 'Updated hosting platform & admin credentials record');
  };

  // Full project update from Section 02 (aggregates into Section 01 reference table)
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
    recordLog(
      updatedProject.id,
      'CONFIG_UPDATE',
      `Confirmed project edit: "${updatedProject.name}" (${updatedProject.version}, ${updatedProject.activeUsers.toLocaleString()} users)`
    );
  };

  // Add new project
  const handleAddProject = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    recordLog(newProject.id, 'CREATE', `Initialized project repository "${newProject.name}" in registry`);
  };

  // Delete project
  const handleDeleteProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
    recordLog(projectId, 'DEPLOY', `Decommissioned project "${project.name}" from active registry`);
  };

  // Scroll to project in sprints section
  const handleSelectProject = (projectId: string) => {
    setActiveSection('all');
    // Give state a tick to ensure both sections are rendered
    setTimeout(() => {
      const element = document.getElementById(`project-${projectId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F6F4EF] dark:bg-[#0C0C0E] text-[#181715] dark:text-[#F3F1EC] flex flex-col font-sans transition-colors duration-150">
      {/* Top Bar */}
      <TopBar
        onOpenAuditLog={() => setIsLogModalOpen(true)}
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-8 lg:px-12 py-6 sm:py-14 space-y-10 sm:space-y-16 text-left">
        {/* Editorial Sub-Header & Status Strip Container: Borderless tonal card, left-aligned stacked rows at top & bottom */}
        <div className="bg-[#EFECE6] dark:bg-[#141417] px-4 sm:px-6 pt-3 pb-3 min-h-[108px] sm:min-h-[124px] flex flex-col justify-between items-start text-left">
          {/* Top Edge Row */}
          <div className="flex flex-col items-start space-y-1">
            <div className="font-mono text-[10px] text-[#8C867E] dark:text-[#6E6A63] uppercase tracking-[0.14em] leading-none">
              STUDIO WORKSPACE · ARCHITECTURE & SPRINT LEDGER
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#181715] dark:text-[#F3F1EC] font-serif leading-tight">
              Software Engineering Operations
            </h1>
          </div>

          {/* Open Vertical Space */}
          <div className="flex-1 min-h-[20px] sm:min-h-[28px]" />

          {/* Bottom Edge Row */}
          <div className="font-mono text-[11px] text-[#5C5852] dark:text-[#A6A29A] flex flex-wrap items-center justify-start gap-2 leading-none">
            <span className="text-[#8C867E] dark:text-[#6E6A63]">STATUS:</span>
            <span className="font-semibold text-[#181715] dark:text-[#F3F1EC]">
              NOMINAL
            </span>
            <span className="text-[#8C867E]/60">·</span>
            <span className="tabular-nums">
              {new Date().toISOString().substring(0, 10)}
            </span>
          </div>
        </div>

        {/* SECTION 1: All Projects Registry */}
        {(activeSection === 'all' || activeSection === 'projects') && (
          <div id="section-projects">
            <ProjectRegistryTable
              projects={projects}
              logs={logs}
              tasks={tasks}
              onOpenLogModal={() => setIsLogModalOpen(true)}
              onOpenNewProject={() => setIsNewProjectModalOpen(true)}
              onSelectProject={handleSelectProject}
              onBumpVersion={handleBumpVersion}
              onDeleteProject={handleDeleteProject}
            />
          </div>
        )}

        {/* SECTION 2: Current Sprint Deliverables & Task Tracker */}
        {(activeSection === 'all' || activeSection === 'sprints') && (
          <div id="section-sprints">
            <SprintSection
              projects={projects}
              tasks={tasks}
              onToggleTaskComplete={handleToggleTaskComplete}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onUpdateTaskTitle={handleUpdateTaskTitle}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onUpdateProjectDetails={handleUpdateProjectDetails}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          </div>
        )}
      </main>

      {/* Swipe-to-Delete Undo Toast Bar */}
      {deletedTaskUndo && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-8 sm:max-w-md z-50 bg-[#181715] text-[#F3F1EC] dark:bg-[#F3F1EC] dark:text-[#181715] px-4 py-3 shadow-xl flex items-center justify-between gap-4 font-mono text-xs"
        >
          <div className="truncate">
            <span className="text-[#A6A29A] dark:text-[#5C5852] uppercase text-[10px] mr-2">
              TASK DELETED:
            </span>
            <span className="font-sans font-medium">
              {deletedTaskUndo.task.title}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleUndoDeleteTask}
              className="px-2.5 py-1 bg-[#D94E28] hover:bg-[#C2411E] text-white font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap cursor-pointer transition-colors"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => setDeletedTaskUndo(null)}
              className="px-1.5 py-1 text-[#A6A29A] hover:text-white dark:text-[#5C5852] dark:hover:text-black"
              aria-label="Dismiss undo notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Editorial Studio Footer: Left-aligned stacked rows at top & bottom */}
      <footer className="bg-[#EFECE6] dark:bg-[#141417] pt-3 pb-3 font-mono text-xs text-[#5C5852] dark:text-[#A6A29A] text-left">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-12 min-h-[60px] sm:min-h-[68px] flex flex-col items-start justify-between gap-2">
          <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3 leading-tight">
            <span className="font-serif text-sm font-semibold text-[#181715] dark:text-[#F3F1EC]">
              Zoo
            </span>
            <span className="text-[#8C867E]/60">·</span>
            <span className="text-[11px]">EDITORIAL SOFTWARE PROJECT & SPRINT STUDIO</span>
          </div>

          <div className="text-[10px] sm:text-[11px] text-[#8C867E] dark:text-[#6E6A63] tabular-nums leading-tight">
            7-ARC SPECTRAL VELOCITY · TONAL SURFACE ARCHITECTURE
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProjectLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        projects={projects}
        logs={logs}
        tasks={tasks}
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onAddProject={handleAddProject}
      />

      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DashboardContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
