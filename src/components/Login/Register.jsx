import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
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

  // States for UI interaction
  const [focusedInput, setFocusedInput] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false
  });
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  
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
        setIsLoading(true);
        
        // Fetch active grade levels
        const gradesResponse = await axios.get('http://localhost:8080/api/grade-sections/active');
        const uniqueGrades = [...new Set(gradesResponse.data.map(item => item.gradeLevel))];
        const sortedGrades = sortGradeLevels(uniqueGrades);
        setGradeOptions(sortedGrades);

        // Fetch active academic years using the new endpoint
        const academicYearsResponse = await axios.get('http://localhost:8080/api/academic-years/active');
        const formattedAcademicYears = academicYearsResponse.data.map(year => `${year.startYear}-${year.endYear}`);
        setAcademicYearOptions(formattedAcademicYears);

      } catch (error) {
        console.error('Error fetching dropdown options:', error);
        setMessage('Failed to load registration options');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDropdownOptions();
  }, []);

  // Fetch sections when grade changes
  useEffect(() => {
    const fetchSections = async () => {
      if (formData.grade) {
        try {
          setIsLoading(true);
          // Use the new endpoint for active sections by grade
          const sectionsResponse = await axios.get(`http://localhost:8080/api/grade-sections/grade/${formData.grade}/active`);
          const sections = sectionsResponse.data.map(section => section.sectionName);
          setSectionOptions(sections);
        } catch (error) {
          console.error('Error fetching sections:', error);
          setMessage('Failed to load sections');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSections();
  }, [formData.grade]);

  // Update password validation state whenever password changes
  useEffect(() => {
    validatePassword(formData.password);
  }, [formData.password]);

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
    
    // Show password validation criteria when password field is focused
    if (inputName === 'password') {
      setShowPasswordValidation(true);
    }
  };

  const handleBlur = (inputName) => {
    setFocusedInput(null);
    
    // Keep showing validation if password is not empty and not all criteria are met
    if (inputName === 'password') {
      const allValid = Object.values(passwordValidation).every(Boolean);
      if (formData.password === '' || allValid) {
        setShowPasswordValidation(false);
      }
    }
  };

  const getInputStyle = (inputName) => ({
    width: "100%",
    maxWidth: "395px",
    padding: "12px",
    border: `2px solid ${
      focusedInput === inputName 
        ? "black" 
        : inputName === 'password' && formData.password !== '' && !isPasswordValid() 
          ? "#dc3545" 
          : "#ccc"
    }`,
    borderRadius: "5px",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "10px",
  });

  const validatePassword = (password) => {
    const validations = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)
    };
    
    setPasswordValidation(validations);
    return validations;
  };
  
  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation before submission
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      setIsSuccess(false);
      return;
    }

    if (!isPasswordValid()) {
      setMessage("Your password doesn't meet all requirements.");
      setIsSuccess(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:8080/api/users/register", {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
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
    } finally {
      setIsLoading(false);
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
                onBlur={() => handleBlur("firstName")}
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
                onBlur={() => handleBlur("middleName")}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                style={{ ...getInputStyle("lastName"), width: "32%" }}
                onFocus={() => handleFocus("lastName")}
                onBlur={() => handleBlur("lastName")}
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
                onBlur={() => handleBlur("idNumber")}
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
                onBlur={() => handleBlur("grade")}
                required
                disabled={isLoading}
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
                onBlur={() => handleBlur("section")}
                required
                disabled={!formData.grade || isLoading}
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
                onBlur={() => handleBlur("academicYear")}
                required
                disabled={isLoading}
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
                onBlur={() => handleBlur("password")}
                required
              />
              
              {/* Password validation feedback */}
              {showPasswordValidation && (
                <div style={styles.passwordRequirements}>
                  <p style={styles.requirementsTitle}>Password must contain:</p>
                  <ul style={styles.requirementsList}>
                    <li style={{
                      ...styles.requirementItem,
                      color: passwordValidation.minLength ? '#28a745' : '#dc3545'
                    }}>
                      {passwordValidation.minLength ? '✓' : '✗'} At least 8 characters
                    </li>
                    <li style={{
                      ...styles.requirementItem,
                      color: passwordValidation.hasUpperCase ? '#28a745' : '#dc3545'
                    }}>
                      {passwordValidation.hasUpperCase ? '✓' : '✗'} At least one uppercase letter
                    </li>
                    <li style={{
                      ...styles.requirementItem,
                      color: passwordValidation.hasLowerCase ? '#28a745' : '#dc3545'
                    }}>
                      {passwordValidation.hasLowerCase ? '✓' : '✗'} At least one lowercase letter
                    </li>
                    <li style={{
                      ...styles.requirementItem,
                      color: passwordValidation.hasNumber ? '#28a745' : '#dc3545'
                    }}>
                      {passwordValidation.hasNumber ? '✓' : '✗'} At least one number
                    </li>
                    <li style={{
                      ...styles.requirementItem,
                      color: passwordValidation.hasSpecial ? '#28a745' : '#dc3545'
                    }}>
                      {passwordValidation.hasSpecial ? '✓' : '✗'} At least one special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                style={{
                  ...getInputStyle("confirmPassword"),
                  borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword ? '#dc3545' : undefined
                }}
                onFocus={() => handleFocus("confirmPassword")}
                onBlur={() => handleBlur("confirmPassword")}
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p style={styles.errorText}>Passwords do not match</p>
              )}
            </div>

            <button 
              type="submit" 
              style={{
                ...styles.registerButton,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Register"}
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
    maxWidth: "450px",
    padding: "20px",
  },
  registerBox: {
    width: "100%",
    maxWidth: "450px",
    padding: "20px 30px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
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
    width: "100%",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: "10px",
    fontSize: "12px",
    width: "100%",
  },
  passwordRequirements: {
    backgroundColor: "#f8f9fa",
    borderRadius: "5px",
    padding: "10px",
    marginBottom: "15px",
    textAlign: "left",
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #ddd",
  },
  requirementsTitle: {
    margin: "0 0 10px 0",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
  },
  requirementsList: {
    margin: 0,
    padding: "0 0 0 20px",
    listStyleType: "none",
  },
  requirementItem: {
    fontSize: "12px",
    margin: "5px 0",
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
    transition: "background-color 0.3s ease",
    fontWeight: "bold",
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
    fontWeight: "bold",
  },
  alertMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "5px",
    textAlign: "center",
    fontSize: "12px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    margin: "5px 0 0 0",
    textAlign: "left",
  }
};

export default Register;