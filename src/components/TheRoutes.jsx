import StudentLibraryHours from "./Student/StudentLibraryHours";
import NasDashboard from "./NAS/NasDashboard";
import TeacherDashboard from "./Teacher/TeacherDashboard";
import LibrarianDashboard from "./Librarian/LibrarianDashboard";
import BookLog from "./Student/StudentBookLog";
import TapIn from "./Login/TapIn";
import StudentPersonalInfo from "./Student/StudentPersonalInfo"
import { Routes, Route, Link } from "react-router-dom";


export default function TheRoutes() {
    return (
        <Routes>
            <Route path="/" element={<TapIn />} />
            <Route path="/studentDashboard/TimeRemaining" element={<StudentLibraryHours />} />
            <Route path="/studentDashboard/TimeRemaining/Addbook" element={<StudentLibraryHours />} />
            <Route path="/studentDashboard/booklog" element={<BookLog />} />
            <Route path="/studentDashboard/personalInfo" element={<StudentPersonalInfo />} />
            <Route path="/nasDashboard" element={<NasDashboard />} />
            <Route path="/teacherDashboard" element={<TeacherDashboard />} />
            <Route path="/librarianDashboard" element={<LibrarianDashboard />} />
            <Route path="*" element={<h1>Nothing Here..</h1>} />
        </Routes>
    )
}
