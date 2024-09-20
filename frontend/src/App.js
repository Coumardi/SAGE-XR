import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch data from the backend
    fetch('http://localhost:5000/')  // Assuming your backend is running on port 5000
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(error => console.error('Error fetching data from backend:', error));
  }, []);

  return (
    <div className="App">
      <h1>React Frontend</h1>
      <p>Message from backend: {message}</p>
    </div>
  );
}

export default App;
