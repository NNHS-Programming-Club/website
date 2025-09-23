import { useEffect, useState } from 'react';
import './Navbar.css'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/authContext';
import { doSignOut } from '../firebase/auth';

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(true);
  const [darkIconPath, setDarkIconPath] = useState("images/icons/dark-mode.svg");
  const [lightIconPath, setLightIconPath] = useState("images/icons/light-mode.svg");
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const { userLoggedIn } = useAuth();
  const navigate = useNavigate()

  useEffect(() => {
    const htmlElement = document.querySelector('html');
    htmlElement.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <img className="logo" src="images/icons/progclublogo.png" alt="Programming club logo"/>
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav flex-column flex-lg-row me-lg-auto align-items-start align-items-lg-center">

              {/*Left Side Links */}
              <li className="nav-item">
                <Link to="/about" className="nav-link">About</Link>
              </li>
              <li className="nav-item">
                <Link to="/members" className="nav-link">Members</Link>
              </li>
              <li className="nav-item">
                <Link to="/projects" className="nav-link">Projects</Link>
              </li>
              <li className="nav-item">
                <Link to="/events" className="nav-link">Events</Link>
              </li>
              <li className="nav-item">
                <Link to="/daily-problem" className="nav-link">Daily Problem</Link>
              </li>
            </ul>
            
            <ul className="navbar-nav horizontal-navbar flex-column flex-lg-row ms-lg-auto align-items-center mt-2 mt-lg-0">
              {/*Right Side Login + Icons */}
              {userLoggedIn ? (
                  <>
                  <li className="nav-item">
                    <Link to="/" className="nav-link"><img className="social-logo" src="images/icons/user.svg" alt="User icon" /></Link>
                  </li>
                  <li className="nav-item">
                    <button onClick={() => { doSignOut().then(() => { navigate('/login') }) }} className="nav-link">Logout</button>
                  </li>
              </>

                )  : (
                
                <>
                  <li className="nav-item me-2">
                    <Link to="/login" className="nav-link">Log In</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/register" className="nav-link">Sign Up</Link>
                  </li>
                </>
              )}

            </ul>
            <ul className="navbar-nav horizontal-navbar flex-column flex-lg-row ms-lg-3 align-items-center mt-2 mt-lg-0">
              <li className = "nav-item ms-3 my-2">
              {!darkMode &&
                <img src={darkIconPath}
                     onMouseOver={() => setDarkIconPath("images/icons/dark-mode-hover.svg")}
                     onMouseLeave={() => setDarkIconPath("images/icons/dark-mode.svg")}
                     onClick={(toggleTheme)}
                     className='ms-auto'
                     alt="Dark mode icon"
                />
              }

              {darkMode &&
                <img src={lightIconPath}
                     onMouseOver={() => setLightIconPath("images/icons/light-mode-hover.svg")}
                     onMouseLeave={() => setLightIconPath("images/icons/light-mode.svg")}
                     onClick={(toggleTheme)}
                     className='ms-auto'
                     alt="Light mode icon"
                />
              }
              </li>
              
              
              <li className="nav-item ms-2 my-2">
                <Link to="https://www.instagram.com/nnhsprogramming/" target="_blank"><img className="social-logo" src="images/icons/instagram.png" alt="Instagram logo"/></Link>
              </li>
              <li className="nav-item ms-2 my-2">
                <Link to="https://www.facebook.com/groups/293459344434857/" target="_blank"><img className="social-logo" src="images/icons/facebook.png" alt="Facebook logo"/></Link>
              </li>
              <li className="nav-item ms-2 me-2 my-2">
                {!darkMode && (
                  <Link to="https://github.com/NNHS-Programming-Club" target="_blank"><img className="social-logo" src="images/icons/github-dark.png" alt="Light GitHub logo"/></Link>
                )}
                {darkMode && (
                  <Link to="https://github.com/NNHS-Programming-Club" target="_blank"><img className="social-logo" src="images/icons/github-light.png" alt="Dark GitHub logo"/></Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  )
}
