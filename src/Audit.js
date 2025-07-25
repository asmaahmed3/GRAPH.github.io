import React, { useEffect, useState } from "react";
import "./index.css";

function Audit({ userId }) {
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
            captain { login }
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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: { auditorId: parseInt(userId, 10) },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.errors) {
          console.error("GraphQL error (audits):", data?.errors || "Unknown");
          return;
        }

        const audits = data.data.audit || [];

      
        const allToDo = audits.filter((a) => a.grade === null);

        allToDo.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        const now = new Date();
        const twoWeeks = 14 * 24 * 60 * 60 * 1000;

        
        const nonExpired = allToDo.find((audit) => {
          const createdAt = new Date(audit.createdAt);
          return now - createdAt <= twoWeeks;
        });

        setToDoAudits(nonExpired ? [nonExpired] : []);
        setDoneAudits(audits.filter((a) => a.grade !== null));
      })
      .catch((err) => {
        console.error("Fetch error (audits):", err);
      });
  }, [userId]);

  const renderAudit = (audit, isTodo) => {
    const projectName = audit.group?.object?.name || "Unknown Project";
    const peerLogin = audit.group?.captain?.login || "Unknown";
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
      <h2>Audit</h2>
       <p><strong>Your audits</strong></p>
      {toDoAudits.length > 0 && (
        <>
          {toDoAudits.map((audit) => renderAudit(audit, true))}
      
        </>
      )}

      {toDoAudits.length === 0 && doneAudits.length === 0 && (
        <p>You have no audits assigned.</p>
      )}
    </section>
  );
}

export default Audit;




