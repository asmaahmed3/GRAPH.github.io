import React, { useEffect, useState } from "react";
function SkillXPGraph() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    const userId = parseInt(decoded.userId || decoded.sub);
    console.log("User ID:", userId);

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
              transactions(where: { type: { _like: "skill_%" } }) {
                type
                amount
              }
            }
          }
        `
      })
    })
      .then(res => res.json())
      .then(resData => {
        const transactions = resData.data.user[0].transactions;
        const grouped = {};
        transactions.forEach(tx => {
          const skill = tx.type.replace("skill_", "");
          grouped[skill] = (grouped[skill] || 0) + tx.amount;
        });
        setData(grouped);
      });
  }, []);

  if (!data) return <p>Loading skill XP...</p>;

  const skills = Object.keys(data);
  const maxXP = Math.max(...Object.values(data));
  const chartHeight = 200;
  const barWidth = 40;
  const gap = 20;
  const totalWidth = skills.length * (barWidth + gap);

  return (
    <div className="skill-graph-container">
      <h2>Skill XP Earned</h2>
      <svg
        viewBox={`0 0 ${totalWidth} ${chartHeight + 40}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "auto" }}
      >
        {skills.map((skill, i) => {
          const height = (data[skill] / maxXP) * chartHeight;
          const x = i * (barWidth + gap);
          return (
            <g key={i} transform={`translate(${x}, 0)`}>
              <rect
                x={0}
                y={chartHeight - height}
                width={barWidth}
                height={height}
                fill="#e2cbe3ff"
              />
              <text
                x={barWidth / 2}
                y={chartHeight + 15}
                textAnchor="middle"
                fontSize="12"
                fill="#fdf9fdff"
              >
                {skill}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}


export default SkillXPGraph;