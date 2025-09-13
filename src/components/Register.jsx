import React, { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'
import { doCreateUserWithEmailAndPassword } from '../firebase/auth'
import "./login.css"

const Register = () => {

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setconfirmPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { userLoggedIn } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!isRegistering) {
      setIsRegistering(true)
      setErrorMessage('') // Clear any previous error messages
      
      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setErrorMessage('Please enter a valid email address')
        setIsRegistering(false)
        return
      }
      
      // Check password length
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long')
        setIsRegistering(false)
        return
      }
      
      // Check if passwords match
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match')
        setIsRegistering(false)
        return
      }
      
      try {
        await doCreateUserWithEmailAndPassword(email, password)
        // Registration successful - user will be redirected
      } catch (error) {
        console.error('Registration error:', error)
        // Handle different types of Firebase auth errors
        let errorMsg = 'An error occurred during registration'
        if (error.code === 'auth/email-already-in-use') {
          errorMsg = 'An account with this email already exists'
        } else if (error.code === 'auth/invalid-email') {
          errorMsg = 'Invalid email address'
        } else if (error.code === 'auth/weak-password') {
          errorMsg = 'Password is too weak. Please choose a stronger password'
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMsg = 'Email/password accounts are not enabled. Please contact support'
        } else if (error.code === 'auth/too-many-requests') {
          errorMsg = 'Too many attempts. Please try again later'
        }
        setErrorMessage(errorMsg)
      } finally {
        setIsRegistering(false)
      }
    }
  }

  return (
    <>
      {userLoggedIn && (<Navigate to={'/'} replace={true} />)}
      <main className="mainlogin">
        <div className="loginCard">
          <div className='loginCardWrapped'>
            <img className='tigerlogo' src="images/icons/plus icon.png" />
          <div className="text-center mb-6">
            <div className="mt-2">
              <h3 className="enterTitle">Create a New Account</h3>
            </div>

          </div>
          <form
            onSubmit={onSubmit}
            className="enterForm"
          >
            <div>
              {/* <label className="text-sm text-gray-600 font-bold">
                Email
              </label> */}
              <input
                placeholder='Email'
                type="email"
                autoComplete='email'
                required
                value={email} onChange={(e) => { setEmail(e.target.value) }}
                className="enterInput"
              />
            </div>

            <div>
              <input
                placeholder='Password'
                disabled={isRegistering}
                type="password"
                autoComplete='new-password'
                required
                value={password} onChange={(e) => { setPassword(e.target.value) }}
                className="enterInput"
              />
            </div>
            {password && 
            <div>
              <input
                placeholder='Confirm Password'
                disabled={isRegistering}
                type="password"
                autoComplete='off'
                required
                value={confirmPassword} onChange={(e) => { setconfirmPassword(e.target.value) }}
                className="enterInput"
              />
            </div>}

            

            {errorMessage && (
              <span className='errMSG'>{errorMessage}</span>
            )}

            <button
            
              type="submit"
              disabled={isRegistering}
              className={`enterSubmit ${email && password && confirmPassword ? 'enterActivated' : 'enterDeactivated'}`}
            >
              {isRegistering ? 'Signing Up...' : 'Sign Up'}
            </button>
            <div className="switchEnter">
              Already have an account? {'   '}
              <Link to={'/login'} className="text-center text-sm hover:underline font-bold">Log In</Link>
            </div>
          </form>
          </div>
        </div>
      </main>
    </>
  )
}

export default Register