export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done';

export interface ProjectDetails {
  liveSite: string;
  hostedCompany: string;
  adminName: string;
  adminPassword?: string;
  notes?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  tags: string[];
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  businessType: string;
  startDate: string;
  version: string;
  activeUsers: number;
  lastTouched: string;
  currentSprintName: string;
  sprintGoal: string;
  sprintCompleted?: boolean;
  details: ProjectDetails;
}

/**
 * Version Framework: X.Y.Z (e.g. 1.2.8)
 * X = Version number
 * Y = Sprint number
 * Z = Number of tasks completed and pushed to live site
 */
export const parseVersionFramework = (
  ver: string
): { major: number; sprint: number; completed: number } => {
  const clean = ver.trim().replace(/^v/i, '').split('-')[0];
  const parts = clean.split('.').map((n) => parseInt(n, 10));
  return {
    major: isNaN(parts[0]) ? 1 : parts[0],
    sprint: isNaN(parts[1]) ? 1 : parts[1],
    completed: isNaN(parts[2]) ? 0 : parts[2],
  };
};

export const formatVersionFramework = (
  major: number,
  sprint: number,
  completed: number
): string => {
  return `${Math.max(1, major)}.${Math.max(1, sprint)}.${Math.max(0, completed)}`;
};

export interface SprintDeliverableLogItem {
  id: string;
  title: string;
  status: TaskStatus;
  tags: string[];
  assignedTo?: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  projectId: string;
  projectName: string;
  version?: string;
  sprintName?: string;
  sprintGoal?: string;
  deliverables?: SprintDeliverableLogItem[];
  timestamp: string;
  action: 'CREATE' | 'VERSION_BUMP' | 'TASK_COMPLETE' | 'DEPLOY' | 'CONFIG_UPDATE';
  summary: string;
  author: string;
}

export interface UserSession {
  username: string;
  role: string;
  signedInAt: string;
}
