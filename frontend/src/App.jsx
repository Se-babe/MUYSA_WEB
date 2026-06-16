import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ConfigGuard from './components/ConfigGuard';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Alumni from './pages/Alumni';
import Events from './pages/Events';
import EventGallery from './pages/EventGallery';
import Jobs from './pages/Jobs';
import News from './pages/News';
import Messages from './pages/Messages';
import ManageUsers from './pages/ManageUsers';
import Members from './pages/Members';
import Profile from './pages/Profile';
import Executives from './pages/Executives';
import ManageExecutives from './pages/ManageExecutives';
import PostNews from './pages/PostNews';

export default function App() {
  return (
    <ErrorBoundary>
      <ConfigGuard>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <ProtectedRoute roles={['student', 'alumni', 'admin', 'staff']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/members" element={
            <ProtectedRoute roles={['admin']}>
              <Members />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute roles={['student', 'alumni', 'admin', 'staff']}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/students" element={
            <ProtectedRoute roles={['alumni', 'admin', 'staff']}>
              <Students />
            </ProtectedRoute>
          } />
          <Route path="/alumni" element={
            <ProtectedRoute roles={['alumni', 'admin', 'staff']}>
              <Alumni />
            </ProtectedRoute>
          } />
          <Route path="/news" element={
            <ProtectedRoute roles={['student', 'alumni', 'admin', 'staff']}>
              <News />
            </ProtectedRoute>
          } />
          <Route path="/news/:slug" element={
            <ProtectedRoute roles={['student', 'alumni', 'admin', 'staff']}>
              <News />
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute roles={['student', 'alumni', 'admin', 'staff']}>
              <Events />
            </ProtectedRoute>
          } />
          <Route path="/events/gallery" element={
            <ProtectedRoute roles={['student', 'alumni', 'admin', 'staff']}>
              <EventGallery />
            </ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute roles={['student', 'alumni', 'admin']}>
              <Jobs />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute roles={['student', 'alumni', 'admin', 'staff']}>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/executives" element={
            <ProtectedRoute roles={['alumni', 'admin', 'staff', 'student']}>
              <Executives />
            </ProtectedRoute>
          } />
          <Route path="/admin/executives" element={
            <ProtectedRoute roles={['admin']}>
              <ManageExecutives />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/post-news" element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <PostNews />
            </ProtectedRoute>
          } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ConfigGuard>
    </ErrorBoundary>
  );
}
