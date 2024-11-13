import React from 'react'

export default function Meetings() {
  return (
    <div>
        <h1>Meetings</h1>
        <p>All the things we go over during meetings can be found <a href="https://github.com/NNHS-Programming-Club/weekly-meetings">here</a>, in our GitHub repo. </p>
        <div class="content">
          <div class="project">
            <h2>Coin Change</h2>
            <img class="profile" alt="Picture of our solutions" src="../images/lectures/coinchange.png" />
            <p>With our solution found <a href="https://leetcode.com/problems/coin-change/solutions/6008613/solution-for-nnhs-programming-club/">here</a>, we investagated the leetcode problem "coin change" which involves finding the a certain value out of a variaty of coins. We discussed dynamic programming and how it could be used to solve this problem</p>
          </div>
          <div class="project">
            <h2>Big O notation</h2>
            <img class="profile" alt="Graph depicting relation between size of a problem and time to complete" src="../images/lectures/bigOnotation.png" />
            <p>We discussed big O notation, and how it used for a metric for space and time complexity. It describes roughly how much more demanding a program will be as the problem it sovles increases for the worst case senario. Big O notion is a very strong tool we have for communicating the efficiency of our code on a broad scale.</p>
          </div>
          <div class="project">
            <h2>NumPy</h2>
            <img class="profile" alt="NumPy logo" src="../images/lectures/numpy.png" />
            <p>With its documentation found <a href="https://numpy.org/doc/">here</a>, NumPy was the topic of this lecture. NumPy is a python library that allows you to simplify and speed up many different python programs. One of its main uses that we disscussed are NumPy arrays, which allow you to have arrays in multiple demensions with vectorized functions. Overall, using numpy can improve speed of your code, its readability, and allow you to think of problems with mroe abstraction.</p>
          </div>
        </div>
        <footer>
          <div class="d-grid col-6 mx-auto">
            <a class="btn btn-light mb-2 mt-2" href="https://www.instagram.com/nnhsprogramming/?igsh=Yzh2bGVidXJnMm9i#" role="button">Instagram</a>
            <a class="btn btn-light mb-2" href="https://www.facebook.com/groups/293459344434857/" role="button">Facebook</a>
            <a class="btn btn-light mb-2" href="mailto:peloquina@newton.k12.ma.us" role="button">Contact</a>
          </div>
        </footer>
    </div>
  )
}
