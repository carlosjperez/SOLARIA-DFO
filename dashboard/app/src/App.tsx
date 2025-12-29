import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useAuthVerification } from '@/hooks/useAuthVerification';
import { Layout } from '@/components/layout/Layout';
import { LoginPage } from '@/pages/LoginPage';

// Lazy load all pages except Login (critical for UX)
// Note: Using named exports, so we need to destructure in the import
const DashboardPage = lazy(() =>
    import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage }))
);
const ProjectsPage = lazy(() =>
    import('@/pages/ProjectsPage').then((module) => ({ default: module.ProjectsPage }))
);
const ProjectDetailPage = lazy(() =>
    import('@/pages/ProjectDetailPage').then((module) => ({
        default: module.ProjectDetailPage,
    }))
);
const ProjectTasksPage = lazy(() =>
    import('@/pages/ProjectTasksPage').then((module) => ({ default: module.ProjectTasksPage }))
);
const ProjectLinksPage = lazy(() =>
    import('@/pages/ProjectLinksPage').then((module) => ({ default: module.ProjectLinksPage }))
);
const ProjectSettingsPage = lazy(() =>
    import('@/pages/ProjectSettingsPage').then((module) => ({
        default: module.ProjectSettingsPage,
    }))
);
const RoadmapPage = lazy(() =>
    import('@/pages/RoadmapPage').then((module) => ({ default: module.RoadmapPage }))
);
const TasksPage = lazy(() =>
    import('@/pages/TasksPage').then((module) => ({ default: module.TasksPage }))
);
const ArchivedTasksPage = lazy(() =>
    import('@/pages/ArchivedTasksPage').then((module) => ({ default: module.ArchivedTasksPage }))
);
const ArchivedProjectsPage = lazy(() =>
    import('@/pages/ArchivedProjectsPage').then((module) => ({
        default: module.ArchivedProjectsPage,
    }))
);
const SettingsPage = lazy(() =>
    import('@/pages/SettingsPage').then((module) => ({ default: module.SettingsPage }))
);
const AgentsPage = lazy(() =>
    import('@/pages/AgentsPage').then((module) => ({ default: module.AgentsPage }))
);
const BusinessesPage = lazy(() =>
    import('@/pages/BusinessesPage').then((module) => ({ default: module.BusinessesPage }))
);
const InfrastructurePage = lazy(() =>
    import('@/pages/InfrastructurePage').then((module) => ({
        default: module.InfrastructurePage,
    }))
);
const DesignHubPage = lazy(() =>
    import('@/pages/DesignHubPage').then((module) => ({ default: module.DesignHubPage }))
);
const MemoriesPage = lazy(() =>
    import('@/pages/MemoriesPage').then((module) => ({ default: module.MemoriesPage }))
);
const OfficePage = lazy(() =>
    import('@/pages/OfficePage').then((module) => ({ default: module.OfficePage }))
);

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
                <Route
                    path="dashboard"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <DashboardPage />
                        </Suspense>
                    }
                />
                <Route
                    path="projects"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <ProjectsPage />
                        </Suspense>
                    }
                />
                <Route
                    path="projects/archived"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <ArchivedProjectsPage />
                        </Suspense>
                    }
                />
                <Route
                    path="projects/:id"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <ProjectDetailPage />
                        </Suspense>
                    }
                />
                <Route
                    path="projects/:id/tasks"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <ProjectTasksPage />
                        </Suspense>
                    }
                />
                <Route
                    path="projects/:id/links"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <ProjectLinksPage />
                        </Suspense>
                    }
                />
                <Route
                    path="projects/:id/settings"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <ProjectSettingsPage />
                        </Suspense>
                    }
                />
                <Route
                    path="projects/:id/roadmap"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <RoadmapPage />
                        </Suspense>
                    }
                />
                <Route
                    path="tasks"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <TasksPage />
                        </Suspense>
                    }
                />
                <Route
                    path="tasks/archived"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <ArchivedTasksPage />
                        </Suspense>
                    }
                />
                <Route
                    path="agents"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <AgentsPage />
                        </Suspense>
                    }
                />
                <Route
                    path="businesses"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <BusinessesPage />
                        </Suspense>
                    }
                />
                <Route
                    path="businesses/:businessId"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <BusinessesPage />
                        </Suspense>
                    }
                />
                <Route
                    path="infrastructure"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <InfrastructurePage />
                        </Suspense>
                    }
                />
                <Route
                    path="design-hub"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <DesignHubPage />
                        </Suspense>
                    }
                />
                <Route
                    path="memories"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <MemoriesPage />
                        </Suspense>
                    }
                />
                <Route
                    path="office"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <OfficePage />
                        </Suspense>
                    }
                />
                <Route
                    path="settings"
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <SettingsPage />
                        </Suspense>
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;
