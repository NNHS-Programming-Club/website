import React, { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doPasswordReset,
} from "../firebase/auth";
import { useAuth } from "../contexts/authContext";

import "./RegisterLogin.css";

const Login = () => {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      setErrorMessage(""); // Clear any previous error messages

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMessage("Please enter a valid email address");
        setIsSigningIn(false);
        return;
      }

      try {
        await doSignInWithEmailAndPassword(email, password);
        navigate("/profile");
        // doSendEmailVerification()
      } catch (error) {
        console.error("Login error:", error);
        // Handle different types of Firebase auth errors
        let errorMsg = "An error occurred during sign in";
        if (error.code === "auth/user-not-found") {
          errorMsg = "No account found with this email address";
        } else if (error.code === "auth/wrong-password") {
          errorMsg = "Incorrect password";
        } else if (error.code === "auth/invalid-credential") {
          errorMsg = "Incorrect email or password";
        } else if (error.code === "auth/too-many-requests") {
          errorMsg = "Too many failed attempts. Please try again later";
        } else if (error.code === "auth/user-disabled") {
          errorMsg = "This account has been disabled";
        }
        setErrorMessage(errorMsg);
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  const onGoogleSignIn = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      setErrorMessage(""); // Clear any previous error messages
      try {
        await doSignInWithGoogle();
        navigate("/profile");
      } catch (error) {
        console.error("Google sign-in error:", error);
        let errorMsg = "An error occurred during Google sign in";
        if (error.code === "auth/popup-closed-by-user") {
          errorMsg = "Sign in was cancelled";
        } else if (error.code === "auth/popup-blocked") {
          errorMsg = "Popup was blocked. Please allow popups for this site";
        } else if (
          error.code === "auth/account-exists-with-different-credential"
        ) {
          errorMsg =
            "An account already exists with the same email address but different sign-in credentials";
        }
        setErrorMessage(errorMsg);
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  const onForgotPassword = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address first");
      return;
    }
    setErrorMessage("");
    setResetMessage("");
    try {
      await doPasswordReset(email);
      setResetMessage(
        "Password reset email sent! Check your inbox and junk mail."
      );
    } catch (error) {
      console.error("Password reset error:", error);
      setErrorMessage("Failed to send password reset email. Please try again.");
    }
  };

  return (
    <div>
      {userLoggedIn && <Navigate to={"/profile"} replace={true} />}

      <main className="container d-flex justify-content-center align-items-center py-5">
        <div
          className="loginCardWrapped card bg-body text-body shadow-lg p-4 rounded-4"
          style={{ maxWidth: "420px", width: "100%" }}
        >
          <img
            className="tigerlogo logo-light"
            src="/images/icons/tiger_icon-light.png"
            alt="Tiger Logo"
          />
          <img
            className="tigerlogo logo-dark"
            src="/images/icons/tiger_icon-dark.png"
            alt="Tiger Logo"
          />

          <div className="text-center">
            <div className="mt-2">
              <h3 className="enterTitle">Welcome Back</h3>
            </div>
          </div>
          <form onSubmit={onSubmit} className="enterForm">
            <div>
              <input
                placeholder="Email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control mb-3 enterInput"
              />

              <input
                placeholder="Password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control mb-3 enterInput"
              />
            </div>

            <div className="text-start">
              <button
                type="button"
                onClick={onForgotPassword}
                className="btn btn-link p-0 text-decoration-none"
                style={{ fontSize: "0.75rem" }}
              >
                Forgot Password?
              </button>
            </div>

            {errorMessage && <span className="errMSG">{errorMessage}</span>}

            {resetMessage && (
              <span className="text-green-600 text-sm">{resetMessage}</span>
            )}

            <button
              type="submit"
              disabled={isSigningIn || !password || !email}
              className="btn btn-primary w-100"
            >
              {isSigningIn ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <p className="switchEnter">
            Don't have an account?{" "}
            <Link to={"/register"} className="hover:underline font-bold">
              Sign up
            </Link>
          </p>
          <div className="flex flex-row text-center w-full">
            <div className="border-b-2 mb-2.5 mr-2 w-full"></div>
            <div className="text-sm font-bold w-fit">OR</div>
            <div className="border-b-2 mb-2.5 ml-2 w-full"></div>
          </div>
          <button
            disabled={isSigningIn}
            onClick={onGoogleSignIn}
            className="btn btn-google w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              width="20"
              height="20"
            />
            {isSigningIn ? "Signing In..." : "Continue with Google"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;
