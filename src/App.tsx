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
const STORAGE_LOGS_KEY = 'kern_logs_data_v1';

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

  // Helper to record an audit log entry
  const recordLog = (
    projectId: string,
    action: AuditLog['action'],
    summary: string
  ) => {
    const project = projects.find((p) => p.id === projectId);
    const newEntry: AuditLog = {
      id: `log-${Date.now()}`,
      projectId,
      projectName: project ? project.name : 'Unknown System',
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

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    touchProject(task.projectId);
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
    <div className="min-h-screen bg-[#FBFBFC] dark:bg-[#0B0C0E] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-none">
      {/* Top Bar (3-zone contract, no title icons) */}
      <TopBar
        onOpenAuditLog={() => setIsLogModalOpen(true)}
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* Main Dashboard Canvas (Big open Swiss space, high-precision typography) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-16 space-y-16 sm:space-y-20 text-left">
        {/* Editorial Sub-Header & Status Strip Container: Left-aligned stacked rows at top & bottom */}
        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 sm:px-5 pt-2 pb-2 min-h-[120px] flex flex-col justify-between items-start text-left">
          {/* Top Edge Row */}
          <div className="flex flex-col items-start space-y-0.5">
            <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-none">
              SYSTEM DASHBOARD // WORKSPACE SPECIFICATION
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50 font-sans leading-tight">
              Software Engineering Operations
            </h1>
          </div>

          {/* Open Vertical Space */}
          <div className="flex-1 min-h-[28px]" />

          {/* Bottom Edge Row */}
          <div className="font-mono text-xs text-neutral-500 dark:text-neutral-400 flex flex-wrap items-center justify-start gap-2 leading-none">
            <span>STATUS: </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              NOMINAL
            </span>
            <span>·</span>
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
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onUpdateProjectDetails={handleUpdateProjectDetails}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          </div>
        )}
      </main>

      {/* Swiss Clean Footer: Left-aligned stacked rows at top & bottom */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 pt-2 pb-2 font-mono text-xs text-neutral-500 dark:text-neutral-400 text-left">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 min-h-[68px] flex flex-col items-start justify-between">
          <div className="flex items-center justify-start gap-3 leading-none">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 uppercase">
              Zoo
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span>SWISS MODERNIST PROJECT MANAGEMENT ARCHITECTURE</span>
          </div>

          <div className="text-[11px] text-neutral-400 dark:text-neutral-500 tabular-nums leading-none">
            7-ARC SPECTRAL VELOCITY ENGINE · ZERO PILLS · PURE SWISS ALIGNMENT
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProjectLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        projects={projects}
        logs={logs}
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
