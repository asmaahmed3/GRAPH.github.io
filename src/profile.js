import  { useEffect, useState } from "react";
import "./index.css";
import AuditRatio from "./Auditratio";
import SkillXPGraph from "./skills";
import InProgress from "./inProgress";
import Audit from "./Audit";


function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      console.warn("Token expired");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }
    console.log(JSON.parse(atob(payload)));

    fetch("https://learn.reboot01.com/api/graphql-engine/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        query: `
          query {
            user {
              id
              login
              auditRatio
              totalDown
              totalUp
              lastName
              firstName
              email
              attrs
            }
          }
        `
      })
    })
      .then(res => res.json())
      .then(data => {
        const userData = data.data.user?.[0];
        if (!userData) {
          console.error("User data not found.");
          return;
        }
        setUser(userData);
      })
      .catch(err => {
        console.error("Fetch error:", err);
      });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
 <div className="profile-page">
 <div className="profile-header">
  <h1>Welcome, {user.login}!</h1>
  <button className="logout" onClick={() => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }}>
    Logout
  </button>
 </div>

  <div className="profile-grid">
    <div className="top-left section">
      <h2>User Info</h2>
      <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone:</strong> {user.attrs['Phone']}</p>
    </div>

    <div className="top-right section">
      <Audit userId={user.id} userLogin={user.login} />
    </div>

    <div className="middle section">
      <SkillXPGraph />
    </div>

    <div className="bottom-left section">
      <InProgress />
    </div>

    <div className="bottom-right section">
      <AuditRatio />
    </div>
  </div>
</div>

  );
}

export default Profile;





