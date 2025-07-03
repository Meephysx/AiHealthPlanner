import React from 'react';
import { Link } from 'react-router-dom';

export const Navigation: React.FC = () => (
  <nav>
    <Link to="/onboarding">Onboarding</Link> |{' '}
    <Link to="/meal-planning">Meal Planning</Link> |{' '}
    <Link to="/profile">Profile</Link>
  </nav>
);