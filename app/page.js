'use client'
import React from 'react';
import Orrery from './components/orrery';
import Image from 'next/image';

// Example data from the database
const NEOData = [
  {
    e: 0.245,         // Eccentricity
    a: 1.52,          // Semi-major axis (AU)
    i: 5.145,         // Inclination (degrees)
    node: 348.739,    // Longitude of ascending node (degrees)
    peri: 114.207,    // Argument of periapsis (degrees)
    M: 0,             // Mean anomaly (degrees)
    epoch: 2451545.0  // Epoch in MJD (Modified Julian Date)
  },
  {
    e: 0.1,
    a: 2.52,
    i: 7.145,
    node: 348.0,
    peri: 90.0,
    M: 45,
    epoch: 2451545.0
  }
];


function Page() {
  return (
    <div>
      <h1>NEO Orbit Simulation</h1>
      <Orrery NEOData={NEOData} />
    </div>
  );
}

export default Page;
