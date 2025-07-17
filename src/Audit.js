import React, { useEffect, useState } from "react";
import "./index.css";

function Audit({ userId, userLogin }) {
  const [toDoAudits, setToDoAudits] = useState([]);
  const [doneAudits, setDoneAudits] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem("token");

    const query = `
      query ($auditorId: Int!) {
        audit(where: { auditorId: { _eq: $auditorId } }) {
          id
          grade
          createdAt
          group {
            object { name }
            members {
              user { login }
            }
          }
          private {
            code
          }
        }
      }
    `;

    fetch("https://learn.reboot01.com/api/graphql-engine/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        query,
        variables: { auditorId: parseInt(userId, 10) }
      })
    })
      .then(res => res.json())
   .then(data => {
  if (!data || data.errors) {
    console.error("GraphQL error (audits):", data?.errors || "Unknown");
    return;
  }

  const audits = data.data.audit || [];

  // Only TO DO audits
  const toDoAudits = audits
    .filter(a => a.grade === null)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest first

  // Keep only the most recent one
  const mostRecentToDo = toDoAudits[0] ? [toDoAudits[0]] : [];

  const doneAudits = audits.filter(a => a.grade !== null);

  setToDoAudits(mostRecentToDo);
  setDoneAudits(doneAudits);
})


      .catch(err => {
        console.error("Fetch error (audits):", err);
      });
  }, [userId]);

  const renderAudit = (audit, isTodo) => {
    const projectName = audit.group?.object?.name || "Unknown Project";
    const peer = audit.group?.members.find(u => u.user.login !== userLogin);
    const peerLogin = peer?.user?.login || "Unknown";
    const code = audit.private?.code;

    return (
      <div key={audit.id} className={`audit-box ${isTodo ? "todo" : "done"}`}>
        <div className="audit-header">
          <strong>{projectName}</strong> — {peerLogin}
        </div>
        {isTodo && code && (
          <div className="hover-code">
            CODE: <span className="code-text">{code}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="section">
      <h2>Audits</h2>
      <p>Your audits</p>

      {toDoAudits.length > 0 && (
        <>
          <h3>TO DO 🚨</h3>
          {toDoAudits.map(audit => renderAudit(audit, true))}
        </>
      )}

      {toDoAudits.length === 0 && doneAudits.length === 0 && (
        <p>You have no audits assigned.</p>
      )}
    </section>
  );
}

export default Audit;



