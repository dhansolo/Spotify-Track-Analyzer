import React from 'react';
import { useHistory } from 'react-router-dom';

const HomePage = () => {

  const history = useHistory();

  const handleClick = () => {
    window.location.href = 'http://localhost:3000/login'
    history.push("www.google.com")
  };

  return (
    <div>
        <h1>Spotify Track Analyzer</h1>
        <button onClick={handleClick}>Start Analysis</button>
    </div>
  );
};

export default HomePage;
