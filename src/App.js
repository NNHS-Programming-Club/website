import './App.css';
import { React } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

// components
import Navbar from './components/Navbar'

// pages
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Profile from './pages/Profile';
import Members from './pages/Members'
import Events from './pages/Events';
import Error404 from './pages/Error404'
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './contexts/authContext';
import DailyProblem from './pages/DailyProblem';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path = "/" element = {<Home />} />
            <Route path = "/about" element = {<About />} />
            <Route path = "/projects" element = {<Projects />} />
            <Route path = "/members" element = {<Members />} />
            <Route path = "/events" element = {<Events />} />
            <Route path = "/daily-problem" element = {<DailyProblem />} />
            <Route path = "/login" element = {<Login />} />
            <Route path = "/register" element = {<Register />} />
            <Route path = "/profile" element = {<Profile />} />
            <Route path = "/*" element = { <Error404 /> } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
