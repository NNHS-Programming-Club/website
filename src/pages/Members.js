import React from 'react'
import { useState } from 'react';

import './Members.css';

export default function Members() {
  const members = [
    { id: 0, name: "Alan Tao", role: "Captain", bio: "Hello my name is Alan. I'm a sophomore who loves programming and music. I also like to play badminton and upload to my YouTube channel. " },
    { id: 1, name: "Alyssa Yasuhara", role: "Member", bio: "I like coding in python, and I am currently learning java. I love the community aspect of programming club and learning together with my peers!"},
    { id: 2, name: "Anastasia Gordivsky", role: "Member", bio: "I am interested in programming because you get to create cool things such as websites and a variety of computer programs, and you also get to make big changes in various industries by creating computer programs! I like how programming club teaches you a lot about computer science and the activities that we do every week! My other hobbies are violin, reading, spending time outdoors, swimming, and biking!" },
    { id: 3, name: "Nathan Kessler", role: "Member", bio: "Hi, my name is Nathan. I primarily code in rust, but am also able to code in Python, Java, R, SQL, C (++), and HTML/JavaScript. I like theoretical programming, and enjoy creating algorithms. You will often see me doing math or on leetcode during programming club." },
    { id: 4, name: "Jason Smith", role: "Member", bio: "Hello, my name is Jason. I am a sophomore who likes Guitar and Programming. I primarily program in Python and Web Development Languages, but I am trying to branch out. This is my first year attending this club."}
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
              <a type="button" class="btn btn-primary mt-auto" onClick={() => {open(member.id)}}>Read Bio</a>
            </div>
          ))}

          {(openedId!=null) && (
            <div className="bio-container d-flex align-items-center justify-content-center">
              <div className="card bio d-flex">
                <div className="card-header w-100 d-flex justify-content-between align-items-center p-3">
                  <h4 className="member-name mb-0">{members[openedId].name}</h4>
                  <button type="button" className="btn-close" aria-label="Close" onClick={close}></button>
                </div>
                <div className="d-flex bio-content">
                  <img src={`images/members/${members[openedId].name}.jpg`} className="member-image"/>
                  <p className="card-text m-3">{members[openedId].bio}</p>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  )
}
