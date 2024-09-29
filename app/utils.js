import * as THREE from 'three';

/**
 * Solves Kepler's equation to get the true anomaly from the mean anomaly.
 */
function solveKeplersEquation(M, e) {
    const tolerance = 1e-6;  // Tolerance for the Newton-Raphson method
    let E = M;  // Initial guess for the eccentric anomaly E
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

/**
 * Converts the Keplerian elements into Cartesian coordinates.
 */
export function keplerianToCartesian(e, a, i, node, peri, M, epoch, currentEpoch) {
    // Convert degrees to radians
    i = THREE.MathUtils.degToRad(i);
    node = THREE.MathUtils.degToRad(node);
    peri = THREE.MathUtils.degToRad(peri);

    // Calculate the mean anomaly based on the current time
    const timeSinceEpoch = currentEpoch - epoch;
    const n = Math.sqrt(1 / (a * a * a)); // Mean motion (rad/day)
    M = THREE.MathUtils.degToRad(M + n * timeSinceEpoch); // Update mean anomaly over time

    // Solve Kepler's equation for true anomaly
    const trueAnomaly = solveKeplersEquation(M, e);

    // Distance from the central body
    const r = a * (1 - e * e) / (1 + e * Math.cos(trueAnomaly));

    // Position in the orbital plane (x', y')
    const xOrbital = r * Math.cos(trueAnomaly);
    const yOrbital = r * Math.sin(trueAnomaly);

    // 3D position after rotating by inclination, argument of periapsis, and longitude of ascending node
    const position = new THREE.Vector3(
        (Math.cos(node) * Math.cos(peri + trueAnomaly) - Math.sin(node) * Math.sin(peri + trueAnomaly) * Math.cos(i)) * r,
        (Math.sin(node) * Math.cos(peri + trueAnomaly) + Math.cos(node) * Math.sin(peri + trueAnomaly) * Math.cos(i)) * r,
        (Math.sin(i) * Math.sin(peri + trueAnomaly)) * r
    );

    return position;
}
