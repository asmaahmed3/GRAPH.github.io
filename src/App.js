import React, { useState, useEffect } from "react";
import Login from "./login";
import Profile from "./profile";
import "./index.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setLoggedIn(true);
    }
  }, []);

  return (
    <div className="app-container">
      {loggedIn ? <Profile /> : <Login onLogin={() => setLoggedIn(true)} />}
    </div>
  );
}

export default App;


