import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useAuthVerification } from '@/hooks/useAuthVerification';
import { Layout } from '@/components/layout/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { ProjectTasksPage } from '@/pages/ProjectTasksPage';
import { ProjectLinksPage } from '@/pages/ProjectLinksPage';
import { ProjectSettingsPage } from '@/pages/ProjectSettingsPage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { TasksPage } from '@/pages/TasksPage';
import { ArchivedTasksPage } from '@/pages/ArchivedTasksPage';
import { ArchivedProjectsPage } from '@/pages/ArchivedProjectsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AgentsPage } from '@/pages/AgentsPage';
import { BusinessesPage } from '@/pages/BusinessesPage';
import { InfrastructurePage } from '@/pages/InfrastructurePage';
import { DesignHubPage } from '@/pages/DesignHubPage';
import { MemoriesPage } from '@/pages/MemoriesPage';

function LoadingScreen() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Verificando sesion...</p>
            </div>
        </div>
    );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, _hasHydrated } = useAuthStore();

    // Wait for Zustand to hydrate from localStorage before checking auth
    if (!_hasHydrated) {
        return <LoadingScreen />;
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
    const { isChecking } = useAuthVerification();

    if (isChecking) {
        return <LoadingScreen />;
    }

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/archived" element={<ArchivedProjectsPage />} />
                <Route path="projects/:id" element={<ProjectDetailPage />} />
                <Route path="projects/:id/tasks" element={<ProjectTasksPage />} />
                <Route path="projects/:id/links" element={<ProjectLinksPage />} />
                <Route path="projects/:id/settings" element={<ProjectSettingsPage />} />
                <Route path="projects/:id/roadmap" element={<RoadmapPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="tasks/archived" element={<ArchivedTasksPage />} />
                <Route path="agents" element={<AgentsPage />} />
                <Route path="businesses" element={<BusinessesPage />} />
                <Route path="businesses/:businessId" element={<BusinessesPage />} />
                <Route path="infrastructure" element={<InfrastructurePage />} />
                <Route path="design-hub" element={<DesignHubPage />} />
                <Route path="memories" element={<MemoriesPage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>
        </Routes>
    );
}

export default App;
