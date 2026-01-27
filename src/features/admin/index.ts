// src/features/admin/index.ts
// Barrel export for admin feature

export { AdminDashboard } from './components/AdminDashboard';
export { MetricCard } from './components/MetricCard';
export { useAdminMetrics } from './hooks/useAdminMetrics';
export { adminService } from './services/adminService';
export type { MetricData, RecentSubmission } from './types';
