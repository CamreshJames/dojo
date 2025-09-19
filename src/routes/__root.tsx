import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AuthProvider } from '@lib/contexts/AuthContext';

function Root() {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}

function ErrorComponent({ error }: { error: unknown }) {
    return (
        <div className="error-boundary">
            <h1>Dojo Training Error</h1>
            <p>An error occurred: {String(error)}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
        </div>
    );
}

export const Route: any = createFileRoute('/')({
    component: Root,
    errorComponent: ErrorComponent,
});