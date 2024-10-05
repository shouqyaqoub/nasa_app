'use client';
import React from 'react';
import Image from 'next/image';

export default function Page() {
  return (
    <div className="container">
      <header>
        <nav>
          <ul>
            <li><a href="#">Community</a></li>
            <li><a href="#">Chat</a></li>
            <li><a href="#">Simulation</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <h1>Universe At Hand</h1>
        <div className="asteroid">
          <Image
            src="/asteroid.png"  // Replace with the actual asteroid image path
            alt="Asteroid"
            width={150}
            height={150}
          />
        </div>
      </main>

      <style jsx>{`
        body {
          background-color: #000;
          color: #fff;
          font-family: Arial, sans-serif;
        }
        header {
          position: absolute;
          top: 0;
          width: 100%;
        }
        nav ul {
          list-style: none;
          display: flex;
          justify-content: center;
          gap: 50px;
          padding: 20px 0;
        }
        nav ul li a {
          color: white;
          text-decoration: none;
          font-size: 24px;
          transition: color 0.3s;
        }
        nav ul li a:hover {
          color: #f39c12;
        }
        main {
          text-align: center;
          margin-top: 100px;
        }
        h1 {
          font-size: 4em;
          text-shadow: 2px 2px 10px #fff;
          letter-spacing: 5px;
        }
        .asteroid {
          margin: 20px auto;
          animation: float 5s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
