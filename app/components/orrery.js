'use client';
import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

// Planet data for Earth
const planets = [
  {
    name: 'Earth',
    e: 0.0167,
    a: 1.0,
    i: 0.0,
    node: 0.0,
    peri: 102.9,
    M: 100.0,
    epoch: 2451545.0, // J2000.0 reference epoch
    radius: 6371 / 1000, // Earth radius in scaled units (6371 km / 1000)
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

  // Debugging logs for key values
  console.log(`Mean Anomaly (M): ${M}, Time Since Epoch: ${timeSinceEpoch}`);

  const trueAnomaly = solveKeplersEquation(M, e);
  const r = a * (1 - e * e) / (1 + e * Math.cos(trueAnomaly));

  // Debugging log for distance (r)
  console.log(`Distance (r): ${r}`);

  // Apply scale factor to distance
  const scaledR = r * scale;

  // Convert to Cartesian coordinates
  const position = new THREE.Vector3(
    (Math.cos(node) * Math.cos(peri + trueAnomaly) - Math.sin(node) * Math.sin(peri + trueAnomaly) * Math.cos(i)) * scaledR,
    (Math.sin(node) * Math.cos(peri + trueAnomaly) + Math.cos(node) * Math.sin(peri + trueAnomaly) * Math.cos(i)) * scaledR,
    (Math.sin(i) * Math.sin(peri + trueAnomaly)) * scaledR
  );

  // Debugging log for position
  console.log(`Calculated Position: ${position.x}, ${position.y}, ${position.z}`);

  return position;
}

// Orbital Object Component
const OrbitalObject = ({ keplerParams, scale, radius, textureUrl, name, info }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  const speedMultiplier = 1000; // Speed up the orbit

  // Frame-by-frame update for the object's position
  useFrame(() => {
    const currentEpoch = Date.now() / 86400000 * speedMultiplier;
    const updatedPosition = keplerianToCartesian(keplerParams, currentEpoch, scale);

    if (meshRef.current) {
      meshRef.current.position.set(updatedPosition.x, updatedPosition.y, updatedPosition.z);
    }

    // Log the position for debugging
    console.log(`${name} Position: `, updatedPosition);
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
  const scale = 50; // Scale for the orbits

  return (
    <Canvas camera={{ position: [0, 0, 100], fov: 75 }} style={{ width: '100vw', height: '100vh' }}>
      <Stars />
      <OrbitControls />
      <ambientLight intensity={1.0} /> {/* Increased ambient light intensity */}
      <pointLight position={[0, 0, 0]} intensity={10} distance={1000} /> {/* Increased point light intensity */}
      <pointLight position={[50, 50, 50]} intensity={5} /> {/* Additional point light */}
      <pointLight position={[-50, -50, -50]} intensity={5} /> {/* Additional point light */}

      {/* Sun */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial map={new THREE.TextureLoader().load('/sun.png')} color="yellow" />
      </mesh>

      {/* Earth */}
      {planets.map((planet, index) => (
        <OrbitalObject
          key={index}
          keplerParams={planet}
          scale={scale}
          radius={planet.radius}
          textureUrl={`/${planet.name.toLowerCase()}.png`}
          name={planet.name}
          info={`Radius: ${planet.radius} km`}
        />
      ))}

      {/* NEOs */}
      {NEOData.map((neo, index) => (
        <OrbitalObject
          key={index}
          keplerParams={neo}
          scale={scale}
          radius={5} // Increased radius for NEOs
          name={`NEO ${index + 1}`}
          info={`Radius: 0.5 km`}
          textureUrl={'/jupiter.png'} // Use a different texture for NEOs
        />
      ))}
    </Canvas>
  );
};

export default Orrery;