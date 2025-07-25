import React, { useEffect, useState } from "react";
import "./index.css";

function AuditRatio() {
  const [auditStats, setAuditStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("https://learn.reboot01.com/api/graphql-engine/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        query: `
          query {
            user(limit: 1) {
              auditRatio
              totalUp
              totalDown
              login
            }
          }
        `
      })
    })
      .then(res => res.json())
      .then(data => {
        const user = data.data?.user?.[0];
        if (!user) return;
        setAuditStats(user);
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);

  if (!auditStats) return <p>Loading audit stats...</p>;

  const { auditRatio, totalUp, totalDown } = auditStats;

 return (
  <div className="audit-ratio-box">
    <h2>Audit Ratio</h2>
    <p><strong>Audits Done:</strong> {(totalUp / 1_000_000).toFixed(2)} MB</p>
    <p><strong>Audits Received:</strong> {(totalDown / 1_000_000).toFixed(2)} MB</p>
    <p><strong>Ratio:</strong> {auditRatio.toFixed(1)}</p>

    <svg width="300" height="20">
      <rect
        x="0"
        y="0"
        width={(totalUp / (totalUp + totalDown)) * 300}
        height="20"
        fill="purple"
      />
      <rect
        x={(totalUp / (totalUp + totalDown)) * 300}
        y="0"
        width={(totalDown / (totalUp + totalDown)) * 300}
        height="20"
        fill="grey"
      />
    </svg>

    <p style={{ marginTop: "10px", color: auditRatio < 1 ? "orange" : "white" }}>
      {auditRatio < 1 ? "Make more audits!" : "Great job auditing!"}
    </p>
  </div>
);

}

export default AuditRatio;

