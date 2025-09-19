import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@lib/contexts/AuthContext';
import { useEffect, useState } from 'react';
import Header from '@lib/components/header/header';
import Sidebar from '@lib/components/sidebar/sidebar';
import Footer from '@lib/components/footer/footer';
import '@lib/styles/_authenticated/_authenticated.css';

function RouteComponent() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: '/login', replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="authenticated-layout">
      <Header />
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <div className={`authenticated-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <main className="authenticated-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
});