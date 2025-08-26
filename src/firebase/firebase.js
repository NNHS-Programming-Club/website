// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3vMyUkXtsL4HQfU9TW5DOMarWPZO-HEc",
  authDomain: "nnhs-programming-club-website.firebaseapp.com",
  projectId: "nnhs-programming-club-website",
  storageBucket: "nnhs-programming-club-website.firebasestorage.app",
  messagingSenderId: "208452250631",
  appId: "1:208452250631:web:ab794162ec348aa220cea2",
  measurementId: "G-DB212TL0D9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export {app, auth};