import './Events.css';
import React from 'react'

export default function Events() {
  return (
    <div className="events">
      <h1 className="mb-3">Events</h1>

      <div className="cardContainer">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">NNHS Step-up Day 2025</h4>
            <ul>
              <li>Date: June 13, 2025</li>
              <li>Time: 12:30 AM - 2:30 PM</li>
              <li>Location: NNHS Cafeteria</li>
            </ul>

            <p className="">Join us for the NNHS Step-up Day 2025, where incoming freshmen can learn about the programming club and meet current members!</p>

            <p><strong>Signatures from rising 9th graders</strong></p>
            <ul>
              <li>Addison</li>
              <li>Zarate</li>
              <li>Jaydon</li>
              <li>Sebastian Sawicki</li>
              <li>Rithvik Lal</li>
              <li>Yakov Bogorad</li>
              <li>Kelly Mongkhonlertsirikul</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}