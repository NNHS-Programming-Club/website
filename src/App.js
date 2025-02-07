import './App.css';
import { React } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

// components
import Navbar from './components/Navbar'

// pages
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Meetings from './pages/Meetings'
import Members from './pages/Members'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path = "/" element = {<Home />} />
          <Route path = "/about" element = {<About />} />
          <Route path = "/projects" element = {<Projects />} />
          <Route path = "/meetings" element = {<Meetings />} />
          <Route path = "/members" element = {<Members />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
