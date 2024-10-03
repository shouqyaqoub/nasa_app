'use client';
import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

// Increase the scale for distances to make orbits larger (in AU).
 // 1 AU = 100 units in the 3D scene

// Define the radius of the Sun (in scaled units, e.g., Sun radius is ~109 times Earth's radius)
const sunRadius = 0.1; // Scaled Sun radius in comparison to Earth

const orbitScale = 1.5; // Scale to spread out the planets.
const innerPlanetSizeScale = 0.005; // Very small size for inner planets
const outerPlanetSizeScale = 0.01; // Slightly larger for outer planets
const outerOrbitScale = 0.2
const planets = [
  {
    name: 'Mercury',
    e: 0.2056,
    a: 0.387 * orbitScale,  // Orbital distance scaling
    i: 7.0,
    node: 48.3,
    peri: 77.5,
    M: 174.8,
    epoch: 2451545.0,
    radius: 0.07
  },
  {
    name: 'Venus',
    e: 0.0067,
    a: 0.723 * orbitScale, 
    i: 3.4,
    node: 76.7,
    peri: 131.5,
    M: 50.1,
    epoch: 2451545.0,
    radius: 0.07
  },
  {
    name: 'Earth',
    e: 0.0167,
    a: 1.0 * orbitScale,
    i: 0.0,
    node: 0.0,
    peri: 102.9,
    M: 100.0,
    epoch: 2451545.0,
    radius: 0.07
  },
  {
    name: 'Mars',
    e: 0.0934,
    a: 1.524 * orbitScale,
    i: 1.85,
    node: 49.6,
    peri: 336.0,
    M: 355.5,
    epoch: 2451545.0,
    radius: 0.07
  },
  {
    name: 'Jupiter',
    e: 0.0489,
    a: 5.204 * orbitScale, // Large distance scaling
    i: 1.3,
    node: 100.5,
    peri: 14.3,
    M: 34.3,
    epoch: 2451545.0,
    radius: 0.07
  },
  {
    name: 'Saturn',
    e: 0.0565,
    a: 9.582 * orbitScale, // Even farther
    i: 2.49,
    node: 113.7,
    peri: 92.4,
    M: 50.1,
    epoch: 2451545.0,
    radius: 0.07
  },
  {
    name: 'Uranus',
    e: 0.0463,
    a: 19.18 * outerOrbitScale,
    i: 0.77,
    node: 74.0,
    peri: 170.9,
    M: 142.2,
    epoch: 2451545.0,
    radius: 0.07
  },
  {
    name: 'Neptune',
    e: 0.0097,
    a: 30.07 * outerOrbitScale,
    i: 1.77,
    node: 131.8,
    peri: 44.97,
    M: 256.2,
    epoch: 2451545.0,
    radius: 0.07
  }
];

// Kepler's Equation Solver
function solveKeplersEquation(M, e) {
  const tolerance = 1e-6;
  let E = M;
  let delta;

  do {
    delta = E - e * Math.sin(E) - M;
    E = E - delta / (1 - e * Math.cos(E));
  } while (Math.abs(delta) > tolerance);

  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );

  return trueAnomaly;
}

// Convert Keplerian elements to Cartesian coordinates
function keplerianToCartesian(keplerParams, currentEpoch, scale) {
  let { e, a, i, node, peri, M, epoch } = keplerParams;

  // Convert angles to radians
  i = THREE.MathUtils.degToRad(i);
  node = THREE.MathUtils.degToRad(node);
  peri = THREE.MathUtils.degToRad(peri);

  // Calculate time since epoch and update mean anomaly
  const timeSinceEpoch = currentEpoch - epoch;
  const n = Math.sqrt(1 / (a * a * a)); // Mean motion (rad/day)
  M = THREE.MathUtils.degToRad(M) + n * timeSinceEpoch;

  const trueAnomaly = solveKeplersEquation(M, e);
  const r = a * (1 - e * e) / (1 + e * Math.cos(trueAnomaly));

  // Apply scale factor to distance
  const scaledR = r * scale;

  // Convert to Cartesian coordinates
  const position = new THREE.Vector3(
    (Math.cos(node) * Math.cos(peri + trueAnomaly) - Math.sin(node) * Math.sin(peri + trueAnomaly) * Math.cos(i)) * scaledR,
    (Math.sin(node) * Math.cos(peri + trueAnomaly) + Math.cos(node) * Math.sin(peri + trueAnomaly) * Math.cos(i)) * scaledR,
    (Math.sin(i) * Math.sin(peri + trueAnomaly)) * scaledR
  );

  return position;
}


// Orbital Object Component
const OrbitalObject = ({ keplerParams, scale, radius, textureUrl, name, info }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  const speedMultiplier = 1; // Speed up the orbit
  const startTime = useRef(Date.now()); // Save the simulation start time
  const elapsedSimTime = useRef(0); // To track the elapsed simulated time

  // Frame-by-frame update for the object's position
  useFrame(() => {
    // Real elapsed time in milliseconds
    const realElapsedTime = Date.now() - startTime.current;

    // Elapsed simulation time scaled by speedMultiplier (in milliseconds)
    const simulationElapsedTime = realElapsedTime * speedMultiplier;

    // Convert elapsed simulation time to epoch time (days)
    const currentEpoch = (simulationElapsedTime / 86400000); // Epoch in days

    // Convert currentEpoch to simulated date
    const simulatedTime = new Date(Date.now() + currentEpoch * 86400000);

    // Convert the simulated time to a readable date
    const simulationDate = simulatedTime.toUTCString();

    // Update the orbital position based on the current epoch
    const updatedPosition = keplerianToCartesian(keplerParams, currentEpoch, scale);

    if (meshRef.current) {
      meshRef.current.position.set(updatedPosition.x, updatedPosition.y, updatedPosition.z);
    }

    // Log the simulation date and current position
    console.log(`Simulation Date: ${simulationDate}, Position: `, updatedPosition);
  });

  return (
    <>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {hovered && meshRef.current && (
        <Html position={[meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z]}>
          <div className="tooltip">
            <h4>{name}</h4>
            {info && <p>{info}</p>}
          </div>
        </Html>
      )}
    </>
  );
};

// Orrery Simulation Component
const Orrery = ({ NEOData }) => {
  const scale = 100; // Scale for the orbits

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 75 }} style={{ width: '100vw', height: '100vh' }}>
      <Stars />
      <OrbitControls />
      <ambientLight intensity={1.0} />
      <pointLight position={[0, 0, 0]} intensity={10} distance={5000} />
      
      {/* Sun as a small point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[sunRadius, 32, 32]} />
        <meshBasicMaterial color="yellow" />
      </mesh>

      {/* Planets and their orbits */}
      {planets.map((planet, index) => (
        <OrbitalObject
          key={index}
          keplerParams={planet}
          scale={1}
          radius={planet.radius} // Very small size
          textureUrl={`/${planet.name.toLowerCase()}.png`} // Use small dots as textures if needed
          name={planet.name}
          info={`Radius: ${planet.radius} km`}
        />
      ))}

      {NEOData.map((neo, index) => (
        <OrbitalObject
        key={index}
        keplerParams={neo}
        scale={1}
        radius={0.04}
        textureUrl={'/sun.png'}
        name={`NEO ${neo.index + 1}`}
        info={'NEO'}
        />
      ))}
    </Canvas>
  );
};

export default Orrery;