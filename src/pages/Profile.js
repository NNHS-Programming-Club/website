import React, { useMemo, useState, useEffect } from 'react';
import { getUserProfile } from '../firebase/auth';
import { auth } from '../firebase/firebase';
import './Profile.css';

const WEEKS_TO_DISPLAY = 12;

let profile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  title: 'Active Member',
  photoUrl: 'images/members/placeholder.png',
  focusAreas: ['USACO', 'Python', 'React'],
  bio: 'I love programming because it\'s cool and challenging!',
  points: 1200,
  highlights: [
    'This is a highlight example.',
    'Another highlight goes here.',
    'hiihihihihi',
    'Showcase your skills and involvement i guess'
  ],
  dailyStreak: 5,
  bestStreak: 12,
  lastSolve: 'Oct 20, 2025',
  completionRate: 68,
  allTimeSolves: 42,
  avgSolvesPerWeek: 3.5,
  solvesLast28: 14
};

const generateMockContributionData = (weeks) => {
  const totalDays = weeks * 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - (totalDays - 1));

  const data = [];

  for (let w = 0; w < weeks; w += 1) {
    const week = [];
    for (let d = 0; d < 7; d += 1) {
      const index = w * 7 + d;
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      const intensity = (Math.sin((index + 2) * 0.6) + 1) / 2;
      let level = 0;
      if (intensity > 0.82) {
        level = 4;
      } else if (intensity > 0.64) {
        level = 3;
      } else if (intensity > 0.46) {
        level = 2;
      } else if (intensity > 0.28) {
        level = 1;
      }

      week.push({
        date,
        level,
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    data.push(week);
  }

  return data;
};

export default function Profile() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        try {
          const profileData = await getUserProfile(auth.currentUser.uid);

          // in the db there isn't a name yet but this is when eventually hopefully there is
          profile.name = profileData.name || auth.currentUser.email;
          profile.email = auth.currentUser.email;

          profile.bio = profileData.bio || "No bio available.";
          profile.points = profileData.points || "None";
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  // TODO: replace mock data with Firestore once it is wired up.
  const contributionWeeks = useMemo(() => generateMockContributionData(WEEKS_TO_DISPLAY), []);
  const flattenedDays = useMemo(() => contributionWeeks.flat(), [contributionWeeks]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page container py-5">
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card profile-card shadow-sm h-100">
            <div className="card-body d-flex flex-column align-items-center text-center">
              <img
                src={profile.photoUrl}
                alt={`${profile.name} profile`}
                className="profile-avatar mb-3"
              />
              <h2 className="card-title mb-1">{profile.name}</h2>
              <p className="text-body-secondary mb-1">{profile.email}</p>
              <p className="text-body-secondary mb-3">{profile.title}</p>

              <div className="profile-points mb-4">
                <span className="profile-points-number">{profile.points}</span>
                <span className="profile-points-label">points</span>
              </div>

              <div className="profile-tags d-flex justify-content-center flex-wrap gap-2 mb-4">
                {profile.focusAreas.map((area) => (
                  <span key={area} className="badge profile-tag">{area}</span>
                ))}
              </div>

              <div className="w-100 mt-auto">
                <div className="profile-stat-row">
                  <span>Daily streak</span>
                  <strong>{profile.dailyStreak} days</strong>
                </div>
                <div className="profile-stat-row">
                  <span>Best streak</span>
                  <strong>{profile.bestStreak} days</strong>
                </div>
                <div className="profile-stat-row">
                  <span>Last solve</span>
                  <strong>{profile.lastSolve}</strong>
                </div>
                <div className="profile-stat-row">
                  <span>Completion</span>
                  <strong>{profile.completionRate}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4">
                <div>
                  <h3 className="card-title mb-1">Daily Problem Activity</h3>
                  <p className="text-body-secondary mb-0">{profile.solvesLast28} solves in the last 4 weeks</p>
                </div>
                <div className="profile-metrics d-flex gap-3 mt-3 mt-md-0">
                  <div className="profile-metric">
                    <h4 className="mb-0">{profile.allTimeSolves}</h4>
                    <small className="text-body-secondary">All-time solves</small>
                  </div>
                  <div className="profile-metric">
                    <h4 className="mb-0">{profile.avgSolvesPerWeek}</h4>
                    <small className="text-body-secondary">Avg solves / week</small>
                  </div>
                </div>
              </div>

              <div className="contribution-grid" role="list">
                {contributionWeeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="week-column" role="listitem">
                    {week.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`contribution-cell level-${day.level}`}
                        title={`${day.label} · ${day.level > 0 ? 'Solved' : 'Missed'}`}
                        aria-label={`${day.label}: ${day.level > 0 ? 'Solved' : 'Missed'}`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="contribution-legend mt-4">
                <span className="legend-label text-body-secondary">Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <span key={level} className={`contribution-cell legend-cell level-${level}`} />
                ))}
                <span className="legend-label text-body-secondary">More</span>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title mb-3">Bio</h3>
              <p className="mb-4">{profile.bio}</p>
              <h4 className="h5 mb-2">Highlights</h4>
              <ul className="profile-highlights mb-0">
                {profile.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}