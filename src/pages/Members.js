import React from 'react'
import { useState } from 'react';

import './Members.css';

export default function Members() {
  const members = [
    { id: 0, name: "Mr. Peloquin", role: "Advisor", bio: "Hello! Hello! I'm the faculty advisor for the NNHS Programming Club. I think that programming is such a useful tool, and I love the empowerment that people feel when they realize how they can use it to solve problems. My favorite language is Python, but I also like HTML because it appeals to my creative side. Although I don't currently teach any of the programming classes at North, I have taught Intro to Computer Science and Intro to Programming."},
    { id: 1, name: "Alan Tao", role: "Captain", bio: "Hi, I'm Alan. I started programming since 4th grade and I've been participating in contests and doing projects until this day. I became a captain of programming club in my sophomore year because I truly love and enjoy being able to share my knowledge with a group of ambitious students. Organizing events and leading the club has been so rewarding to me. I hope that this club will grow more and more popular in the future. Aside from programming, I like to play badminton and make song covers on my YouTube channel (@alienjaoyt). " },
    { id: 2, name: "Nathan Kessler", role: "Captain", bio: "Hi, my name is Nathan. I primarily code in rust, but am also able to code in Python, Java, R, SQL, C (++), and HTML/JavaScript. I like theoretical programming, and enjoy creating algorithms. You will often see me doing math or on leetcode during programming club." },
    { id: 3, name: "Jason Smith", role: "Captain", bio: "Hello, my name is Jason. I am a sophomore who likes Guitar and Programming. I primarily program in Python and Web Development Languages, but I am trying to branch out. This is my first year attending this club."},
    { id: 4, name: "Alyssa Yasuhara", role: "Member", bio: "I first started programming two years ago, and I fell in love with creating projects and developing innovative IoT projects too! Outside of programming, I enjoy gymnastics, math, violin, reading, and hanging out with my friends in my free time"},
    { id: 5, name: "Anastasia Gordivsky", role: "Active Member", bio: "I am interested in programming because you get to create cool things such as websites and a variety of computer programs, and you also get to make big changes in various industries by creating computer programs! I like how programming club teaches you a lot about computer science and the activities that we do every week! My other hobbies are violin, reading, spending time outdoors, swimming, and biking!" },
    { id: 6, name: "Eli Rappa", role: "Active Member", bio: "I am interested in programming because I want to become a roblox game developer. I like that programming club is open to all skill levels of programming. My other hobbies are watching anime, playing video game, and playing the trumpet."},
    { id: 7, name: "Ewan McPhail", role: "Active Member", bio: "I mostly write C++, and do some reverse engineering. Check out my page (https://undisassemble.github.io) or my GitHub (https://github.com/undisassemble). The artwork on the side is done by my sister (who is awesome)." },
    { id: 8, name: "Matthew Ng", role: "Active Member", bio: "I'm interested in programming because it's super duper fun. I like programming club because we do problems and participate in competitions such as USACO or ACSL. My other hobbies are eating food because it's fun to eat different types of food."},
    { id: 9, name: "Raj Kasarle", role: "Active Member", bio: "Hello, my name is Raj. I am a student of the class of 2028, and I've had a great interest in mathematics and science, which is just some of the reasons why I decided to join Programming Club. I've always loved computers ever since I was in elementary school, and I've always wondered how I can create things on a computer. That's when I learned about coding, and ever since I started basic, going more advanced, my knowledge expanded faster than a cheetah could run. My favorite coding language (and most challenging, of course) is C, one of the oldest languages. I am still learning, and I am willing to learn more and help others. My favorite parts of Programming Club are the challenges from short problems we attempt to solve (yes, that's how we practice coding!) The varieties and possibilities in programing are endless, and I think Programming Club is a really insightful club to think about!"},
    { id: 10, name: "Ranbeer Ummat", role: "Active Member", bio: "I am interested in programming because it allows me to implement problem solving skills to create something unique that could solve a real-world problem or just be entertaining. I enjoy programming club because of the community that shares a passion for coding and collaboration, as well as opportunities for competitions like ACSL and USACO. When I am not coding, I enjoy competitive math, art, chess, and table tennis."},
    { id: 11, name: "Theo Karon", role: "Active Member", bio: "i do dumb stuff with linux, and write dumb scripts for dumb stuff. i hate computers, they don't work except for when they do, which when they do they don't"},
    { id: 12, name: "Veronica Gordivsky", role: "Active Member", bio: "I'm Veronica, and I first started getting into programming in high school. I also enjoy drawing, reading, and snorkeling/scuba diving. I’m also knowledgeable on animals, my favorite being cats, and I have a pet bird (he's a cockatiel). "},
    { id: 13, name: "ZZ Zhang", role: "Member", bio: "Heyo, I'm ZZ. I started doing programming because I wanted to code for robots. I like the programming club because it provides competition opportunities and teaches me more in depth things about programming. My other hobbies are playing the flute, boxing, and watching Studio Ghibli movies."},
    { id: 14, name: "Emelia Aleksanyan", role: "Member", bio: "I do a lot of music, art, writing, and so on. I'm proficient in C, C++, Rust, JS, Java, x86 assembly, and so on."},
    { id: 15, name: "Raymund Thongthipaya", role: "Member", bio: "I like making stuff in general, like programming, CAD, and a little electronics. I joined because I have free will."},
    { id: 16, name: "Yiming Sun", role: "Member", bio: "I like to learn new things and I want to learn more about programming. I like to draw to play games and sport."},
    { id: 17, name: "Heona Liu", role: "Member", bio: "I'm Heona and I enjoy digital art, piano, and badminton. I was introduced to Python in 6th grade, along wtih React.js in 7th grade. During that time, I played around with programming discord bots, and enrolled in basic Java course. Currently I'm learning Java, bits of Javascript, React.js, Python, and C in my Computer Science Class."},
    { id: 18, name: "Yakov Bogorad", role: "Member", bio: "I got into cybersecurity during mid 7th grade and started work with Linux and other operating systems, as well as understanding their unique scripting systems."},
    { id: 19, name: "Andrew Zhuo", role: "Member", bio: "I have joined this club for I wish to learn more about programming and problem solving. The competition problems are most intriguing as well. I enjoy chess, and reading xkcd webcomics as well."},
    { id: 20, name: "Jaydon Chin", role: "Member", bio: "Joined this club because I'm interested in coding and want to learn more about it, and to do it with a friend"},
    { id: 21, name: "Aiden Taube", role: "Member", bio: "I don't that much about programming but the club said that you don't need experience and I want to try new things."},
    { id: 22, name: "Addison Hannan", role: "Member", bio: "I like to skateboard and play games."},
    { id: 23, name: "Stephen Ruan", role: "Member", bio: "I have some prior experience in coding although I am not that good"},
    { id: 24, name: "Adam Kudrolli", role: "Member", bio: "I started coding with scratch in 3rd grade right before the pandemic, and used for a while before i started learning python quite recently."},
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
          <img src="images/programmingClub.jpg" className="club-img ps-5 pe-5 pt-3" alt="all members"/>
        </div>
        <div className="members-container d-flex flex-wrap p-5 align-items-center justify-content-center">
          {members.map((member) => (
            <div key={member.id} className="card member p-2 m-2" style={{minWidth: 150}}>
              <h5 className="card-title">{member.name}</h5>
              <h6 className="card-subtitle text-body-secondary mb-2">{member.role}</h6>
              <button type="button" className="btn btn-primary mt-auto" onClick={() => {open(member.id)}}>Read Bio</button>
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
                  <img src={`images/members/${members[openedId].name}.jpg`} className="member-image" alt="member headshot"/>
                  <p className="card-text m-3">{members[openedId].bio}</p>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  )
}
