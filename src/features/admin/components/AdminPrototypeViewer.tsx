// src/features/admin/components/AdminPrototypeViewer.tsx
// Story 5.6 - Task 5: Create AdminPrototypeViewer component

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminPrototype } from '../hooks/useAdminPrototype';
import { 
  ArrowLeftIcon, 
  UserIcon, 
  CalendarIcon,
  ClockIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { PrototypeFrame } from '../../prototypes/components/PrototypeFrame';
import { DeviceSelector, DEVICE_PRESETS, type DevicePreset } from '../../prototypes/components/DeviceSelector';
import { VersionHistoryPanel } from '../../prototypes/components/VersionHistoryPanel';

/**
 * Admin prototype viewer component - view any user's prototype
 * Story 5.6 - Task 5: Create AdminPrototypeViewer component (AC: View any user's prototype)
 * 
 * Subtasks implemented:
 * - 5.1: Create AdminPrototypeViewer.tsx in features/admin/components/
 * - 5.2: Load prototype by prototype_id using adminService
 * - 5.3: Display prototype owner information (user name, email) at top
 * - 5.4: Show prototype generation timestamp and version number
 * - 5.5: Render prototype in iframe with responsive viewport toggles (desktop/tablet/mobile)
 * - 5.6: Display prototype status badge (generating/ready/failed)
 * - 5.7: Add breadcrumb navigation
 * - 5.8: Show refinement history in collapsible section if refinements exist
 * - 5.9: Add "Back to Idea" button to return to IdeaDetailPage
 * - 5.10: Add "View PRD" button to navigate to PRD if exists
 */
export function AdminPrototypeViewer() {
  const { prototypeId } = useParams<{ prototypeId: string }>();
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEVICE_PRESETS[0]);
  const { data: response, isLoading, error } = useAdminPrototype(prototypeId || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !response?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-xl font-semibold text-error">Prototype Not Found</h2>
        <p className="text-base-content/60">
          {response?.error?.message || 'The requested prototype could not be found.'}
        </p>
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn-primary">
          Back to Admin Dashboard
        </button>
      </div>
    );
  }

  const prototype = response.data;
  const ideaId = prototype.idea?.id;
  const prdId = prototype.prd_id;

  // Subtask 5.6: Status checks
  const isGenerating = prototype.status === 'generating';
  const isFailed = prototype.status === 'failed';
  const isReady = prototype.status === 'ready';

  return (
    <div className="min-h-screen bg-base-100">
      {/* Subtask 5.7: Breadcrumb navigation */}
      <div className="bg-base-200 border-b border-base-300">
        <div className="container mx-auto px-4 py-3">
          <div className="breadcrumbs text-sm">
            <ul>
              <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
              <li><Link to="/admin/ideas">Ideas</Link></li>
              {ideaId && <li><Link to={`/ideas/${ideaId}`}>Idea Detail</Link></li>}
              <li>Prototype</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Header with owner info */}
      <div className="bg-white border-b border-base-300 shadow-sm">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col gap-4">
            {/* Subtask 5.9: Back to Idea button */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={() => ideaId ? navigate(`/ideas/${ideaId}`) : navigate(-1)}
                className="btn btn-ghost btn-sm gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Idea
              </button>

              {/* Subtask 5.6: Prototype status badge */}
              <div>
                {isReady && (
                  <span className="badge badge-success gap-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Prototype Ready
                  </span>
                )}
                {isGenerating && (
                  <span className="badge badge-warning gap-2">
                    <ClockIcon className="w-3 h-3" />
                    Generating...
                  </span>
                )}
                {isFailed && (
                  <span className="badge badge-error gap-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    Generation Failed
                  </span>
                )}
              </div>
            </div>

            {/* Subtask 5.3: Prototype owner information */}
            <div className="flex items-start gap-4">
              <div className="avatar placeholder">
                <div className="bg-[#525355] text-white rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-lg">
                    {prototype.creator?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <UserIcon className="w-4 h-4 text-[#525355]" />
                  <span className="font-semibold text-gray-900">{prototype.creator?.name || 'Unknown User'}</span>
                  <span className="badge badge-sm badge-ghost">{prototype.creator?.role || 'user'}</span>
                </div>
                <div className="text-sm text-gray-600">{prototype.creator?.email}</div>
              </div>
            </div>

            {/* Subtask 5.4: Prototype generation timestamp and version */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#525355]" />
                <span>Generated {formatDistanceToNow(new Date(prototype.created_at), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="badge badge-outline">Version {prototype.version}</div>
              </div>
            </div>

            {/* Idea title */}
            {prototype.idea?.title && (
              <div className="mt-2">
                <h1 className="text-2xl font-bold text-gray-900">{prototype.idea.title}</h1>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {isFailed && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Prototype generation failed. Please try generating again from the PRD.</span>
          </div>
        )}

        {isGenerating && (
          <div className="alert alert-warning mb-6">
            <ClockIcon className="w-6 h-6" />
            <span>Prototype is still being generated. Please wait...</span>
          </div>
        )}

        {isReady && prototype.url && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subtask 5.5: Prototype Preview with device toggles */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold">Preview</h2>
                <DeviceSelector
                  selectedDevice={selectedDevice}
                  onDeviceChange={setSelectedDevice}
                />
              </div>

              <PrototypeFrame
                url={prototype.url}
                device={selectedDevice}
                className="mb-6"
              />

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-lg">About This Prototype</h3>
                  <p className="text-base-content/70">
                    This prototype was automatically generated using Open-Lovable. 
                    It features PassportCard branding with the signature #E10514 red color.
                  </p>
                  <div className="divider"></div>
                  <div className="flex flex-wrap gap-2">
                    <div className="badge badge-primary">Version {prototype.version}</div>
                    <div className="badge badge-outline">React + TypeScript</div>
                    <div className="badge badge-outline">DaisyUI + Tailwind</div>
                    <div className="badge badge-outline">PassportCard Theme</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtask 5.8: Refinement history sidebar */}
            <div className="space-y-6">
              {prdId && (
                <VersionHistoryPanel
                  prdId={prdId}
                  activeVersionId={prototypeId || ''}
                  onVersionSelect={(versionId) => navigate(`/admin/prototypes/${versionId}`)}
                />
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          {ideaId && (
            <button
              onClick={() => navigate(`/ideas/${ideaId}`)}
              className="btn btn-outline gap-2 rounded-[20px]"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Idea
            </button>
          )}
          {/* Subtask 5.10: View PRD button */}
          {prdId && (
            <button
              onClick={() => navigate(`/admin/prds/${prdId}`)}
              className="btn btn-primary gap-2 rounded-[20px]"
            >
              <ComputerDesktopIcon className="w-4 h-4" />
              View PRD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
