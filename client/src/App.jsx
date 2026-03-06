import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResetPassword from './pages/ResetPassword';
import UserManagement from './pages/UserManagement';
import EmployeeList from './pages/EmployeeList';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import ViewEmployee from './pages/ViewEmployee';
import DepartmentList from './pages/DepartmentList';
import DepartmentDetail from './pages/DepartmentDetail';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceRecords from './pages/AttendanceRecords';
import MonthlyReport from './pages/MonthlyReport';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <Navbar />
                    <main className="main-content">
                        <Routes>
                            {/* Public route */}
                            <Route path="/login" element={<Login />} />

                            {/* Protected routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/register"
                                element={
                                    <ProtectedRoute roles={['Admin']}>
                                        <Register />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/users"
                                element={
                                    <ProtectedRoute roles={['Admin', 'HR']}>
                                        <UserManagement />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/reset-password"
                                element={
                                    <ProtectedRoute>
                                        <ResetPassword />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Employee routes */}
                            <Route
                                path="/employees"
                                element={
                                    <ProtectedRoute roles={['Admin', 'HR', 'Manager']}>
                                        <EmployeeList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/employees/add"
                                element={
                                    <ProtectedRoute roles={['Admin', 'HR']}>
                                        <AddEmployee />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/employees/:id"
                                element={
                                    <ProtectedRoute roles={['Admin', 'HR', 'Manager']}>
                                        <ViewEmployee />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/employees/:id/edit"
                                element={
                                    <ProtectedRoute roles={['Admin', 'HR']}>
                                        <EditEmployee />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Department routes */}
                            <Route
                                path="/departments"
                                element={
                                    <ProtectedRoute roles={['Admin', 'HR', 'Manager']}>
                                        <DepartmentList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/departments/:id"
                                element={
                                    <ProtectedRoute roles={['Admin', 'HR', 'Manager']}>
                                        <DepartmentDetail />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Attendance routes */}
                            <Route
                                path="/attendance/mark"
                                element={
                                    <ProtectedRoute roles={['Admin', 'HR', 'Manager']}>
                                        <MarkAttendance />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/attendance/records"
                                element={
                                    <ProtectedRoute>
                                        <AttendanceRecords />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/attendance/report"
                                element={
                                    <ProtectedRoute roles={['Admin', 'HR', 'Manager']}>
                                        <MonthlyReport />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Default redirect */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </main>
                </div>

                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
            </Router>
        </AuthProvider>
    );
}

export default App;
