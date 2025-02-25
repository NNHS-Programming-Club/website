import React from 'react'
import { useState } from 'react';

import './Members.css';

export default function Members() {
  const members = [
    { id: 0, name: "Mr. Peloquin", role: "Advisor", bio: "Hello! Hello! I'm the faculty advisor for the NNHS Programming Club. I think that programming is such a useful tool, and I love the empowerment that people feel when they realize how they can use it to solve problems. My favorite language is Python, but I also like HTML because it appeals to my creative side. Although I don't currently teach any of the programming classes at North, I have taught Intro to Computer Science and Intro to Programming."},
    { id: 1, name: "Alan Tao", role: "Captain", bio: "Hello my name is Alan. I'm a sophomore who loves programming and music. I also like to play badminton and upload to my YouTube channel. " },
    { id: 2, name: "Alyssa Yasuhara", role: "Member", bio: "I first started programming two years ago, and I fell in love with creating projects and developing innovative IoT projects too! Outside of programming, I enjoy gymnastics, math, violin, reading, and hanging out with my friends in my free time"},
    { id: 3, name: "Anastasia Gordivsky", role: "Active Member", bio: "I am interested in programming because you get to create cool things such as websites and a variety of computer programs, and you also get to make big changes in various industries by creating computer programs! I like how programming club teaches you a lot about computer science and the activities that we do every week! My other hobbies are violin, reading, spending time outdoors, swimming, and biking!" },
    { id: 4, name: "Diya Gadodia", role: "Member", bio: "Hi! I'm Diya and I joined the club because I love programming! We're the best club at north. Other things about me, I love playing tennis, I like to ski, I have an older brother, and my favorite subject is math."},
    { id: 5, name: "Eli Rappa", role: "Active Member", bio: "I am interested in programming because I want to become a roblox game developer. I like that programming club is open to all skill levels of programming. My other hobbies are watching anime, playing video game, and playing the trumpet."},
    { id: 6, name: "Ewan McPhail", role: "Active Member", bio: "I mostly write C++, and do some reverse engineering. Check out my page (https://undisassemble.github.io) or my GitHub (https://github.com/undisassemble). The artwork on the side is done by my sister (who is awesome)." },
    { id: 7, name: "Jason Smith", role: "Active Member", bio: "Hello, my name is Jason. I am a sophomore who likes Guitar and Programming. I primarily program in Python and Web Development Languages, but I am trying to branch out. This is my first year attending this club."},
    { id: 8, name: "Nathan Kessler", role: "Active Member", bio: "Hi, my name is Nathan. I primarily code in rust, but am also able to code in Python, Java, R, SQL, C (++), and HTML/JavaScript. I like theoretical programming, and enjoy creating algorithms. You will often see me doing math or on leetcode during programming club." },
    { id: 9, name: "Raj Kasarle", role: "Active Member", bio: "Hello, my name is Raj. I am a student of the class of 2028, and I've had a great interest in mathematics and science, which is just some of the reasons why I decided to join Programming Club. I've always loved computers ever since I was in elementary school, and I've always wondered how I can create things on a computer. That's when I learned about coding, and ever since I started basic, going more advanced, my knowledge expanded faster than a cheetah could run. My favorite coding language (and most challenging, of course) is C, one of the oldest languages. I am still learning, and I am willing to learn more and help others. My favorite parts of Programming Club are the challenges from short problems we attempt to solve (yes, that's how we practice coding!) The varieties and possibilities in programing are endless, and I think Programming Club is a really insightful club to think about!"},
    { id: 10, name: "Theo Karon", role: "Active Member", bio: "i do dumb stuff with linux, and write dumb scripts for dumb stuff. i hate computers, they don't work except for when they do, which when they do they don't"},
    { id: 11, name: "Veronica Gordivsky", role: "Active Member", bio: "I'm Veronica, and I first started getting into programming in high school. I also enjoy drawing, reading, and snorkeling/scuba diving. I’m also knowledgeable on animals, my favorite being cats, and I have a pet bird (he's a cockatiel). "},
    { id: 12, name: "ZZ Zhang", role: "Member", bio: "Heyo, I'm ZZ. I started doing programming because I wanted to code for robots. I like the programming club because it provides competition opportunities and teaches me more in depth things about programming. My other hobbies are playing the flute, boxing, and watching Studio Ghibli movies."}
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
        <div>
          <img src="images/programmingClub.jpg" className="club-img ps-5 pe-5 pt-3" />
        </div>
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
