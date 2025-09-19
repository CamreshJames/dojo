// __root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AuthProvider } from '@lib/contexts/AuthContext';
import NotFound from '@lib/components/404/NotFound';

const WrappedNotFound = () => (
  <AuthProvider>
    <NotFound />
  </AuthProvider>
);

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  ),
  errorComponent: WrappedNotFound,
});