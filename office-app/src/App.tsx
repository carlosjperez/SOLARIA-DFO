import { Routes, Route, Navigate } from 'react-router-dom';
import { OfficeLayout } from '@components/layout/OfficeLayout';
import { OfficeDashboardPage } from '@pages/OfficeDashboardPage';
import { OfficeProjectsPage } from '@pages/OfficeProjectsPage';
import { OfficeClientsPage } from '@pages/OfficeClientsPage';
import { OfficeAgentsPage } from '@pages/OfficeAgentsPage';
import { DesignHubPage } from '@pages/DesignHubPage';
import { ClientDetailPage } from '@pages/ClientDetailPage';
import { ProjectDetailPage } from '@pages/ProjectDetailPage';
import { AgentDetailPage } from '@pages/AgentDetailPage';
import { SettingsPage } from '@pages/SettingsPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<OfficeLayout />}>
                <Route index element={<OfficeDashboardPage />} />

                {/* Projects */}
                <Route path="projects" element={<OfficeProjectsPage />} />
                <Route path="projects/:id" element={<ProjectDetailPage />} />

                {/* Clients */}
                <Route path="clients" element={<OfficeClientsPage />} />
                <Route path="clients/:id" element={<ClientDetailPage />} />

                {/* Agents / Team */}
                <Route path="agents" element={<OfficeAgentsPage />} />
                <Route path="agents/:id" element={<AgentDetailPage />} />

                {/* Settings & Admin */}
                <Route path="settings" element={<SettingsPage />} />

                {/* Design Hub */}
                <Route path="design-hub" element={<DesignHubPage />} />

                {/* Future routes */}
                {/* <Route path="analytics" element={<OfficeAnalyticsPage />} /> */}
                {/* <Route path="reports" element={<OfficeReportsPage />} /> */}

                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

export default App;
