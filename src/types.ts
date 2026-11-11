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
  details: ProjectDetails;
}

export interface AuditLog {
  id: string;
  projectId: string;
  projectName: string;
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
