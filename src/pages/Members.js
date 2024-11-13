import React from 'react'

export default function Members() {
  return (
    <div>
      <h1>Members</h1>
        <div class="container members-container d-flex">
          <div className="card member mr-4">
            <img class="card-img-top member-photo" alt="Picture of John Doe" src="../images/members/placeholder.png" />
            <h5 class="card-title">John Doe</h5>
            <p class="card-text">He/him, Sophomore</p>
            <a href="#" class="btn btn-primary">Read Bio</a>
          </div>
          <div className="card member mr-4">
            <img class="card-img-top member-photo" alt="Picture of John Doe" src="../images/members/placeholder.png" />
            <h5 class="card-title">John Doe</h5>
            <p class="card-text">He/him, Sophomore</p>
            <a href="#" class="btn btn-primary">Read Bio</a>
          </div>
          <div className="card member mr-4">
            <img class="card-img-top member-photo" alt="Picture of John Doe" src="../images/members/placeholder.png" />
            <h5 class="card-title">John Doe</h5>
            <p class="card-text">He/him, Sophomore</p>
            <a href="#" class="btn btn-primary">Read Bio</a>
          </div>
        </div>
    </div>
  )
}
