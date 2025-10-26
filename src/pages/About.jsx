import './About.css';
import React from 'react'

export default function About() {
  return (
    <div className="about">
      <h1 className="mb-3">About</h1>
      <div className="logoContainer">
        <img className="logoBig" src="images/logoBig.png" alt="" />
      </div>
      <p>
        Hello! We are Programming Club from Newton North High School. We are dedicated to engage students with computer programming in many different languages such as Python, Java, and C++. We are a open community where we solve programming problems and share our knowledge by giving presentations. We also sometimes do trivia and other fun projects. In the 2024-2025 school year, we competed in the American Computer Science League (<a href="https://www.acsl.org/" target="_blank" rel="noreferrer">ACSL</a>), placing 25th in the Intermediate 5 division out of 161 teams from all across the world! If you want to share your knowledge with us or if you are interested programming, please sign up <a href="https://students.arbitersports.com/programs/24-25-nnhs-clubs-and-activities" target="_blank" rel="noreferrer">here</a>, there is no experience needed and you are guarenteed to learn something new! We meet every Monday after school in room 471.
      </p>

      <p>If you have any questions, contact <a href="https://www.alantao.com" target="_blank" rel="noreferrer">Alan Tao</a> at <a href="mailto:alantaolr@outlook.com">alantaolr@outlook.com</a>.</p>
    </div>
  )
}
