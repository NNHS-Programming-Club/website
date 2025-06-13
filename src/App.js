import './App.css';
import { React } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

// components
import Navbar from './components/Navbar'

// pages
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Members from './pages/Members'
import Events from './pages/Events';
import Error404 from './pages/Error404'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path = "/" element = {<Home />} />
          <Route path = "/about" element = {<About />} />
          <Route path = "/projects" element = {<Projects />} />
          <Route path = "/members" element = {<Members />} />
          <Route path = "/events" element = {<Events />} />
          <Route path = "/*" element = { <Error404 /> } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
