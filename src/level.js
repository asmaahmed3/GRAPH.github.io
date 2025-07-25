import React, { useEffect, useState } from "react";
import "./index.css";

function Levels() {
  const [xp, setXP] = useState(null);
  const [level, setLevel] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Step 1: Fetch user ID
    fetch("https://learn.reboot01.com/api/graphql-engine/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        query: `
          {
            user {
              id
            }
          }
        `
      })
    })
      .then(res => res.json())
      .then(data => {
        const userId = data.data?.user?.[0]?.id;
        if (!userId) return;

        // Step 2: Fetch total XP
        fetch("https://learn.reboot01.com/api/graphql-engine/v1/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            query: `
              {
                transaction_aggregate(
                  where: {
                    userId: { _eq: ${userId} }
                    type: { _eq: "xp" }
                  }
                ) {
                  aggregate {
                    sum {
                      amount
                    }
                  }
                }
              }
            `
          })
        })
          .then(res => res.json())
          .then(xpData => {
            const totalXP = xpData.data?.transaction_aggregate?.aggregate?.sum?.amount;
            setXP(totalXP || 0);
          });

        // Step 3: Fetch highest level
        fetch("https://learn.reboot01.com/api/graphql-engine/v1/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            query: `
              {
                transaction(
                  limit: 1
                  order_by: { amount: desc }
                  where: {
                    userId: { _eq: ${userId} }
                    type: { _eq: "level" }
                  }
                ) {
                  amount
                }
              }
            `
          })
        })
          .then(res => res.json())
          .then(levelData => {
            const userLevel = levelData.data?.transaction?.[0]?.amount || 0;
            setLevel(userLevel);
          });
      })
      .catch(err => console.error("Error:", err));
  }, []);

  if (xp === null || level === null) return <p>Loading matrices...</p>;

  // Level title based on amount
  let LevelTitle = "Aspiring developer";
  if (level >= 12 && level < 20) LevelTitle = "Beginner developer";
  else if (level >= 20 && level < 33) LevelTitle = "Apprentice developer";
  else if (level >= 33 && level < 42) LevelTitle = "Assistant developer";
  else if (level >= 42 && level < 50) LevelTitle = "Basic developer";
  else if (level >= 50) LevelTitle = "Junior developer";

  return (
    <div className="audit-ratio-box">
      <h2>{LevelTitle}</h2>

      <div className="circle" style={{ width: "100px", height: "100px", borderRadius: "50%", background: "purple", color: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", margin: "0 auto" }}>
        <div style={{ fontSize: "14px" }}>Level</div>
        <div style={{ fontSize: "22px", fontWeight: "bold" }}>{level}</div>
      </div>
    </div>
  );
}

export default Levels;
