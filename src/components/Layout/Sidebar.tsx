import React, { useState, useRef } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  BarChart3, 
  PlusCircle, 
  Download, 
  Upload, 
  Menu, 
  X, 
  Building2,
  TrendingUp,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  onOpenAddModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAddModal }) => {
  const { 
    dashboardStats,
    activeView, 
    setActiveView,
    setDashboardFilter,
    exportData, 
    importData,
    theme,
    toggleTheme
  } = useCRM();
  
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLeadsCount = dashboardStats.activeLeadsCount;

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        const success = importData(result);
        if (success) {
          alert('CRM database imported successfully!');
        } else {
          alert('Failed to import database. Please verify the JSON structure.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Lead Pipeline Board', icon: KanbanSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ] as const;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-crm-card border border-crm-border text-slate-100 hover:bg-crm-cardHover shadow-premium"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 lg:static lg:flex lg:flex-col
        glass-panel bg-crm-sidebar border-r border-crm-border/60 flex flex-col h-full transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand / Logo */}
        <div className="p-6 border-b border-crm-border/60 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-glow-primary text-white">
            <Building2 size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              Lead
            </h1>
            <p className="text-xs text-crm-textMuted tracking-wider font-semibold">CRM PIPELINE</p>
          </div>
        </div>

        {/* Live dashboard stats */}
        <div className="mx-4 my-6 p-4 rounded-xl bg-crm-bg/60 border border-crm-border/30 flex flex-col gap-3 shadow-inner">
          <div className="flex items-center justify-between text-xs text-crm-textMuted font-semibold">
            <span>Live Overview</span>
            <span className="flex items-center text-emerald-400 gap-1 font-bold">
              <TrendingUp size={12} /> Live
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-crm-card/40 border border-crm-border/30">
              <span className="text-[9px] text-crm-textMuted font-bold uppercase block">Total</span>
              <span className="text-sm font-extrabold text-slate-100 font-mono">{dashboardStats.totalLeads}</span>
            </div>
            <div className="p-2 rounded-lg bg-crm-card/40 border border-crm-border/30">
              <span className="text-[9px] text-crm-textMuted font-bold uppercase block">Converted</span>
              <span className="text-sm font-extrabold text-emerald-300 font-mono">{dashboardStats.convertedLeads}</span>
            </div>
            <div className="p-2 rounded-lg bg-crm-card/40 border border-crm-border/30">
              <span className="text-[9px] text-crm-textMuted font-bold uppercase block">Follow-ups</span>
              <span className="text-sm font-extrabold text-amber-300 font-mono">{dashboardStats.pendingFollowUps}</span>
            </div>
            <div className="p-2 rounded-lg bg-crm-card/40 border border-crm-border/30">
              <span className="text-[9px] text-crm-textMuted font-bold uppercase block">High Pri.</span>
              <span className="text-sm font-extrabold text-rose-300 font-mono">{dashboardStats.highPriorityLeads}</span>
            </div>
          </div>
          <span className="text-[10px] text-crm-textMuted">
            {activeLeadsCount} active deals in pipeline
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  if (item.id === 'dashboard') {
                    setDashboardFilter('all');
                  }
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-glow-primary font-bold' 
                    : 'text-crm-textMuted hover:text-slate-200 hover:bg-crm-card/50 border border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    size={18} 
                    className={`transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-crm-textMuted group-hover:text-slate-300'}`} 
                  />
                  <span>{item.label}</span>
                </div>
                {item.id === 'pipeline' && activeLeadsCount > 0 && (
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full font-bold transition-all duration-200
                    ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-crm-border/50 text-crm-textMuted'}
                  `}>
                    {activeLeadsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions & Backup Section */}
        <div className="p-4 border-t border-crm-border/60 space-y-2">
          {/* Quick Create Button */}
          <button
            onClick={() => {
              onOpenAddModal();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-sm shadow-premium hover:shadow-glow-primary active:scale-[0.98] transition-all duration-150"
          >
            <PlusCircle size={16} />
            <span>New Tech Lead</span>
          </button>

          {/* Backup Database */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-2">
            <button
              onClick={exportData}
              title="Export CRM Backup File"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border border-crm-border/80 text-crm-textMuted hover:text-slate-100 hover:bg-crm-card/40 transition-colors"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
            <button
              onClick={handleImportClick}
              title="Import CRM Backup File"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border border-crm-border/80 text-crm-textMuted hover:text-slate-100 hover:bg-crm-card/40 transition-colors"
            >
              <Upload size={14} />
              <span>Import</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json"
              className="hidden" 
            />
          </div>
          {/* Theme Toggler */}
          <div className="flex items-center justify-between border-t border-crm-border/40 pt-3 mt-3">
            <span className="text-[10px] font-bold text-crm-textMuted uppercase tracking-wider">Appearance</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-crm-border/60 bg-crm-card hover:bg-crm-cardHover text-crm-textMuted hover:text-slate-100 transition-all cursor-pointer shadow-sm active:scale-95"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={12} className="text-amber-400 animate-spin" style={{ animationDuration: '60s' }} />
                  <span className="text-[10px] font-bold">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={12} className="text-indigo-400" />
                  <span className="text-[10px] font-bold">Dark Mode</span>
                </>
              )}
            </button>
          </div>
          <div className="text-[10px] text-center text-crm-textMuted/60 pt-2 font-mono">
            Lead CRM v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};
