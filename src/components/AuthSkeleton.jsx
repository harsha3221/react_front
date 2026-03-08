import React from "react";
import "../css/auth-skeleton.css";

export default function AuthSkeleton() {
  return (
    <div className="auth-skeleton-page">
      <div className="auth-skeleton-card">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-input" />
        <div className="skeleton skeleton-input" />
        <div className="skeleton skeleton-button" />
      </div>
    </div>
  );
}
