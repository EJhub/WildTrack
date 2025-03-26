import StudentLibraryHours from "./Student/StudentLibraryHoursDashboard";
import NasDashboard from "./NAS/NasDashboard";
import TeacherDashboard from "./Teacher/TeacherDashboard";
import LibrarianDashboard from "./Librarian/LibrarianDashboard";
import BookLog from "./Student/StudentBookLog";
import InputIDLogin from "./Login/InputIDLogin";
import InputIDLogout from "./Login/InputIDLogout";
import ForgotPassword from "./Login/ForgotPassword";
import StudentPersonalInfo from "./Student/StudentPersonalInfo";
import NasLibraryAttendance from "./NAS/NasLibraryAttendance";
import NasBookEntry from "./NAS/NasBookEntry";
import NasBooklRegistration from "./NAS/NasBooklRegistration";
import NasActivityLog from "./NAS/NasActivityLog";
import StudentRecords from "./Teacher/StudentRecords";
import CompletedLibraryHours from "./Teacher/CompletedLibraryHours";
import Analytics from "./Teacher/Analytics";
import LogInHomepage from "./Login/LoginHomePage";
import LogIn from "./Login/Login";
import Register from "./Login/Register";
import LibrarianAnalytics from "./Librarian/LibrarianAnalytics";
import LibrarianCompletedHours from './Librarian/LibrarianCompletedHours';
import LibrarianNASActivityLog from './Librarian/LibrarianNASActivityLog';
import LibrarianManageTeacher from "./Librarian/ManageTeacher";
import LibrarianManageRecords from "./Librarian/ManageRecords";
import LibrarianManageBooks from "./Librarian/ManageBooks";
import LibrarianManageStudent from "./Librarian/ManageStudent";
import LibrarianManageGenre from "./Librarian/ManageGenre";
import LibrarianManageNASStudent from "./Librarian/ManageNASStudent";
import StudentAnalyticsAndReports from "./Student/StudentAnalytics";
import ProtectedRoute from './ProtectedRoute';
import NotificationsPage from './Student/NotificationsPage';
import { Routes, Route, Link } from "react-router-dom";
import LibraryRequirementsProgress from './Student/LibraryRequirementsProgress';
import LibrarianLogin from "./Login/LibrarianLogin";
import TeacherNotificationPage from "./Teacher/TeacherNotificationPage";
import LibrarianNotificationPage from "./Librarian/LibrarianNotificationPage";
import LoginProtection from './LoginProtection';
import ChangePassword from "./Login/ChangePassword";

export default function TheRoutes() {
    return (
        <Routes>
            <Route path="/student/requirements" element={<ProtectedRoute><LibraryRequirementsProgress /></ProtectedRoute>} />
            <Route path="/Studentnotifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/" element={<InputIDLogin />} />
            <Route path="/Tap-Out" element={<InputIDLogout />} />
            <Route path="/LoginHomepage" element={<LogInHomepage />} />
            <Route path="/Login" element={<LoginProtection><LogIn /></LoginProtection>} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/Register" element={<LoginProtection><Register /></LoginProtection>} />
            <Route path="/ResetPassword" element={<ForgotPassword />} />
            <Route path="/studentDashboard/TimeRemaining" element={<ProtectedRoute><StudentLibraryHours /></ProtectedRoute> } />
            <Route path="/studentDashboard/TimeRemaining/Addbook" element={<ProtectedRoute><StudentLibraryHours /> </ProtectedRoute>} />
            <Route path="/studentDashboard/booklog" element={<ProtectedRoute><BookLog /></ProtectedRoute>} />
            <Route path="/studentDashboard/personalInfo" element={<ProtectedRoute><StudentPersonalInfo /></ProtectedRoute>} />
            <Route path="/nasDashboard/Home" element={<NasDashboard />} />
            <Route path="/studentDashboard/StudentAnalyticsAndReports" element={<ProtectedRoute><StudentAnalyticsAndReports/></ProtectedRoute>} />
            <Route path="/nasDashboard/LibraryAttendance" element={<NasLibraryAttendance />} />
            <Route path="/nasDashboard/BookEntry" element={<NasBookEntry />} />
            <Route path="/nasDashboard/BookEntry/AddLog" element={<NasBookEntry />} />
            <Route path="/nasDashboard/NasBooklRegistration" element={<NasBooklRegistration />} />
            <Route path="/nasDashboard/ActivityLog" element={<NasActivityLog />} />
            <Route path="/TeacherDashboard/Home" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/TeacherDashboard/Home/SetLibraryHours" element={<TeacherDashboard />} />
            <Route path="/TeacherDashboard/StudentRecords" element={<ProtectedRoute><StudentRecords /></ProtectedRoute>} />
            <Route path="/TeacherDashboard/CompletedLibraryHours" element={<ProtectedRoute><CompletedLibraryHours /></ProtectedRoute>} />
            <Route path="/TeacherDashboard/Analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/Teachernotifications" element={<ProtectedRoute><TeacherNotificationPage /></ProtectedRoute>} />
            
            {/* Librarian routes - protected with role restriction */}
            <Route path="/librarian/Login" element={<LoginProtection><LibrarianLogin /></LoginProtection>} />
            <Route path="/librarian/Home" element={
                <ProtectedRoute allowedRoles={['Librarian']}>
                    <LibrarianDashboard />
                </ProtectedRoute>
            } />
            <Route path="/librarian/LibrarianAnalytics" element={
                <ProtectedRoute allowedRoles={['Librarian']}>
                    <LibrarianAnalytics/>
                </ProtectedRoute>
            } />
            <Route path="/librarian/LibrarianCompletedHours" element={
                <ProtectedRoute allowedRoles={['Librarian']}>
                    <LibrarianCompletedHours />
                </ProtectedRoute>
            } />
            <Route path="/librarian/LibrarianNASActivityLog" element={
                <ProtectedRoute allowedRoles={['Librarian']}>
                    <LibrarianNASActivityLog />
                </ProtectedRoute>
            } />
            <Route path="/librarian/LibrarianManageTeacher" element={
                <ProtectedRoute allowedRoles={['Librarian']}>
                    <LibrarianManageTeacher />
                </ProtectedRoute>
            } />
            <Route path="/librarian/LibrarianManageRecords" element={
                <ProtectedRoute allowedRoles={['Librarian']}>
                    <LibrarianManageRecords />
                </ProtectedRoute>
            } />
            <Route path="/librarian/LibrarianManageBooks" element={
                <ProtectedRoute allowedRoles={['Librarian']}>
                    <LibrarianManageBooks/>
                </ProtectedRoute>
            } />
            <Route path="/librarian/LibrarianManageStudent" element={
                <ProtectedRoute allowedRoles={['Librarian']}>
                    <LibrarianManageStudent/>
                </ProtectedRoute>
            } />
            <Route path="/librarian/Genre" element={
                <ProtectedRoute allowedRoles={['Librarian']}>
                    <LibrarianManageGenre/>
                </ProtectedRoute>
            } />
            <Route path="/librarian/LibrarianManageNASStudent" element={
                <ProtectedRoute allowedRoles={['Librarian']}>
                    <LibrarianManageNASStudent/>
                </ProtectedRoute>
            } />

            <Route path="/librarian/notifications" element={
                            <ProtectedRoute allowedRoles={['Librarian']}>
                                <LibrarianNotificationPage/>
                            </ProtectedRoute>
                        } />
            
            <Route path="*" element={<h1>Nothing Here..</h1>} />
        </Routes>
    )
}