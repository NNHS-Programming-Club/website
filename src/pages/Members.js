import React from 'react'
import { useState } from 'react';

import './Members.css';

export default function Members() {
  const members = [
    { id: 0, name: "Alan Tao", role: "Captain", bio: "Hello my name is Alan. I'm a sophomore who loves programming and music. I also like to play badminton and upload to my YouTube channel. " },
    { id: 1, name: "Bob", role: "captain", bio: "Bob is a data scientist with a passion for math." },
    { id: 2, name: "Charlie", role: "captain", bio: "Charlie is a musician and a coder." }
  ];

  const [openedId, setOpenedId] = useState(null);

  // Function to open popup
  const open = (id) => {
    setOpenedId(id);
  };

  // Function to close popup
  const close = () => {
    setOpenedId(null);
  };

  return (
    <div>
      <h1>Members</h1>
        <div class="members-container d-flex flex-wrap p-5 align-items-center justify-content-center">
          {members.map((member) => (
            <div className="card member p-2 m-2" style={{minWidth: 150}}>
              <h5 className="card-title">{member.name}</h5>
              <h6 className="card-subtitle text-body-secondary mb-2">{member.role}</h6>
              <a href="#" class="btn btn-primary mt-auto" onClick={() => {open(member.id)}}>Read Bio</a>
            </div>
          ))}

          {(openedId!=null) && (
            <div className="bio-container d-flex align-items-center justify-content-center">
              <div className="card bio">
                <div className="card-header d-flex justify-content-between align-items-center p-3">
                  <h4 className="member-name mb-0">{members[openedId].name}</h4>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => {close()}}></button>
                </div>
                <p className="card-text m-3">{members[openedId].bio}</p>
              </div>
            </div>
          )}
        </div>
    </div>
  )
}
