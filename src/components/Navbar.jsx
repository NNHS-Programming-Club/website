import { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { doSignOut } from "../firebase/auth";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(true);
  const [darkIconPath, setDarkIconPath] = useState(
    "images/icons/dark-mode.svg"
  );
  const [lightIconPath, setLightIconPath] = useState(
    "images/icons/light-mode.svg"
  );
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const htmlElement = document.querySelector("html");
    htmlElement.setAttribute("data-bs-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <img
              className="logo"
              src="images/icons/progclublogo.png"
              alt="Programming club logo"
            />
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            {/* Left-side links */}
            <ul className="navbar-nav flex-column flex-lg-row me-lg-auto align-items-start align-items-lg-center">
              <li className="nav-item">
                <Link to="/about" className="nav-link">
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/members" className="nav-link">
                  Members
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/projects" className="nav-link">
                  Projects
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/events" className="nav-link">
                  Events
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/daily-problem" className="nav-link">
                  Daily Problem
                </Link>
              </li>
            </ul>

            {/* Login / Sign Up Buttons */}
            <ul className="navbar-nav d-flex flex-row align-items-center mt-2 mt-lg-0">
              <li className="nav-item me-2">
                <Link to="/login" className="nav-link">
                  Log In
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register">
                  <button type="button" className="btn btn-primary">
                    Sign Up
                  </button>
                </Link>
              </li>
            </ul>

            {/* 4 Icons */}
            <ul className="navbar-nav d-flex flex-row align-items-center mt-2 mt-lg-0 ms-3">
              <li className="nav-item me-2">
                <img
                  src={darkMode ? lightIconPath : darkIconPath}
                  onMouseOver={() =>
                    darkMode
                      ? setLightIconPath("images/icons/light-mode-hover.svg")
                      : setDarkIconPath("images/icons/dark-mode-hover.svg")
                  }
                  onMouseLeave={() =>
                    darkMode
                      ? setLightIconPath("images/icons/light-mode.svg")
                      : setDarkIconPath("images/icons/dark-mode.svg")
                  }
                  onClick={toggleTheme}
                  className="social-logo"
                  alt={darkMode ? "Light mode icon" : "Dark mode icon"}
                />
              </li>

              <li className="nav-item me-2">
                <Link
                  to="https://www.instagram.com/nnhsprogramming/"
                  target="_blank"
                >
                  <img
                    className="social-logo"
                    src="images/icons/instagram.png"
                    alt="Instagram logo"
                  />
                </Link>
              </li>

              <li className="nav-item me-2">
                <Link
                  to="https://www.facebook.com/groups/293459344434857/"
                  target="_blank"
                >
                  <img
                    className="social-logo"
                    src="images/icons/facebook.png"
                    alt="Facebook logo"
                  />
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="https://github.com/NNHS-Programming-Club"
                  target="_blank"
                >
                  <img
                    className="social-logo"
                    src={
                      darkMode
                        ? "images/icons/github-light.png"
                        : "images/icons/github-dark.png"
                    }
                    alt="GitHub logo"
                  />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}
