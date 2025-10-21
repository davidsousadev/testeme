// src/components/ChallengeCard.jsx
import React from "react";

export default function ChallengeCard({ item }) {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">{item.title}</div>
        <div className="card-diff">{item.difficulty}</div>
      </div>
      <p className="card-desc">{item.description}</p>
      <div className="card-actions">
        <button className="btn-primary">Resolver</button>
        <button className="btn-ghost">Ignorar</button>
      </div>
    </div>
  );
}