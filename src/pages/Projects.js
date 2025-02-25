import React from 'react'
import './Projects.css'

export default function Projects() {
  return (
    <div>
      <h1>Projects</h1>
        <div className="d-flex p-4">
          {/* Note: These projects were taken from the old NNHS programming club website */}
          <div className="card project m-2">
            <div className="card-body">
              <h4><a className="card-title" href="https://apps.apple.com/us/app/orbit-a-space-game/id1353390547">Orbit App</a></h4>
              <p className="card-text mt-2">A neat scroller app game to play when className gets boring. We used swift/xcode and even made the music with garage band. It's now relased in the app store!</p>
            </div>
          </div>
          <div className="card project m-2">
            <div className="card-body">
              <h4><a className="card-title" href="https://apps.apple.com/us/app/north-parking/id1439643706">Parking App</a></h4>
              <p>The Newton North Parking Availability App is a great way for students to find parking around the school. Most kids with their license are aware of the chaos and disorder there is around North when trying to find parking. The app is a great way to locate parking easily and quickly.</p>
            </div>
          </div>
          <div className="card project m-2">
            <div className="card-body">
              <h4><a className="card-title" href="https://betinakreiman.github.io/edExCampaign/">Educational Excellence Campaign</a></h4>
              <p>This website is for the Educational Excellence Campaign that advocates for the raising of money for physics materials at the high school of Newton North. Using bootstrap, w3schools, GSAP, and many other prominent libraries of greatness, this website is both visually and mentally pleasing. We incentivize you to constantly reload the page and admire the beautiful animation. Have a wonderful day and do not forget to donate to the Educational Excellence Campaign!</p>
            </div>
          </div>
        </div>
    </div>
  )
}
