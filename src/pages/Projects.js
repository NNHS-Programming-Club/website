import React from 'react'
import './Projects.css'

export default function Projects() {
  const projects = [
    {name: "Yet Another Packer", author: "Ewan McPhail", link: "https://undisassemble.github.io/yap.html", description: "A free and open source protector for 64-bit Windows PEs."},
    {name: "InjectDumper", author: "Ewan McPhail", link: "https://github.com/undisassemble/InjectDumper", description: "Detects and dumps injected code, and can reconstruct some manually mapped PEs."},
    {name: "PEFixup", author: "Ewan McPhail", link: "https://github.com/undisassemble/PEFixup", description: "Tool to dump running processes and search for OEP signatures."},
    {name: "Orbit App", author: "Betina Kreiman", link: "https://apps.apple.com/us/app/orbit-a-space-game/id1353390547", description: "A neat scroller app game to play when className gets boring. We used swift/xcode and even made the music with garage band. It's now relased in the app store!"},
    {name: "Parking App", author: "Betina Kreiman", link: "https://apps.apple.com/us/app/north-parking/id1439643706", description: "The Newton North Parking Availability App is a great way for students to find parking around the school. Most kids with their license are aware of the chaos and disorder there is around North when trying to find parking. The app is a great way to locate parking easily and quickly."},
    {name: "Educational Excellence Campaign", author: "Betina Kreiman", link: "https://betinakreiman.github.io/edExCampaign/", description: "This website is for the Educational Excellence Campaign that advocates for the raising of money for physics materials at the high school of Newton North. "}
  ];

  return (
    <div>
      <h1 className="mb-4">Projects</h1>
      <div className="wrapper">
        {projects.map((project) => (
          <div className="card project m-2" onClick={() => {window.open(project.link)}}>
            <div className="card-body" href={project.link} target="_blank">
              <h4 className="card-title">{project.name}</h4>
              <h6 className="card-subtitle mb-3 text-muted">{project.author}</h6>
              <p className="mt-2">{project.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
