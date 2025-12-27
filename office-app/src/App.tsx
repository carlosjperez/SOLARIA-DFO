import { Routes, Route, Navigate } from 'react-router-dom';
import { OfficeLayout } from '@components/layout/OfficeLayout';
import { OfficeDashboardPage } from '@pages/OfficeDashboardPage';
import { OfficeProjectsPage } from '@pages/OfficeProjectsPage';
import { OfficeClientsPage } from '@pages/OfficeClientsPage';
import { OfficeAgentsPage } from '@pages/OfficeAgentsPage';
import { DesignHubPage } from '@pages/DesignHubPage';
import { MyDashboardPage } from '@pages/MyDashboardPage';
import { AnalyticsPage } from '@pages/AnalyticsPage';
import { ReportsPage } from '@pages/ReportsPage';
import { SettingsPage } from '@pages/SettingsPage';
import { LoginPage } from '@pages/LoginPage';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';

function App() {
    return (
        <Routes>
            {/* Public route - Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <OfficeLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<OfficeDashboardPage />} />
                <Route path="my-dashboard" element={<MyDashboardPage />} />
                <Route path="projects" element={<OfficeProjectsPage />} />
                <Route path="clients" element={<OfficeClientsPage />} />
                <Route path="agents" element={<OfficeAgentsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="design-hub" element={<DesignHubPage />} />
                <Route path="settings" element={<SettingsPage />} />
                {/* Future routes */}
                {/* <Route path="projects/:id" element={<OfficeProjectDetailPage />} /> */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

export default App;
