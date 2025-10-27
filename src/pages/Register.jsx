import React, { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { doCreateUserWithEmailAndPassword } from "../firebase/auth";
import "./RegisterLogin.css";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { userLoggedIn } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isRegistering) {
      setIsRegistering(true);
      setErrorMessage(""); // Clear any previous error messages

      // Validate Full Name
      if (!fullName.trim()) {
        setErrorMessage("Full Name is required");
        setIsRegistering(false);
        return;
      }

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMessage("Please enter a valid email address");
        setIsRegistering(false);
        return;
      }

      // Check password length
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long");
        setIsRegistering(false);
        return;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        setIsRegistering(false);
        return;
      }

      try {
        await doCreateUserWithEmailAndPassword(email, password, fullName);
        navigate("/profile");
      } catch (error) {
        console.error("Registration error:", error);
        setErrorMessage(error.message || "An error occurred during registration");
      } finally {
        setIsRegistering(false);
      }
    }
  };

  return (
    <>
      {userLoggedIn && <Navigate to={"/profile"} replace={true} />}
      <main className="mainlogin">
        <div className="loginCard">
          <div className="loginCardWrapped">
            <img
              className="tigerlogo"
              src="images/icons/plus icon.png"
              alt="Plus Icon"
            />
            <div className="text-center mb-6">
              <div className="mt-2">
                <h3 className="enterTitle">
                  Create a New Account
                </h3>
              </div>
            </div>
            <form onSubmit={onSubmit} className="enterForm">
              <div>
                <input
                  placeholder="Full Name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="enterInput"
                  disabled={isRegistering}
                />
              </div>
              <div>
                {/* <label className="text-sm text-gray-600 font-bold">
                Email
              </label> */}
                <input
                  placeholder="Email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className="enterInput"
                />
              </div>

              <div>
                <input
                  placeholder="Password"
                  disabled={isRegistering}
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  className="enterInput"
                />
              </div>
              {password && (
                <div>
                  <input
                    placeholder="Confirm Password"
                    disabled={isRegistering}
                    type="password"
                    autoComplete="off"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setconfirmPassword(e.target.value);
                    }}
                    className="enterInput"
                  />
                </div>
              )}

              {errorMessage && (
                <span className="errMSG">{errorMessage}</span>
              )}

              <button
                type="submit"
                disabled={isRegistering}
                className={`enterSubmit ${email && password && confirmPassword
                  ? "enterActivated"
                  : "enterDeactivated"
                  }`}
              >
                {isRegistering ? "Signing Up..." : "Sign Up"}
              </button>
              <div className="switchEnter">
                Already have an account? {"   "}
                <Link
                  to={"/login"}
                  className="text-center text-sm hover:underline font-bold"
                >
                  Log In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default Register;
