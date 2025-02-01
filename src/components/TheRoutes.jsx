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
import LibrarianStudentLibraryHours from './Librarian/LibrarianStudentLibraryHours';
import LibrarianNASActivityLog from './Librarian/LibrarianNASActivityLog';
import LibrarianManageTeacher from "./Librarian/ManageTeacher";
import LibrarianManageRecords from "./Librarian/ManageRecords";
import LibrarianManageBooks from "./Librarian/ManageBooks";
import LibrarianManageStudent from "./Librarian/ManageStudent";
import LibrarianManageGenre from "./Librarian/ManageGenre";
import LibrarianManageNASStudent from "./Librarian/ManageNASStudent";
import StudentAnalyticsAndReports from "./Student/StudentAnalyticsAndReports";
import ProtectedRoute from './ProtectedRoute';
import { Routes, Route, Link } from "react-router-dom";


export default function TheRoutes() {
    return (
        <Routes>
            <Route path="/" element={<InputIDLogin />} />
            <Route path="/Tap-Out" element={<InputIDLogout />} />
            <Route path="/LoginHomepage" element={<LogInHomepage />} />
            <Route path="/Login" element={<LogIn />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/ResetPassword" element={<ForgotPassword />} />
            <Route path="/studentDashboard/TimeRemaining" element={<ProtectedRoute><StudentLibraryHours /></ProtectedRoute> } />
            <Route path="/studentDashboard/TimeRemaining/Addbook" element={<ProtectedRoute><StudentLibraryHours /> </ProtectedRoute>} />
            <Route path="/studentDashboard/booklog" element={<ProtectedRoute><BookLog /></ProtectedRoute>} />
            <Route path="/studentDashboard/personalInfo" element={<ProtectedRoute><StudentPersonalInfo /></ProtectedRoute>} />
            <Route path="/nasDashboard/Home" element={<NasDashboard />} />
            <Route path="/studentDashboard/StudentAnalyticsAndReports" element={<StudentAnalyticsAndReports/>} />
            <Route path="/nasDashboard/LibraryAttendance" element={<NasLibraryAttendance />} />
            <Route path="/nasDashboard/BookEntry" element={<NasBookEntry />} />
            <Route path="/nasDashboard/BookEntry/AddLog" element={<NasBookEntry />} />
            <Route path="/nasDashboard/NasBooklRegistration" element={<NasBooklRegistration />} />
            <Route path="/nasDashboard/ActivityLog" element={<NasActivityLog />} />
            <Route path="/TeacherDashboard/Home" element={<TeacherDashboard />} />
            <Route path="/TeacherDashboard/Home/SetLibraryHours" element={<TeacherDashboard />} />
            <Route path="/TeacherDashboard/StudentRecords" element={<StudentRecords />} />
            <Route path="/TeacherDashboard/CompletedLibraryHours" element={<CompletedLibraryHours />} />
            <Route path="/TeacherDashboard/Analytics" element={<Analytics />} />
            <Route path="/librarian/Home" element={<LibrarianDashboard />} />
            <Route path="/librarian/LibrarianAnalytics" element={<LibrarianAnalytics/>} />
            <Route path="/librarian/LibrarianStudentLibraryHours" element={<LibrarianStudentLibraryHours />} />
            <Route path="/librarian/LibrarianNASActivityLog" element={<LibrarianNASActivityLog />} />
            <Route path="/librarian/LibrarianManageTeacher" element={<LibrarianManageTeacher />} />
            <Route path="/librarian/LibrarianManageRecords" element={<LibrarianManageRecords />} />
            <Route path="/librarian/LibrarianManageBooks" element={<LibrarianManageBooks/>} />
            <Route path="/librarian/LibrarianManageStudent" element={<LibrarianManageStudent/>} />
            <Route path="/librarian/Genre" element={<LibrarianManageGenre/>} />
            <Route path="/librarian/LibrarianManageNASStudent" element={<LibrarianManageNASStudent/>} />
            
            <Route path="*" element={<h1>Nothing Here..</h1>} />
        </Routes>
    )
}
