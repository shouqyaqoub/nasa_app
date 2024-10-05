'use client';
import React from 'react';
import Image from 'next/image';
import Orrery from './components/orrery';

// Example data from the database
const NEOData = [
  {
    e: 0.245,
    a: 1.52,
    i: 0.145,
    node: 0,
    peri: 114.207,
    M: 100,
    epoch: 2451545.0
  },
  {
    e: 0.1,
    a: 2.52,
    i: 0.0,
    node: 348.0,
    peri: 90.0,
    M: 45,
    epoch: 2451545.0
  }
];

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
        <Orrery NEOData={NEOData} />
        <div className="asteroid">
          <Image
            src="/asteroid.png"  // Replace with your actual image path
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
        }
      `}</style>
    </div>
  );
}
