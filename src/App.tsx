/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ProjectsList } from './components/ProjectsList';
import { ClientsList } from './components/ClientsList';
import { ProjectDetailView } from './components/ProjectDetail/ProjectDetailView';
import { NewProjectModal } from './components/Modals/NewProjectModal';
import { NewConsultationModal } from './components/Modals/NewConsultationModal';
import { NewQuoteModal } from './components/Modals/NewQuoteModal';
import { NewFileModal } from './components/Modals/NewFileModal';
import { QuoteCompareModal } from './components/Modals/QuoteCompareModal';
import { Quote } from './types';

function MainAppContent() {
  const { currentView, activeProjectId, setActiveProjectId, setCurrentView } = useApp();

  // Modal control states
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [consultationModalProjectId, setConsultationModalProjectId] = useState<string | undefined>();
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [compareQuotes, setCompareQuotes] = useState<{ prev: Quote; next: Quote } | null>(null);

  const handleOpenConsultation = (projectId?: string) => {
    setConsultationModalProjectId(projectId || activeProjectId || undefined);
    setShowConsultationModal(true);
  };

  const handleOpenQuoteCompare = (prev: Quote, next: Quote) => {
    setCompareQuotes({ prev, next });
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Global Navigation Bar */}
      <Navbar onOpenNewProject={() => setShowNewProjectModal(true)} />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'dashboard' && (
          <Dashboard
            onOpenNewProject={() => setShowNewProjectModal(true)}
            onOpenConsultation={handleOpenConsultation}
          />
        )}

        {currentView === 'projects' && (
          <ProjectsList onOpenNewProject={() => setShowNewProjectModal(true)} />
        )}

        {currentView === 'clients' && <ClientsList />}

        {currentView === 'project-detail' && (
          <ProjectDetailView
            onOpenNewConsultation={() => handleOpenConsultation(activeProjectId || undefined)}
            onOpenNewQuote={() => setShowQuoteModal(true)}
            onOpenNewFile={() => setShowFileModal(true)}
            onOpenQuoteCompare={handleOpenQuoteCompare}
          />
        )}
      </main>

      {/* Modals */}
      {showNewProjectModal && (
        <NewProjectModal onClose={() => setShowNewProjectModal(false)} />
      )}

      {showConsultationModal && (
        <NewConsultationModal
          initialProjectId={consultationModalProjectId}
          onClose={() => setShowConsultationModal(false)}
        />
      )}

      {showQuoteModal && (
        <NewQuoteModal
          initialProjectId={activeProjectId || undefined}
          onClose={() => setShowQuoteModal(false)}
        />
      )}

      {showFileModal && (
        <NewFileModal
          initialProjectId={activeProjectId || undefined}
          onClose={() => setShowFileModal(false)}
        />
      )}

      {compareQuotes && (
        <QuoteCompareModal
          prevQuote={compareQuotes.prev}
          nextQuote={compareQuotes.next}
          onClose={() => setCompareQuotes(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
