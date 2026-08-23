import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const CopilotContext = createContext(null);

export function CopilotProvider({ children }) {
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('match'); // 'match' | 'explore'

  // UI action dispatcher state — consumed by Home/Projects to trigger actions
  const [pendingAction, setPendingAction] = useState(null);

  // Skill highlight state
  const [highlightedSkills, setHighlightedSkills] = useState([]);

  const openCopilot = useCallback((tab = 'match') => {
    setActiveTab(tab);
    setIsOpen(true);
  }, []);

  const closeCopilot = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Allowed UI Action targets to prevent arbitrary execution
  const ALLOWED_SECTIONS = ['about', 'experience', 'projects', 'skills', 'contact'];
  const ALLOWED_PROJECTS = ['backops-wib', 'wibav3', 'click2serve', 'client-project-tracker'];

  /**
   * Execute a UI action dispatched by the AI with strict allowlist validation.
   * Actions: SCROLL_TO, OPEN_PROJECT, HIGHLIGHT_SKILLS, OPEN_RESUME, SWITCH_TAB
   */
  const executeAction = useCallback((action) => {
    if (!action || typeof action !== 'object') return;

    switch (action.type) {
      case 'SCROLL_TO': {
        const target = String(action.target || '').toLowerCase();
        if (!ALLOWED_SECTIONS.includes(target)) return;
        const el = document.getElementById(target);
        if (el) {
          const topOffset = el.getBoundingClientRect().top + window.scrollY - 20;
          window.scrollTo({ top: topOffset, behavior: 'smooth' });
        }
        break;
      }
      case 'OPEN_PROJECT': {
        const target = String(action.target || '').toLowerCase();
        if (!ALLOWED_PROJECTS.includes(target)) return;
        // Set pendingAction so Projects.jsx can listen and open the modal
        setPendingAction({ type: 'OPEN_PROJECT', projectId: target });
        // Also scroll to projects section
        const projectsEl = document.getElementById('projects');
        if (projectsEl) {
          const topOffset = projectsEl.getBoundingClientRect().top + window.scrollY - 20;
          window.scrollTo({ top: topOffset, behavior: 'smooth' });
        }
        break;
      }
      case 'HIGHLIGHT_SKILLS': {
        if (Array.isArray(action.highlightTags) && action.highlightTags.length > 0) {
          const sanitizedTags = action.highlightTags.map((t) => String(t).slice(0, 40));
          setHighlightedSkills(sanitizedTags);
          // Auto-clear highlights after 6 seconds
          setTimeout(() => setHighlightedSkills([]), 6000);
        }
        // Scroll to skills section
        const skillsEl = document.getElementById('skills');
        if (skillsEl) {
          const topOffset = skillsEl.getBoundingClientRect().top + window.scrollY - 20;
          window.scrollTo({ top: topOffset, behavior: 'smooth' });
        }
        break;
      }
      case 'OPEN_RESUME': {
        setPendingAction({ type: 'OPEN_RESUME' });
        break;
      }
      case 'SWITCH_TAB': {
        if (action.target === 'match' || action.target === 'explore') {
          setActiveTab(action.target);
        }
        break;
      }
      default:
        break;
    }
  }, []);

  const consumePendingAction = useCallback(() => {
    const action = pendingAction;
    setPendingAction(null);
    return action;
  }, [pendingAction]);

  const value = useMemo(() => ({
    isOpen,
    activeTab,
    highlightedSkills,
    pendingAction,
    openCopilot,
    closeCopilot,
    setActiveTab,
    executeAction,
    consumePendingAction,
  }), [isOpen, activeTab, highlightedSkills, pendingAction, openCopilot, closeCopilot, executeAction, consumePendingAction]);

  return (
    <CopilotContext.Provider value={value}>
      {children}
    </CopilotContext.Provider>
  );
}

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error('useCopilot must be used within CopilotProvider');
  return ctx;
}
