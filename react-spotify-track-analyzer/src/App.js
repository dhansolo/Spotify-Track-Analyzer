import React from 'react';
import './App.css';

function App() {

  const handleClick = () => {
    window.location.href = 'http://localhost:3000/login'
  };

  return (
    <div className="App">
      <header className="App-header">
        <header className="App-header">
          <div>
              <h1>Spotify Track Analyzer</h1>
              <button onClick={handleClick}>Start Analysis</button>
          </div>
        </header>
      </header>
    </div>
  );
}

export default App;
