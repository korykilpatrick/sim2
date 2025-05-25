import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import LoadingSpinner from '@components/feedback/LoadingSpinner'
import { ConnectionStatus } from '@components/feedback'
import ProtectedRoute from '@routes/ProtectedRoute'
import AppLayout from '@components/layout/AppLayout'

// Lazy load pages
const HomePage = lazy(() => import('@pages/HomePage'))
const LoginPage = lazy(() => import('@features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@features/auth/pages/RegisterPage'))
const DashboardPage = lazy(
  () => import('@features/dashboard/pages/DashboardPage'),
)
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'))

// Vessel pages
const VesselsPage = lazy(() => import('@features/vessels/pages/VesselsPage'))
const VesselTrackingPage = lazy(
  () => import('@features/vessels/pages/VesselTrackingPage'),
)

// Area pages
const AreaMonitoringPage = lazy(
  () => import('@features/areas/pages/AreaMonitoringPage'),
)

// Fleet pages
const FleetsPage = lazy(() => import('@features/fleet/pages/FleetsPage'))
const FleetDetailPage = lazy(
  () => import('@features/fleet/pages/FleetDetailPage'),
)

// Reports pages
const ReportsPage = lazy(() => import('@features/reports/pages/ReportsPage'))
const ReportDetailPage = lazy(() => import('@pages/reports/ReportDetailPage'))

// Investigations pages
const InvestigationsPage = lazy(
  () => import('@features/investigations/pages/InvestigationsPage'),
)
const InvestigationDetailPage = lazy(
  () => import('@features/investigations/pages/InvestigationDetailPage'),
)
const InvestigationWizard = lazy(
  () =>
    import(
      '@features/investigations/components/investigation-wizard/InvestigationWizard'
    ),
)

// Credits pages
const CreditsPage = lazy(() => import('@pages/credits/CreditsPage'))

// Account & Settings pages
const ProfilePage = lazy(() => import('@pages/ProfilePage'))
const SettingsPage = lazy(() => import('@pages/SettingsPage'))

// Cart pages
const CartPage = lazy(() => import('@pages/CartPage'))

// Product pages
const ProductDetailPage = lazy(
  () => import('@pages/products/ProductDetailPage'),
)

// Payment pages
const CheckoutPage = lazy(() => import('@pages/CheckoutPage'))
const PaymentConfirmationPage = lazy(
  () => import('@pages/PaymentConfirmationPage'),
)

function App() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/products/sim/:productId"
            element={<ProductDetailPage />}
          />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/payment-confirmation"
            element={<PaymentConfirmationPage />}
          />

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
            <Route path="/areas" element={<AreaMonitoringPage />} />

            {/* Fleets */}
            <Route path="/fleets" element={<FleetsPage />} />
            <Route path="/fleets/:fleetId" element={<FleetDetailPage />} />

            {/* Reports */}
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:id" element={<ReportDetailPage />} />

            {/* Investigations */}
            <Route path="/investigations" element={<InvestigationsPage />} />
            <Route
              path="/investigations/new"
              element={<InvestigationWizard />}
            />
            <Route
              path="/investigations/:id"
              element={<InvestigationDetailPage />}
            />

            {/* Credits */}
            <Route path="/credits" element={<CreditsPage />} />

            {/* Account & Settings */}
            <Route path="/account" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="/help"
              element={
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                  <p className="text-gray-500">Help center coming soon</p>
                </div>
              }
            />
          </Route>

          {/* Redirect root to dashboard if authenticated */}
          <Route path="/home" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <ConnectionStatus />
    </>
  )
}

export default App
