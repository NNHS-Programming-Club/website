import React, { useState, useEffect } from 'react';
import './Leaderboard.css';
import { getLeaderboard } from '../api/judge-api';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';

export default function Leaderboard() {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);

  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLoggedIn) return;

    let cancelled = false;
    setError(null);
    getLeaderboard()
      .then(result => {
        if (!cancelled) setEntries(result);
      })
      .catch(error => {
        console.error('Error fetching leaderboard:', error);
        if (!cancelled) setError(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [userLoggedIn]);

  let content;
  if (!userLoggedIn) {
    content = (
      <div>
        <p>You must be logged in to see the leaderboard.</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  } else if (error) {
    content = <p>Sorry, we couldn't load the leaderboard: {error}</p>;
  } else if (!entries) {
    content = <p>Loading...</p>;
  } else if (entries.length === 0) {
    content = <p>No one has scored yet. Solve the Daily Problem to be the first!</p>;
  } else {
    content = (
      <table className="table leaderboard-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col" className="text-end">Points</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{entry.name}</td>
              <td className="text-end">{entry.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="leaderboard container">
      <h1>Leaderboard</h1>
      <p className="leaderboard-hint">
        One point for every test case passed, counting your best submission on each Daily Problem.
      </p>
      {content}
    </div>
  );
}
