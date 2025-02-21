import './Home.css'
import React from 'react'
import { useState, useEffect, useRef } from "react";

const uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Home() {
  const [prgmtitle, setPrgmTitle] = useState("Programming");
  const [clubtitle, setClubTitle] = useState("Club");
  const red = "#E48257";
  const green = "#3A6351";
  const [cubes, setCubes] = useState(Array(100).fill({ binary: 0,  }));
  const cubesRef = useRef(cubes);
  useEffect(() => {
    cubesRef.current = cubes;
  }, [cubes]);
  const [numbers] = useState(Array(10).fill(null).map((_, i) => i));

  //cube animation

  const setOneCube = (i, newvars) => {
    setCubes(prev => {
      let newCubes = [...prev]
      newCubes[i] = { binary: newvars.binary != null ? newvars.binary : prev[i].binary, border: newvars.border != null ? newvars.border : prev[i].border }

      return newCubes;
    })
  }

  const removeHighlight = (i) => {
    setOneCube(i, { binary: null, border: "1px solid #F2EDD7" })
  }

  const blinkFound = (elem, i, start, color, n = null) => {
    let data = { binary: null, border: null }
    if (i <= start / 2 && n != null) {

      data.binary = n
    }

    data.border = i % 2 === 0 ? "1px solid #F2EDD7" : `1px solid ${color}`
    setOneCube(elem, data)

    if (i > 0) {
      setTimeout(blinkFound, 100, elem, i - 1, start, color, n)
    }
  }

  const clean = (i, direction, len) => {
    if (cubesRef.current[i] != null) {
      if (cubesRef.current[i].binary === 1) {
        setOneCube(i, { binary: null, border: ("1px solid" + green) })
        setTimeout(removeHighlight, 50, i)
      }
      else {
        blinkFound(i, 5, 5, green, 1)
      }
    }

    if (i + direction !== cubes.length && i + direction !== 0 && len - 1 > 0) {
      setTimeout(clean, 50, i + direction, direction, len - 1)
    }
  }

  const remove = (elem) => {
    blinkFound(elem, 6, 6, red, 0)
  }

  const randomFunctions = () => {
    const stat = Math.random() * 100

    if (stat < 30) {
      const start = Math.floor(Math.random() * 99)
      const length = Math.floor(Math.random() * 70 + 20)
      const dir = Math.random() > 0.5 ? 1 : -1

      clean(start, dir, length)
    }

    for (let i = 0; i < Math.floor(Math.random() * 15 + 1); i++) {

      const c = Math.floor(Math.random() * 100) // Random one of the objects

      if (cubesRef.current[c].binary === 1) {
        remove(c)
      }
    }

    setTimeout(randomFunctions, 1000)
  }

  function RandomTitle(i, max, spins, final, title, method) {
    let current = ""
    for (let n = 0; n < max - 1; n++) {
      if (n < i && spins <= 0) {
        current += final[n]
      } else {
        const randint = Math.ceil(Math.random() * 26) - 1
        current += uppercaseLetters[randint]
      }
    }

    method(current)

    if (i + 1 < max) {
      setTimeout(RandomTitle, 10, spins <= 0 ? i + 1 / 6 : i, max, spins - 1, final, title, method)
    }
  }

  useEffect(() => {
    cubesRef.current = cubes;

    randomFunctions()
    // clean(2, 1, 1590)
    RandomTitle(0, 12, 0, "Programming".split(""), prgmtitle, setPrgmTitle);
    RandomTitle(0, 5, 11 * 6, "Club".split(""), clubtitle, setClubTitle);
  }, []);

  return (
    <div className="home">
      <div id="first">
        <div className="introtext">
          <div className="intro">
            <div id="credit">
              <p className="hosted">Hosted By</p>
              <img src="images/tiger2.png" id="tigerimg" alt="" />
              <p className="hosted">Newton North</p>
            </div>
            <h1 className="title" id="title">
              <span id="firsttitle">{prgmtitle}</span>
              {' '}
              <span id="secondtitle">{clubtitle}</span>
            </h1>
            <p id="minititle">Teaching ambitious students to code in various languages.</p>
          </div>
          <div id="infoborder">
            <div id="info">
              <div id="numbers">
                {numbers.map((n, i) => (
                  <div className='num' key={i}>
                    <p className="numtext">{n}</p>
                  </div>
                ))}
              </div>
              <div id="divider"></div>
              <div id="lines">

                <div id="line">
                  <p id="code">
                    <span className="boldcode">
                      function
                    </span>
                    {" "}
                    info() {"{"}
                  </p>
                </div>
                <div id="line"><p id="code"></p></div>
                <div id="line" className="i1">
                  <p id="code" >
                    <span className="boldcode">var</span>
                    {" "}
                    RoomNumber = 471
                  </p>
                </div>
                <div id="line" className="i1">
                  <p id="code" >
                    <span className="boldcode">
                      var
                    </span>
                    {" "}
                    Time = 4:00pm - 5:00pm;
                  </p>
                </div>
                <div id="line" className="i1">
                  <p id="code" >
                    <span className="boldcode">
                      var
                    </span>
                    {" "}
                    Day = Monday;
                  </p>
                </div>
                <div id="line"><p id="code"></p></div>
                <div id="line" className="i1">
                  <p id="code">
                    <span className="comment">#Zero experience is required.</span>
                  </p>
                </div>
                <div id="line"><p id="code"></p></div>
                <div id="line" className="i1">
                  <p id="code">
                    <span className="boldcode">return</span><span>;</span>
                  </p>
                </div>
                <div id="line"><p id="code">{"}"}</p></div>
              </div>
            </div>
          </div>
        </div>
        <div id="cubes">
          {cubes.map((c, i) => (
            <div key={i} className='cube' style={{ border: c.border }}>
              <p className="binary">{c.binary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
