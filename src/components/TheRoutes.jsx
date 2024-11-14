import StudentLibraryHours from "./Student/StudentLibraryHours";
import NasDashboard from "./NAS/NasDashboard";
import TeacherDashboard from "./Teacher/TeacherDashboard";
import LibrarianDashboard from "./Librarian/LibrarianDashboard";
import BookLog from "./Student/StudentBookLog";
import TapIn from "./Login/TapIn";
import StudentPersonalInfo from "./Student/StudentPersonalInfo";
import NasLibraryAttendance from "./NAS/NasLibraryAttendance";
import NasBookEntry from "./NAS/NasBookEntry";
import NasRegister from "./NAS/NasRegister";
import NasActivityLog from "./NAS/NasActivityLog";
import { Routes, Route, Link } from "react-router-dom";


export default function TheRoutes() {
    return (
        <Routes>
            <Route path="/" element={<TapIn />} />
            <Route path="/studentDashboard/TimeRemaining" element={<StudentLibraryHours />} />
            <Route path="/studentDashboard/TimeRemaining/Addbook" element={<StudentLibraryHours />} />
            <Route path="/studentDashboard/booklog" element={<BookLog />} />
            <Route path="/studentDashboard/personalInfo" element={<StudentPersonalInfo />} />
            <Route path="/nasDashboard/Home" element={<NasDashboard />} />
            <Route path="/nasDashboard/LibraryAttendance" element={<NasLibraryAttendance />} />
            <Route path="/nasDashboard/BookEntry" element={<NasBookEntry />} />
            <Route path="/nasDashboard/BookEntry/AddLog" element={<NasBookEntry />} />
            <Route path="/nasDashboard/Register" element={<NasRegister />} />
            <Route path="/nasDashboard/ActivityLog" element={<NasActivityLog />} />
            <Route path="/TeacherDashboard/Home" element={<TeacherDashboard />} />
            <Route path="/TeacherDashboard/Home/SetLibraryHours" element={<TeacherDashboard />} />
            <Route path="/librarianDashboard" element={<LibrarianDashboard />} />
            <Route path="*" element={<h1>Nothing Here..</h1>} />
        </Routes>
    )
}
