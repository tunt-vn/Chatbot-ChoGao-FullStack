import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import ChatWindow from './components/ChatWindow'
import FAQ from './pages/FAQ'
import Schedule from './pages/Schedule'
import Admin from './pages/Admin'
import UserManagement from './pages/UserManagement'
import QAManagement from './pages/QAManagement'
import NotificationManagement from './pages/NotificationManagement'
import ActivityLogs from './pages/ActivityLogs'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Routes (No Layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Main Routes (With Layout) */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route
                path="chat"
                element={
                  <ProtectedRoute>
                    <ChatWindow />
                  </ProtectedRoute>
                }
              />
              <Route path="faq" element={<FAQ />} />
              <Route path="schedule" element={<Schedule />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/qa"
                element={
                  <ProtectedRoute>
                    <QAManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/activity-logs"
                element={
                  <ProtectedRoute>
                    <ActivityLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

