import React, { useEffect, useState } from "react";
import "./index.css";

function InProgress() {
    const [inProgress, setInProgress] = useState([]);

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
                        progress(
                            where: { isDone: { _eq: false }, object: { type: { _eq: "project" } } }
                        ) {
                            object {
                                name
                            }
                        }
                    }
                `
            })
        })
            .then(res => res.json())
            .then(data => {
                if (!data || data.errors) {
                    console.error("GraphQL error (progress):", data?.errors || "Unknown");
                    return;
                }

                const names = data.data.progress.map(p => p.object.name);
                setInProgress(names);
            })
            .catch(err => {
                console.error("Fetch error:", err);
            });
    }, []); 

    return (
        <div className="ProjectInProgress">
            {inProgress.length === 0 ? (
                <>
                    <h3 style={{ textAlign: "center" }}>
                        You are currently
                        <div style={{ fontSize: "40px", color: "red" }}>
                            <span>• Inactive</span>
                        </div>
                    </h3>
                    <h3>Start working on new projects !!!</h3>
                </>
            ) : (
                <>
                    <h3 style={{ textAlign: "center" }}>
                        You are currently
                        <div style={{ fontSize: "40px", color: "green" }}>
                            <span>• Active</span>
                        </div>
                    </h3>
                    <h4>You are currently working on:</h4>
                    <ul style={{ listStyleType: "square" }}>
                        {inProgress.map((item, index) => (
                            <li key={index} style={{ fontSize: "20px" }}>{item}</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default InProgress;
