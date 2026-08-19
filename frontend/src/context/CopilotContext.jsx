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

  /**
   * Execute a UI action dispatched by the AI.
   * Actions: SCROLL_TO, OPEN_PROJECT, HIGHLIGHT_SKILLS, OPEN_RESUME
   */
  const executeAction = useCallback((action) => {
    if (!action) return;

    switch (action.type) {
      case 'SCROLL_TO': {
        const el = document.getElementById(action.target);
        if (el) {
          const topOffset = el.getBoundingClientRect().top + window.scrollY - 20;
          window.scrollTo({ top: topOffset, behavior: 'smooth' });
        }
        break;
      }
      case 'OPEN_PROJECT': {
        // Set pendingAction so Projects.jsx can listen and open the modal
        setPendingAction({ type: 'OPEN_PROJECT', projectId: action.target });
        // Also scroll to projects section
        const projectsEl = document.getElementById('projects');
        if (projectsEl) {
          const topOffset = projectsEl.getBoundingClientRect().top + window.scrollY - 20;
          window.scrollTo({ top: topOffset, behavior: 'smooth' });
        }
        break;
      }
      case 'HIGHLIGHT_SKILLS': {
        if (action.highlightTags && action.highlightTags.length > 0) {
          setHighlightedSkills(action.highlightTags);
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
