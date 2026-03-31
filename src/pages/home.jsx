import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import "../css/home.css";

export default function Home() {
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-up");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.2 },
    );

    elements.forEach((el) => observer.observe(el));
  }, []);

  return (
    <div className="home-page">
      <Navbar />

      {/* HERO */}
      <section className="hero container">
        <div className="hero-grid">
          <div className="hero-text fade-up">
            <span className="badge">🎓 Smart Learning Platform</span>

            <h1>
              Build, Manage & Take Quizzes
              <span className="highlight"> Effortlessly</span>
            </h1>

            <p>
              A modern platform for teachers and students to create, manage, and
              attempt quizzes with real-time insights.
            </p>

            <div className="hero-actions">
              <a href="/login" className="btn btn-primary">
                Get Started
              </a>
              <a href="#features" className="btn btn-ghost">
                Explore Features
              </a>
            </div>
          </div>

          <div className="hero-visual card fade-up delay-1">
            <h3>📊 Live Quiz Preview</h3>
            <p className="muted">
              Experience real-time quiz interactions and performance tracking.
            </p>

            <div className="mock-box">
              <div className="mock-line"></div>
              <div className="mock-line short"></div>
              <div className="mock-line"></div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats container">
        <div className="stats-grid">
          <div className="stat fade-up">
            <h2>100+</h2>
            <p>Quizzes Created</p>
          </div>
          <div className="stat fade-up delay-1">
            <h2>50+</h2>
            <p>Courses</p>
          </div>
          <div className="stat fade-up delay-2">
            <h2>1000+</h2>
            <p>Students Engaged</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features container" id="features">
        <h2 className="section-title fade-up">Powerful Features</h2>

        <div className="feature-grid">
          <div className="card feature-card fade-up">
            <h3>📚 Course-Based Quizzes</h3>
            <p className="muted">
              Organize quizzes efficiently by subjects and courses.
            </p>
          </div>

          <div className="card feature-card fade-up delay-1">
            <h3>⚡ Instant Results</h3>
            <p className="muted">
              Get immediate feedback and performance analytics.
            </p>
          </div>

          <div className="card feature-card fade-up delay-2">
            <h3>👨‍🏫 Teacher Tools</h3>
            <p className="muted">
              Create quizzes, manage students, and track progress.
            </p>
          </div>

          <div className="card feature-card fade-up delay-3">
            <h3>🎯 Student Experience</h3>
            <p className="muted">Simple and distraction-free quiz interface.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works container">
        <h2 className="section-title fade-up">How It Works</h2>

        <div className="steps">
          <div className="card step fade-up">
            <h3>1. Sign Up</h3>
            <p className="muted">Create an account easily.</p>
          </div>

          <div className="card step fade-up delay-1">
            <h3>2. Join Course</h3>
            <p className="muted">Access relevant quizzes.</p>
          </div>

          <div className="card step fade-up delay-2">
            <h3>3. Attempt Quiz</h3>
            <p className="muted">Complete quizzes seamlessly.</p>
          </div>

          <div className="card step fade-up delay-3">
            <h3>4. Analyze</h3>
            <p className="muted">Track performance instantly.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta container">
        <div className="card cta-box fade-up">
          <h2>Start Learning Smarter Today 🚀</h2>
          <a href="/login" className="btn btn-primary">
            Login / Sign Up
          </a>
        </div>
      </section>
    </div>
  );
}
