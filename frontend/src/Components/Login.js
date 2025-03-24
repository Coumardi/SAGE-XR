import React, { useState } from 'react';
import { apiUrl } from '../config';

const Login = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Send the password to the server for verification
      // The server will handle the hashing and comparison
      console.log('Sending login request with identifier:', identifier);
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      });

      const result = await response.json();
      if (response.status === 200) {
        onLogin(result.user, result.token);
        setLoginError('');
      } else {
        setLoginError(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoginError('Error processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="StarID or Email"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        aria-label="StarID or Email"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label="Password"
      />
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {loginError && <p className="error">{loginError}</p>}
    </div>
  );
};

export default Login;