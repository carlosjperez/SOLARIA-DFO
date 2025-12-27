import { Routes, Route, Navigate } from 'react-router-dom';
import { OfficeLayout } from '@components/layout/OfficeLayout';
import { OfficeDashboardPage } from '@pages/OfficeDashboardPage';
import { OfficeProjectsPage } from '@pages/OfficeProjectsPage';
import { OfficeClientsPage } from '@pages/OfficeClientsPage';
import { OfficeAgentsPage } from '@pages/OfficeAgentsPage';
import { DesignHubPage } from '@pages/DesignHubPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<OfficeLayout />}>
                <Route index element={<OfficeDashboardPage />} />
                <Route path="projects" element={<OfficeProjectsPage />} />
                <Route path="clients" element={<OfficeClientsPage />} />
                <Route path="agents" element={<OfficeAgentsPage />} />
                <Route path="design-hub" element={<DesignHubPage />} />
                {/* Future routes */}
                {/* <Route path="projects/:id" element={<OfficeProjectDetailPage />} /> */}
                {/* <Route path="analytics" element={<OfficeAnalyticsPage />} /> */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

export default App;
