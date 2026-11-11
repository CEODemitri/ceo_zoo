import React, { useState } from 'react';
import { Project } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: Project) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject,
}) => {
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [version, setVersion] = useState('v1.0.0');
  const [activeUsers, setActiveUsers] = useState<number>(100);
  const [sprintName, setSprintName] = useState('Sprint 01 // Initial Architecture');
  const [sprintGoal, setSprintGoal] = useState('Bootstrap repository foundation and CI pipeline.');

  // Details
  const [liveSite, setLiveSite] = useState('');
  const [hostedCompany, setHostedCompany] = useState('');
  const [adminName, setAdminName] = useState('sysadmin');
  const [adminPassword, setAdminPassword] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      businessType: businessType.trim() || 'Software / Web Application',
      startDate: startDate || new Date().toISOString().substring(0, 10),
      version: version.trim() || 'v1.0.0',
      activeUsers: Number(activeUsers) || 0,
      lastTouched: new Date().toISOString(),
      currentSprintName: sprintName.trim() || 'Sprint 01 // Inception',
      sprintGoal: sprintGoal.trim() || 'Core module engineering.',
      details: {
        liveSite: liveSite.trim() || 'https://staging.internal.net',
        hostedCompany: hostedCompany.trim() || 'AWS / Cloudflare',
        adminName: adminName.trim() || 'admin',
        adminPassword: adminPassword.trim() || undefined,
        notes: notes.trim() || undefined,
      },
    };

    onAddProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-[#EFECE6] dark:bg-[#141417] text-[#181715] dark:text-[#F3F1EC] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 bg-[#E5E0D6]/70 dark:bg-[#1E1E24]/70">
          <div>
            <h2 className="font-serif text-base sm:text-lg font-semibold tracking-tight text-[#181715] dark:text-[#F3F1EC]">
              Register New Software Project
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8C867E] dark:text-[#6E6A63]">
              INITIALIZE REPOSITORY TELEMETRY AND SPRINT TRACKING
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-sm px-2 py-1 text-[#5C5852] dark:text-[#A6A29A] hover:text-[#181715] dark:hover:text-[#F3F1EC]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nexus Query Engine"
                className="w-full px-3 py-2 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-1">
                Business Type / Industry
              </label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g. Fintech B2B, DevTools"
                className="w-full px-3 py-2 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-1">
                Initial Version (SemVer)
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0.0"
                className="w-full px-3 py-2 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-1">
                Active Users / Installs
              </label>
              <input
                type="number"
                min="0"
                value={activeUsers}
                onChange={(e) => setActiveUsers(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36] tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-1">
                Sprint Title
              </label>
              <input
                type="text"
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                placeholder="Sprint 01 · Foundation"
                className="w-full px-3 py-2 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#181715]/[0.07] dark:border-white/[0.06]">
            <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-[#8C867E] dark:text-[#6E6A63] mb-2">
              HOSTING & CREDENTIAL SPECIFICATIONS
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-1">Live Site URL</label>
                <input
                  type="text"
                  value={liveSite}
                  onChange={(e) => setLiveSite(e.target.value)}
                  placeholder="https://app.example.com"
                  className="w-full px-3 py-2 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-1">Hosted Platform</label>
                <input
                  type="text"
                  value={hostedCompany}
                  onChange={(e) => setHostedCompany(e.target.value)}
                  placeholder="e.g. AWS, Vercel, Supabase"
                  className="w-full px-3 py-2 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-1">Admin Username</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3 py-2 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-1">Admin Password</label>
                <input
                  type="text"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Secret access key"
                  className="w-full px-3 py-2 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[#8C867E] dark:text-[#6E6A63] mb-1">Notes / Objectives</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Infrastructure notes, deployment instructions, architecture specs..."
              className="w-full px-3 py-2 bg-[#E5E0D6] dark:bg-[#1E1E24] text-[#181715] dark:text-[#F3F1EC] focus:outline-none focus:ring-1 focus:ring-[#D94E28] dark:focus:ring-[#E85D36]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#181715]/[0.07] dark:border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#E5E0D6] hover:bg-[#DBD5C9] dark:bg-[#1E1E24] dark:hover:bg-[#282830] text-[#5C5852] dark:text-[#A6A29A] uppercase transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#D94E28] hover:bg-[#C2411E] dark:bg-[#E85D36] dark:hover:bg-[#D94E28] text-white font-semibold uppercase transition-colors"
            >
              Register Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
