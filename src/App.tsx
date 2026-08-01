import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { UploadPage } from '@/pages/UploadPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { CopilotPage } from '@/pages/CopilotPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { SettingsPage } from '@/pages/SettingsPage';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/copilot" element={<CopilotPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AnimatedRoutes />
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
