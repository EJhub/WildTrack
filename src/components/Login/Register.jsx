import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
    idNumber: "",
    grade: "",
    section: "",
    academicYear: "",
  });

  // State for dropdown options
  const [gradeOptions, setGradeOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);

  const [focusedInput, setFocusedInput] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Sort function for grade levels
  const sortGradeLevels = (grades) => {
    const gradeOrder = {
      'Nursery': 0,
      'Kinder': 1,
      'Preparatory': 2,
      'Grade 1': 3,
      'Grade 2': 4,
      'Grade 3': 5,
      'Grade 4': 6,
      'Grade 5': 7,
      'Grade 6': 8
    };

    return grades.sort((a, b) => gradeOrder[a] - gradeOrder[b]);
  };

  // Fetch dropdown options when component mounts
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        // Fetch active grade levels
        const gradesResponse = await axios.get('http://localhost:8080/api/grade-sections/active');
        const uniqueGrades = [...new Set(gradesResponse.data.map(item => item.gradeLevel))];
        const sortedGrades = sortGradeLevels(uniqueGrades);
        setGradeOptions(sortedGrades);

        // Fetch active sections for the selected grade
        if (formData.grade) {
          // Use the new endpoint for active sections by grade
          const sectionsResponse = await axios.get(`http://localhost:8080/api/grade-sections/grade/${formData.grade}/active`);
          const sections = sectionsResponse.data.map(section => section.sectionName);
          setSectionOptions(sections);
        }

        // Fetch active academic years using the new endpoint
        const academicYearsResponse = await axios.get('http://localhost:8080/api/academic-years/active');
        const formattedAcademicYears = academicYearsResponse.data.map(year => `${year.startYear}-${year.endYear}`);
        setAcademicYearOptions(formattedAcademicYears);

      } catch (error) {
        console.error('Error fetching dropdown options:', error);
        setMessage('Failed to load registration options');
      }
    };

    fetchDropdownOptions();
  }, [formData.grade]);

  // Rest of the component remains the same...

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for grade change
    if (name === 'grade') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
        section: '' // Reset section when grade changes
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  const handleBlur = () => {
    setFocusedInput(null);
  };

  const getInputStyle = (inputName) => ({
    width: "100%",
    maxWidth: "395px",
    padding: "12px",
    border: `2px solid ${focusedInput === inputName ? "black" : "#ccc"}`,
    borderRadius: "5px",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "10px",
  });

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      setIsSuccess(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setMessage("Password must be at least 8 characters long.");
      setIsSuccess(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/users/register", {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: "Student",
        idNumber: formData.idNumber,
        grade: formData.grade,
        section: formData.section,
        academicYear: formData.academicYear
      });

      setMessage("Registration successful!");
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      const errorMessage = error.response?.data?.error || "Registration failed. Please try again.";
      setMessage(errorMessage);
      setIsSuccess(false);
      console.error("Error:", error);
    }
  };

  return (
    <div style={styles.background}>
      {message && (
        <div style={{
          ...styles.alertMessage,
          backgroundColor: isSuccess ? "#d4edda" : "#f8d7da",
          color: isSuccess ? "#155724" : "#721c24",
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: "auto",
          maxWidth: "350px",
          padding: "8px",
          borderRadius: "5px",
          textAlign: "center",
        }}>
          <p>{message}</p>
        </div>
      )}

      <div style={styles.container}>
        <div style={styles.registerBox}>
          <h2 style={styles.title}>Student Registration</h2>

          <form onSubmit={handleSubmit}>
          <div style={styles.rowInputGroup}>
  <input
    type="text"
    name="firstName"
    placeholder="First Name"
    value={formData.firstName}
    onChange={handleInputChange}
    style={{ ...getInputStyle("firstName"), width: "32%" }}
    onFocus={() => handleFocus("firstName")}
    onBlur={handleBlur}
    required
  />
  <input
    type="text"
    name="middleName"
    placeholder="Middle Name"
    value={formData.middleName}
    onChange={handleInputChange}
    style={{ ...getInputStyle("middleName"), width: "32%" }}
    onFocus={() => handleFocus("middleName")}
    onBlur={handleBlur}
  />
  <input
    type="text"
    name="lastName"
    placeholder="Last Name"
    value={formData.lastName}
    onChange={handleInputChange}
    style={{ ...getInputStyle("lastName"), width: "32%" }}
    onFocus={() => handleFocus("lastName")}
    onBlur={handleBlur}
    required
  />
</div>

            <div style={styles.inputGroup}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                style={getInputStyle("email")}
                onFocus={() => handleFocus("email")}
                onBlur={handleBlur}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <input
                type="text"
                name="idNumber"
                placeholder="ID Number"
                value={formData.idNumber}
                onChange={handleInputChange}
                style={getInputStyle("idNumber")}
                onFocus={() => handleFocus("idNumber")}
                onBlur={handleBlur}
                required
              />
            </div>

            <div style={styles.rowInputGroup}>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                style={{ ...getInputStyle("grade"), width: "48%" }}
                onFocus={() => handleFocus("grade")}
                onBlur={handleBlur}
                required
              >
                <option value="">Select Grade</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>

              <select
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                style={{ ...getInputStyle("section"), width: "48%" }}
                onFocus={() => handleFocus("section")}
                onBlur={handleBlur}
                required
                disabled={!formData.grade}
              >
                <option value="">
                  {!formData.grade ? "Select Grade First" : "Select Section"}
                </option>
                {sectionOptions.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                style={getInputStyle("academicYear")}
                onFocus={() => handleFocus("academicYear")}
                onBlur={handleBlur}
                required
              >
                <option value="">Select Academic Year</option>
                {academicYearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                style={getInputStyle("password")}
                onFocus={() => handleFocus("password")}
                onBlur={handleBlur}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                style={getInputStyle("confirmPassword")}
                onFocus={() => handleFocus("confirmPassword")}
                onBlur={handleBlur}
                required
              />
            </div>

            <button type="submit" style={styles.registerButton}>
              Register
            </button>
          </form>

          <p style={styles.loginText}>
            Already have an account?{" "}
            <span style={styles.loginLink} onClick={() => navigate("/login")}>
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  background: {
    position: "relative",
    backgroundImage: `url('CITU-GLE Building.png')`,
    backgroundSize: "100% 100%",
    backgroundPosition: "center",
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    filter: "brightness(0.8) contrast(1.5) saturate(1.1)",
  },
  container: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    maxWidth: "400px",
    padding: "20px",
  },
  registerBox: {
    width: "90%",
    maxWidth: "400px",
    padding: "20px 30px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "8px",
    textAlign: "center",
  },
  title: {
    fontSize: "26px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "25px",
  },
  rowInputGroup: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "10px",
    fontSize: "12px",
  },
  registerButton: {
    width: "100%",
    padding: "10px",
    height: "45px",
    backgroundColor: "#781B1B",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "15px",
    marginTop: "10px",
  },
  loginText: {
    marginTop: "20px",
    fontSize: "12px",
    color: "#333",
  },
  loginLink: {
    color: "#007bff",
    textDecoration: "none",
    cursor: "pointer",
  },
  alertMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "5px",
    textAlign: "center",
    fontSize: "12px",
  },
};

export default Register;