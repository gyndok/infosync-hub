import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Full width main content without sidebar */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};