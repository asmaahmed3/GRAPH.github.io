import React, { useState } from "react";
import "./index.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const token = btoa(`${username}:${password}`);

    const response = await fetch("https://learn.reboot01.com/api/auth/signin", {
      method: "POST",
      headers: {
        Authorization: `Basic ${token}`
      }
    });

    if (response.ok) {
      const jwt = await response.json();
      localStorage.setItem("token", jwt);
      onLogin();
    } else {
      alert("Login failed");
    }
  };

  return (
   <form
  className="login-container"
  onSubmit={(e) => {
    e.preventDefault(); // Prevent page reload
    handleLogin();      // Call your login logic
  }}
>
  <div>
    <h2>Login</h2>
    <input
      onChange={(e) => setUsername(e.target.value)}
      placeholder="username or email"
    />
    <input
      type="password"
      onChange={(e) => setPassword(e.target.value)}
      placeholder="password"
      autoComplete="current-password"
    />
    <button type="submit">Login</button> {/* Submit the form */}
    </div>
    </form>
  );
}

export default Login;
