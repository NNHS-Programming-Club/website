import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../firebase/auth";
import { auth } from "../firebase/firebase";
import { doSignOut } from '../firebase/auth';
import { useAuth } from '../contexts/authContext';
import ContributionGrid from '../components/Profile/ContributionGrid';
import "./Profile.css";

const WEEKS_TO_DISPLAY = 12;

const defaultProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  title: "Active Member",
  photoUrl: "images/members/placeholder.png",
  focusAreas: ["USACO", "Python", "React"],
  bio: "I love programming because it's cool and challenging!",
  points: 1200,
  dailyStreak: 5,
  bestStreak: 12,
  lastSolve: "Oct 20, 2025",
  completionRate: 68,
  allTimeSolves: 42,
  avgSolvesPerWeek: 3.5,
  solvesLast28: 14,
};

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedBio, setEditedBio] = useState("");

  const navigate = useNavigate();
  const { userLoggedIn, loading: authLoading } = useAuth();

  // Redirect to home if user is not logged in
  useEffect(() => {
    if (!authLoading && !userLoggedIn) {
      navigate('/');
    }
  }, [userLoggedIn, authLoading, navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        try {
          const profileData = await getUserProfile(
            auth.currentUser.uid
          );

          setProfile((prevProfile) => ({
            ...prevProfile,
            name: profileData.name || "Nameless User",
            email: auth.currentUser.email,
            bio: profileData.bio || "Write something about yourself...",
            points: profileData.points || "0",
          }));

          setEditedName(profileData.name || "Nameless User");
          setEditedBio(profileData.bio || "Write something about yourself...");
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  const handleEdit = () => {
    setEditedName(profile.name);
    setEditedBio(profile.bio);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(auth.currentUser.uid, {
        name: editedName,
        bio: editedBio,
      });
      setProfile((prev) => ({
        ...prev,
        name: editedName,
        bio: editedBio,
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (loading || authLoading || !userLoggedIn) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
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
              <h2 className="card-title mb-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) =>
                      setEditedName(e.target.value)
                    }
                    className="form-control"
                  />
                ) : (
                  profile.name
                )}
              </h2>
              <p className="text-body-secondary mb-1">
                {profile.email}
              </p>
              <p className="text-body-secondary mb-3">
                {profile.title}
              </p>
              
              <button onClick={() => { doSignOut().then(() => { navigate('/login') }) }} className="btn btn-secondary logout">
                Logout
              </button>

              <div className="profile-points mb-4">
                <span className="profile-points-number">
                  {profile.points}
                </span>
                <span className="profile-points-label">
                  points
                </span>
              </div>

              <div className="profile-tags d-flex justify-content-center flex-wrap gap-2 mb-4">
                {profile.focusAreas.map((area) => (
                  <span
                    key={area}
                    className="badge profile-tag"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4">
                <div>
                  <h3 className="card-title mb-1">
                    Daily Problem Activity
                  </h3>
                  <p className="text-body-secondary mb-0">
                    {profile.solvesLast28} solves in the
                    last 4 weeks
                  </p>
                </div>
                <div className="profile-metrics d-flex gap-3 mt-3 mt-md-0">
                  <div className="profile-metric">
                    <h4 className="mb-0">
                      {profile.allTimeSolves}
                    </h4>
                    <small className="text-body-secondary">
                      All-time solves
                    </small>
                  </div>
                  <div className="profile-metric">
                    <h4 className="mb-0">
                      {profile.avgSolvesPerWeek}
                    </h4>
                    <small className="text-body-secondary">
                      Avg solves / week
                    </small>
                  </div>
                </div>
              </div>

              <ContributionGrid weeks={WEEKS_TO_DISPLAY} />
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="card-title mb-0">Bio</h3>
                    {!isEditing ? (
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleEdit}
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div>
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={handleSave}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editedBio}
                      onChange={(e) =>
                        setEditedBio(e.target.value)
                      }
                      className="form-control mb-4"
                      rows="4"
                    />
                  ) : (
                    <p className="mb-4">{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h3 className="card-title mb-3">Stats</h3>
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
        </div>
      </div>
    </div>
  );
}
