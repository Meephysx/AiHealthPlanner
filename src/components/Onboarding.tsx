import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Onboarding: React.FC = () => {
  const [profile, setProfile] = useState({ age: 0, height: 0, weight: 0, goal: '' });
  const navigate = useNavigate();

  const handleSubmit = () => {
    // save to context or state management
    navigate('/meal-planning', { state: profile });
  };

  return (
    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
      <label>Age: <input type="number" onChange={e => setProfile(p => ({ ...p, age: +e.target.value }))} /></label>
      <label>Height (cm): <input type="number" onChange={e => setProfile(p => ({ ...p, height: +e.target.value }))} /></label>
      <label>Weight (kg): <input type="number" onChange={e => setProfile(p => ({ ...p, weight: +e.target.value }))} /></label>
      <label>Goal: <input type="text" onChange={e => setProfile(p => ({ ...p, goal: e.target.value }))} /></label>
      <button type="submit">Start</button>
    </form>
  );
};
