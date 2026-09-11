import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Client,
  Project,
  ConsultationLog,
  Quote,
  ProjectFile,
  Task,
  TimelineItem,
  AfterServiceRecord,
  ProjectStatus,
  ProjectFinalSummary,
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_CONSULTATIONS,
  INITIAL_QUOTES,
  INITIAL_FILES,
  INITIAL_TASKS,
  INITIAL_TIMELINE,
  INITIAL_AFTER_SERVICE,
} from '../data/mockData';

interface AppContextType {
  clients: Client[];
  projects: Project[];
  consultations: ConsultationLog[];
  quotes: Quote[];
  files: ProjectFile[];
  tasks: Task[];
  timeline: TimelineItem[];
  afterServices: AfterServiceRecord[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  currentView: 'dashboard' | 'projects' | 'clients' | 'project-detail';
  setCurrentView: (view: 'dashboard' | 'projects' | 'clients' | 'project-detail') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;

  // Actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  createProjectWithMinimalInput: (data: {
    clientName: string;
    projectName: string;
    siteName?: string;
    siteAddress?: string;
    budget?: string;
    tags?: string[];
  }) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  changeProjectStatus: (id: string, newStatus: ProjectStatus) => void;
  addConsultation: (
    data: Omit<ConsultationLog, 'id' | 'createdAt'>,
    applyUpdatesToProject?: boolean
  ) => ConsultationLog;
  addQuote: (
    data: Omit<Quote, 'id'>,
    updateProjectQuoteAmount?: boolean
  ) => Quote;
  addFile: (data: Omit<ProjectFile, 'id' | 'uploadDate'>) => ProjectFile;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  toggleTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addAfterService: (data: Omit<AfterServiceRecord, 'id'>) => AfterServiceRecord;
  setProjectFinalSummary: (projectId: string, summary: ProjectFinalSummary) => void;
  resetToSampleData: () => void;
}

const STORAGE_KEY = 'b2b_furniture_pm_storage_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [consultations, setConsultations] = useState<ConsultationLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_consultations');
    return saved ? JSON.parse(saved) : INITIAL_CONSULTATIONS;
  });

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_quotes');
    return saved ? JSON.parse(saved) : INITIAL_QUOTES;
  });

  const [files, setFiles] = useState<ProjectFile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_files');
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [timeline, setTimeline] = useState<TimelineItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_timeline');
    return saved ? JSON.parse(saved) : INITIAL_TIMELINE;
  });

  const [afterServices, setAfterServices] = useState<AfterServiceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_after_services');
    return saved ? JSON.parse(saved) : INITIAL_AFTER_SERVICE;
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>('proj-1');
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'clients' | 'project-detail'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_consultations', JSON.stringify(consultations));
  }, [consultations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_quotes', JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_timeline', JSON.stringify(timeline));
  }, [timeline]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_after_services', JSON.stringify(afterServices));
  }, [afterServices]);

  const addClient = (data: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...data,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const createProjectWithMinimalInput = (data: {
    clientName: string;
    projectName: string;
    siteName?: string;
    siteAddress?: string;
    budget?: string;
    tags?: string[];
  }): Project => {
    // Check if client already exists, or create a stub client
    let client = clients.find((c) => c.companyName.trim() === data.clientName.trim());
    if (!client) {
      client = {
        id: `client-${Date.now()}`,
        companyName: data.clientName.trim(),
        contacts: [
          {
            id: `contact-${Date.now()}`,
            name: '미지정',
            title: '담당자',
            department: '미지정',
            phone: '',
            email: '',
            isPrimary: true,
          },
        ],
        createdAt: new Date().toISOString().split('T')[0],
      };
      setClients((prev) => [client!, ...prev]);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      clientId: client.id,
      clientName: client.companyName,
      name: data.projectName.trim(),
      siteName: data.siteName?.trim() || `${data.projectName} 현장`,
      siteAddress: data.siteAddress?.trim() || '미정 (상담 시 확인 예정)',
      status: '상담',
      deliveryDate: '미정',
      targetProducts: '상담 후 협의',
      quantity: 0,
      budget: data.budget?.trim() || '협의 예정',
      latestQuoteAmount: 0,
      tags: data.tags && data.tags.length > 0 ? data.tags : ['신규상담'],
      specialNotes: '최소 정보로 신규 생성됨. 향후 상담 및 자료 입력을 통해 AI가 자동 구조화 예정.',
      createdAt: todayStr,
      updatedAt: todayStr,
    };

    setProjects((prev) => [newProject, ...prev]);

    // Add creation timeline entry
    const newTl: TimelineItem = {
      id: `tl-${Date.now()}`,
      projectId: newProject.id,
      date: todayStr,
      title: '신규 프로젝트 생성',
      type: 'consultation',
      description: `[${client.companyName}] 신규 프로젝트가 생성되었습니다. 첫 상담 녹음 또는 자료를 입력해주세요.`,
      badge: '프로젝트 생성',
    };
    setTimeline((prev) => [newTl, ...prev]);

    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: todayStr } : p))
    );
  };

  const changeProjectStatus = (id: string, newStatus: ProjectStatus) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;

    updateProject(id, { status: newStatus });

    // Timeline event
    const newTl: TimelineItem = {
      id: `tl-${Date.now()}`,
      projectId: id,
      date: todayStr,
      title: `프로젝트 상태 변경: ${newStatus}`,
      type: newStatus === '발주 확정' ? 'order' : newStatus === '완료' ? 'delivery' : 'change',
      description: `프로젝트 상태가 [${proj.status}]에서 [${newStatus}](으)로 변경되었습니다.`,
      badge: newStatus,
    };
    setTimeline((prev) => [newTl, ...prev]);
  };

  const addConsultation = (
    data: Omit<ConsultationLog, 'id' | 'createdAt'>,
    applyUpdatesToProject = true
  ): ConsultationLog => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newId = `consult-${Date.now()}`;

    const newLog: ConsultationLog = {
      ...data,
      id: newId,
      createdAt: todayStr,
    };

    setConsultations((prev) => [newLog, ...prev]);

    // Create Tasks from follow-up tasks
    if (data.followUpTasks && data.followUpTasks.length > 0) {
      const proj = projects.find((p) => p.id === data.projectId);
      const generatedTasks: Task[] = data.followUpTasks.map((t, idx) => ({
        id: `task-${Date.now()}-${idx}`,
        projectId: data.projectId,
        projectName: proj?.name || data.projectName,
        clientName: proj?.clientName || data.clientName,
        consultationId: newId,
        title: t.task,
        dueDate: t.dueDate || todayStr,
        status: t.status || '예정',
        completed: false,
        priority: t.priority || 'normal',
        createdAt: todayStr,
      }));
      setTasks((prev) => [...generatedTasks, ...prev]);
    }

    // Timeline log
    const newTl: TimelineItem = {
      id: `tl-${Date.now()}`,
      projectId: data.projectId,
      date: data.date.split(' ')[0] || todayStr,
      title: `${data.method} (${data.summary.slice(0, 30)}...)`,
      type: 'consultation',
      description: data.summary,
      badge: data.method,
      refId: newId,
      refType: 'consultation',
    };
    setTimeline((prev) => [newTl, ...prev]);

    // If changes were detected, add a change timeline item
    if (data.changes && data.changes.length > 0) {
      const changeDesc = data.changes.map((c) => `${c.item}: ${c.before} → ${c.after}`).join(' / ');
      const changeTl: TimelineItem = {
        id: `tl-${Date.now() + 1}`,
        projectId: data.projectId,
        date: data.date.split(' ')[0] || todayStr,
        title: `상담 협의 변경사항 (${data.changes.length}건)`,
        type: 'change',
        description: changeDesc,
        badge: '변경사항',
        refId: newId,
        refType: 'consultation',
      };
      setTimeline((prev) => [changeTl, ...prev]);
    }

    // Apply proposed updates to project if confirmed
    if (applyUpdatesToProject && data.suggestedProjectUpdates) {
      const updates: Partial<Project> = {};
      if (data.suggestedProjectUpdates.deliveryDate) updates.deliveryDate = data.suggestedProjectUpdates.deliveryDate;
      if (data.suggestedProjectUpdates.quantity) updates.quantity = data.suggestedProjectUpdates.quantity;
      if (data.suggestedProjectUpdates.targetProducts) updates.targetProducts = data.suggestedProjectUpdates.targetProducts;
      if (data.suggestedProjectUpdates.budget) updates.budget = data.suggestedProjectUpdates.budget;
      if (data.suggestedProjectUpdates.siteName) updates.siteName = data.suggestedProjectUpdates.siteName;
      if (data.suggestedProjectUpdates.siteAddress) updates.siteAddress = data.suggestedProjectUpdates.siteAddress;

      if (data.suggestedStatusChange) {
        updates.status = data.suggestedStatusChange;
      }

      updateProject(data.projectId, updates);
    } else {
      updateProject(data.projectId, {}); // updates updatedAt
    }

    return newLog;
  };

  const addQuote = (
    data: Omit<Quote, 'id'>,
    updateProjectQuoteAmount = true
  ): Quote => {
    const newQuote: Quote = {
      ...data,
      id: `quote-${Date.now()}`,
    };
    setQuotes((prev) => [newQuote, ...prev]);

    // Timeline event
    const newTl: TimelineItem = {
      id: `tl-${Date.now()}`,
      projectId: data.projectId,
      date: data.createdAt,
      title: `${data.version} 등록`,
      type: 'quote',
      description: `총 견적금액: ${Number(data.totalAmount).toLocaleString()}원 (${data.changeNotes || '신규 견적'})`,
      badge: `${Number(data.totalAmount).toLocaleString()}원`,
      refId: newQuote.id,
      refType: 'quote',
    };
    setTimeline((prev) => [newTl, ...prev]);

    if (updateProjectQuoteAmount) {
      updateProject(data.projectId, { latestQuoteAmount: data.totalAmount });
    }

    return newQuote;
  };

  const addFile = (data: Omit<ProjectFile, 'id' | 'uploadDate'>): ProjectFile => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newFile: ProjectFile = {
      ...data,
      id: `file-${Date.now()}`,
      uploadDate: todayStr,
    };
    setFiles((prev) => [newFile, ...prev]);

    const newTl: TimelineItem = {
      id: `tl-${Date.now()}`,
      projectId: data.projectId,
      date: todayStr,
      title: `파일 등록: ${data.name}`,
      type: 'file',
      description: `[${data.type}] ${data.notes || '프로젝트 파일 첨부'} (${data.fileSize})`,
      badge: data.type,
      refId: newFile.id,
      refType: 'file',
    };
    setTimeline((prev) => [newTl, ...prev]);

    return newFile;
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: todayStr,
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const toggleTask = (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            // Timeline event
            const newTl: TimelineItem = {
              id: `tl-${Date.now()}`,
              projectId: t.projectId,
              date: todayStr,
              title: `업무 완료: ${t.title}`,
              type: 'task',
              description: `후속 업무 [${t.title}]가 완료 처리되었습니다.`,
              badge: '업무 완료',
              refId: t.id,
              refType: 'task',
            };
            setTimeline((tl) => [newTl, ...tl]);
          }
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? '완료' : '진행 중',
          };
        }
        return t;
      })
    );
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addAfterService = (data: Omit<AfterServiceRecord, 'id'>): AfterServiceRecord => {
    const newRecord: AfterServiceRecord = {
      ...data,
      id: `as-${Date.now()}`,
    };
    setAfterServices((prev) => [newRecord, ...prev]);

    const newTl: TimelineItem = {
      id: `tl-${Date.now()}`,
      projectId: data.projectId,
      date: data.date,
      title: `A/S 기록: ${data.title}`,
      type: 'as',
      description: `${data.issue} → 조치: ${data.action} (${data.status})`,
      badge: 'A/S',
    };
    setTimeline((prev) => [newTl, ...prev]);

    return newRecord;
  };

  const setProjectFinalSummary = (projectId: string, summary: ProjectFinalSummary) => {
    updateProject(projectId, { finalSummary: summary });
  };

  const resetToSampleData = () => {
    setClients(INITIAL_CLIENTS);
    setProjects(INITIAL_PROJECTS);
    setConsultations(INITIAL_CONSULTATIONS);
    setQuotes(INITIAL_QUOTES);
    setFiles(INITIAL_FILES);
    setTasks(INITIAL_TASKS);
    setTimeline(INITIAL_TIMELINE);
    setAfterServices(INITIAL_AFTER_SERVICE);
    setActiveProjectId('proj-1');
  };

  return (
    <AppContext.Provider
      value={{
        clients,
        projects,
        consultations,
        quotes,
        files,
        tasks,
        timeline,
        afterServices,
        activeProjectId,
        setActiveProjectId,
        currentView,
        setCurrentView,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        addClient,
        createProjectWithMinimalInput,
        updateProject,
        changeProjectStatus,
        addConsultation,
        addQuote,
        addFile,
        addTask,
        toggleTask,
        updateTask,
        deleteTask,
        addAfterService,
        setProjectFinalSummary,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
