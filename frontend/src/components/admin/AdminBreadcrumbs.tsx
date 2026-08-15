import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';

interface AdminBreadcrumbsProps {
  activeTab?: string;
}

export const AdminBreadcrumbs: React.FC<AdminBreadcrumbsProps> = ({ activeTab = 'Overview' }) => {
  const { navigateTo } = useNavigation();

  return (
    <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 py-1 select-none">
      <button
        type="button"
        onClick={() => navigateTo('/')}
        className="flex items-center gap-1.5 hover:text-cyan-600 dark:hover:text-cyan-400 transition cursor-pointer"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Main Site</span>
      </button>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />

      <button
        type="button"
        onClick={() => navigateTo('/admin/dashboard')}
        className="hover:text-cyan-600 dark:hover:text-cyan-400 transition cursor-pointer"
      >
        Admin Portal
      </button>

      {activeTab && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <span className="text-slate-900 dark:text-white font-extrabold capitalize">
            {activeTab}
          </span>
        </>
      )}
    </nav>
  );
};
