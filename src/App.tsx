import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layouts/MainLayout';
import PracticalSessionListPage from './features/practical/pages/PracticalSessionListPage';
import PracticalSessionFormPage from './features/practical/pages/PracticalSessionFormPage';
import PracticalSessionDetailPage from './features/practical/pages/PracticalSessionDetailPage';
import SessionReportPage from './features/practical/pages/SessionReportPage';
import MediaInventoryPage from './features/media/pages/MediaInventoryPage';
import EquipmentReturnsPage from './features/media/pages/EquipmentReturnsPage';
import WasteLogsPage from './features/waste/pages/WasteLogsPage';
import WasteHistoryPage from './features/waste/pages/WasteHistoryPage';

function App() {
  return (
    <MainLayout>
      <Routes>
        {/* Redirect root to practical sessions for now as it's the primary feature */}
        <Route path="/" element={<Navigate to="/practical-sessions" replace />} />

        {/* Practical Session Routes */}
        <Route path="/practical-sessions" element={<PracticalSessionListPage />} />
        <Route path="/practical-sessions/create" element={<PracticalSessionFormPage />} />
        <Route path="/practical-sessions/:id/edit" element={<PracticalSessionFormPage />} />
        <Route path="/practical-sessions/:id" element={<PracticalSessionDetailPage />} />
        <Route path="/practical-sessions/:id/report" element={<SessionReportPage />} />

        {/* Media Inventory & Returns Routes */}
        <Route path="/media-inventory" element={<MediaInventoryPage />} />
        <Route path="/equipment-returns" element={<EquipmentReturnsPage />} />

        {/* Waste Management Routes */}
        <Route path="/waste" element={<WasteHistoryPage />} />
        <Route path="/waste-logs" element={<WasteHistoryPage />} />
        <Route path="/waste/create" element={<WasteHistoryPage />} />

        
        {/* Placeholder Routes for Sidebar */}
        <Route path="/dashboard" element={<div className="p-8"><h1>Dashboard Placeholder</h1></div>} />
        <Route path="/inventory" element={<div className="p-8"><h1>Inventory Placeholder</h1></div>} />
        <Route path="/buildings" element={<div className="p-8"><h1>Buildings Placeholder</h1></div>} />
        <Route path="/reports" element={<div className="p-8"><h1>Reports Placeholder</h1></div>} />
        <Route path="/settings" element={<div className="p-8"><h1>Settings Placeholder</h1></div>} />
      </Routes>
    </MainLayout>
  );
}

export default App;

