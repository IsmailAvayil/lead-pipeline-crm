import React from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Sidebar } from './components/Layout/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { BoardView } from './components/Pipeline/BoardView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { LeadManagementModals } from './components/Pipeline/LeadManagementModals';
import { ToastContainer } from './components/Layout/ToastContainer';
import { Loader2 } from 'lucide-react';

const CRMAppContent: React.FC = () => {
  const { activeView, openAddLead, isHydrating } = useCRM();

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'pipeline':
        return <BoardView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-crm-bg text-slate-100 overflow-hidden">
      <Sidebar onOpenAddModal={openAddLead} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen pt-16 lg:pt-0 pb-10">
        {isHydrating ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-crm-textMuted">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
            <p className="text-sm font-semibold">Loading saved leads...</p>
          </div>
        ) : (
          renderView()
        )}
      </main>

      <LeadManagementModals />
      <ToastContainer />
    </div>
  );
};

function App() {
  return (
    <CRMProvider>
      <CRMAppContent />
    </CRMProvider>
  );
}

export default App;
