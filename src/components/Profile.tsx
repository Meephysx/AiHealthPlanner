import React, { useEffect, useState } from 'react';

export const Progress: React.FC = () => {
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    // example fetch from pedometer API
    navigator.permissions
      .query({ name: 'accelerometer' as PermissionName })
      .then(() => {
        // start listening sensor...
      });
  }, []);

  return (
    <div>
      <h2>Daily Progress</h2>
      <p>Steps: {steps}</p>
    </div>
  );
};