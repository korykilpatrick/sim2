import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import LoadingSpinner from '@components/feedback/LoadingSpinner'
import ProtectedRoute from '@routes/ProtectedRoute'
import AppLayout from '@components/layout/AppLayout'

// Lazy load pages
const HomePage = lazy(() => import('@pages/HomePage'))
const LoginPage = lazy(() => import('@pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@pages/auth/RegisterPage'))
const DashboardPage = lazy(() => import('@pages/DashboardPage'))
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'))

// Vessel pages
const VesselsPage = lazy(() => import('@pages/vessels/VesselsPage'))
const VesselTrackingPage = lazy(() => import('@pages/vessels/VesselTrackingPage'))

// Area pages
const AreasPage = lazy(() => import('@pages/areas/AreasPage'))

// Fleet pages
const FleetsPage = lazy(() => import('@pages/fleets/FleetsPage'))

// Reports pages
const ReportsPage = lazy(() => import('@pages/reports/ReportsPage'))

// Credits pages
const CreditsPage = lazy(() => import('@pages/credits/CreditsPage'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Vessels */}
          <Route path="/vessels" element={<VesselsPage />} />
          <Route path="/vessels/track" element={<VesselTrackingPage />} />
          
          {/* Areas */}
          <Route path="/areas" element={<AreasPage />} />
          
          {/* Fleets */}
          <Route path="/fleets" element={<FleetsPage />} />
          
          {/* Reports */}
          <Route path="/reports" element={<ReportsPage />} />
          
          {/* Credits */}
          <Route path="/credits" element={<CreditsPage />} />
        </Route>

        {/* Redirect root to dashboard if authenticated */}
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App