import { jsPDF } from 'jspdf';
import { Project, AuditLog, Task, SprintDeliverableLogItem } from '../types';

export interface SprintLogGroup {
  sprintName: string;
  sprintGoal: string;
  deliverables: SprintDeliverableLogItem[];
  events: AuditLog[];
}

export interface VersionLogGroup {
  key: string;
  projectId: string;
  projectName: string;
  businessType: string;
  version: string;
  isCurrentVersion: boolean;
  latestTimestamp: string;
  sprints: SprintLogGroup[];
}

export const buildVersionSprintLogHierarchy = (
  projects: Project[],
  logs: AuditLog[],
  tasks: Task[] = []
): VersionLogGroup[] => {
  const projectMap = new Map<string, Project>();
  projects.forEach((p) => projectMap.set(p.id, p));

  const versionGroupsMap = new Map<string, VersionLogGroup>();

  const ensureVersionAndSprint = (
    projectId: string,
    projectName: string,
    businessType: string,
    version: string,
    sprintName: string,
    sprintGoal: string,
    timestamp: string,
    isCurrentVersion: boolean
  ): { vGroup: VersionLogGroup; sGroup: SprintLogGroup } => {
    const vKey = `${projectId}::${version}`;
    let vGroup = versionGroupsMap.get(vKey);
    if (!vGroup) {
      vGroup = {
        key: vKey,
        projectId,
        projectName,
        businessType,
        version,
        isCurrentVersion,
        latestTimestamp: timestamp,
        sprints: [],
      };
      versionGroupsMap.set(vKey, vGroup);
    } else {
      if (isCurrentVersion) vGroup.isCurrentVersion = true;
      if (timestamp > vGroup.latestTimestamp) {
        vGroup.latestTimestamp = timestamp;
      }
    }

    let sGroup = vGroup.sprints.find((s) => s.sprintName === sprintName);
    if (!sGroup) {
      sGroup = {
        sprintName,
        sprintGoal,
        deliverables: [],
        events: [],
      };
      vGroup.sprints.push(sGroup);
    } else if (!sGroup.sprintGoal && sprintGoal) {
      sGroup.sprintGoal = sprintGoal;
    }

    return { vGroup, sGroup };
  };

  // 1. Seed current active Version -> Sprint -> All Deliverables from live projects & tasks
  projects.forEach((proj) => {
    const projTasks = tasks.filter((t) => t.projectId === proj.id);
    const { sGroup } = ensureVersionAndSprint(
      proj.id,
      proj.name,
      proj.businessType,
      proj.version,
      proj.currentSprintName,
      proj.sprintGoal,
      proj.lastTouched,
      true
    );

    projTasks.forEach((t) => {
      if (!sGroup.deliverables.some((d) => d.id === t.id)) {
        sGroup.deliverables.push({
          id: t.id,
          title: t.title,
          status: t.status,
          tags: t.tags,
          assignedTo: t.assignedTo,
          updatedAt: t.updatedAt,
        });
      }
    });
  });

  // 2. Fold in all AuditLog records (including prior versions, historical sprints, and deliverable snapshots)
  logs.forEach((log) => {
    const proj = projectMap.get(log.projectId);
    const version = log.version || proj?.version || 'v1.0.0';
    const sprintName = log.sprintName || proj?.currentSprintName || 'Sprint 01 // Core';
    const sprintGoal = log.sprintGoal || (version === proj?.version ? proj?.sprintGoal || '' : '');
    const businessType = proj?.businessType || 'Software System';
    const isCurrent = proj ? proj.version === version : false;

    const { sGroup } = ensureVersionAndSprint(
      log.projectId,
      log.projectName,
      businessType,
      version,
      sprintName,
      sprintGoal,
      log.timestamp,
      isCurrent
    );

    if (log.deliverables && log.deliverables.length > 0) {
      log.deliverables.forEach((item) => {
        if (!sGroup.deliverables.some((d) => d.id === item.id)) {
          sGroup.deliverables.push(item);
        }
      });
    }

    sGroup.events.push(log);
  });

  return Array.from(versionGroupsMap.values());
};

export const exportProjectsAuditPDF = (
  projects: Project[],
  logs: AuditLog[],
  tasks: Task[] = []
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 20;

  doc.setFont('courier', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text('ZOO // SOFTWARE PROJECT REGISTRY & VERSION SPRINT LOG', 15, currentY);

  currentY += 7;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  doc.text(
    `GENERATED: ${now}  |  TOTAL PROJECTS: ${projects.length}  |  ORGANIZED BY VERSION & SPRINT`,
    15,
    currentY
  );

  currentY += 4;
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.5);
  doc.line(15, currentY, pageWidth - 15, currentY);

  currentY += 8;

  // SECTION 1: PROJECTS OVERVIEW TABLE
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text('01. ACTIVE SOFTWARE PROJECT REGISTRY', 15, currentY);

  currentY += 6;

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text('PROJECT NAME', 15, currentY);
  doc.text('BUSINESS VERTICAL', 65, currentY);
  doc.text('START DATE', 115, currentY);
  doc.text('VERSION', 145, currentY);
  doc.text('USERS', 170, currentY);

  currentY += 2;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(15, currentY, pageWidth - 15, currentY);

  currentY += 5;

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);

  projects.forEach((proj) => {
    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('courier', 'bold');
    doc.text(proj.name.substring(0, 26), 15, currentY);

    doc.setFont('courier', 'normal');
    doc.text(proj.businessType.substring(0, 28), 65, currentY);
    doc.text(proj.startDate, 115, currentY);
    doc.text(proj.version, 145, currentY);
    doc.text(proj.activeUsers.toLocaleString(), 170, currentY);

    currentY += 3;
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Live: ${proj.details.liveSite}  |  Host: ${proj.details.hostedCompany}`,
      15,
      currentY
    );
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);

    currentY += 5;
  });

  currentY += 6;
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.5);
  doc.line(15, currentY, pageWidth - 15, currentY);

  currentY += 8;

  // SECTION 2: LOGS ORGANIZED BY VERSION -> SPRINT -> DELIVERABLES
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text('02. LOGS BY VERSION, SPRINT & ASSOCIATED DELIVERABLES', 15, currentY);

  currentY += 6;

  const versionGroups = buildVersionSprintLogHierarchy(projects, logs, tasks);

  versionGroups.forEach((vGroup) => {
    if (currentY > 255) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(
      `VERSION ${vGroup.version}  //  ${vGroup.projectName.toUpperCase()} (${vGroup.isCurrentVersion ? 'ACTIVE RELEASE' : 'ARCHIVED RELEASE'})`,
      15,
      currentY
    );

    currentY += 4.5;

    vGroup.sprints.forEach((sGroup) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      const doneCount = sGroup.deliverables.filter((d) => d.status === 'done').length;
      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text(
        `  SPRINT: ${sGroup.sprintName}  [${doneCount}/${sGroup.deliverables.length} DELIVERABLES DONE]`,
        15,
        currentY
      );
      currentY += 3.5;

      if (sGroup.sprintGoal) {
        doc.setFont('courier', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(`  OBJECTIVE: ${sGroup.sprintGoal.substring(0, 95)}`, 15, currentY);
        currentY += 4;
      }

      sGroup.deliverables.forEach((deliv, idx) => {
        if (currentY > 272) {
          doc.addPage();
          currentY = 20;
        }
        doc.setFont('courier', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 30, 30);
        const statusTag = deliv.status.toUpperCase().padEnd(11, ' ');
        const num = String(idx + 1).padStart(2, '0');
        const lineText = `    ${num}. [${statusTag}] ${deliv.title}`;
        const splitLines = doc.splitTextToSize(lineText, pageWidth - 30);
        doc.text(splitLines, 15, currentY);
        currentY += splitLines.length * 3.5 + 1;
      });

      currentY += 3;
    });

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.2);
    doc.line(15, currentY, pageWidth - 15, currentY);
    currentY += 5;
  });

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text(`ZOO STUDIO — PAGE ${i} OF ${pageCount}`, 15, 290);
    doc.text(`VERSION & SPRINT DELIVERABLES LOG`, pageWidth - 65, 290);
  }

  const filename = `zoo_version_sprint_logs_${new Date().toISOString().substring(0, 10)}.pdf`;
  doc.save(filename);
};

