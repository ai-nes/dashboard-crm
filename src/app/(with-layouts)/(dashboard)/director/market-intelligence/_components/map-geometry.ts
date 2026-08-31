import type { ProvinceFeatureCollection } from "./types";

function getRingArea(ring: GeoJSON.Position[]) {
  return Math.abs(ring.reduce((area, [longitude, latitude], index) => {
    const [nextLongitude, nextLatitude] = ring[(index + 1) % ring.length];
    return area + longitude * nextLatitude - nextLongitude * latitude;
  }, 0) / 2);
}

function isPointInsideRing([longitude, latitude]: [number, number], ring: GeoJSON.Position[]) {
  let inside = false;

  for (let index = 0, previousIndex = ring.length - 1; index < ring.length; previousIndex = index, index += 1) {
    const [currentLongitude, currentLatitude] = ring[index];
    const [previousLongitude, previousLatitude] = ring[previousIndex];
    const crossesLatitude = (currentLatitude > latitude) !== (previousLatitude > latitude);
    const crossingLongitude = ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) / (previousLatitude - currentLatitude) + currentLongitude;

    if (crossesLatitude && longitude < crossingLongitude) inside = !inside;
  }

  return inside;
}

function getLargestOuterRing(
  coordinates: ProvinceFeatureCollection["features"][number]["geometry"]["coordinates"],
) {
  return coordinates
    .map((polygon) => polygon[0])
    .filter((ring): ring is GeoJSON.Position[] => Boolean(ring?.length))
    .sort((left, right) => getRingArea(right) - getRingArea(left))[0];
}

export function getGeometryCenter(coordinates: ProvinceFeatureCollection["features"][number]["geometry"]["coordinates"]): [number, number] {
  const outerRing = getLargestOuterRing(coordinates);

  if (!outerRing) return [0, 0];

  let area = 0;
  let longitudeTotal = 0;
  let latitudeTotal = 0;

  outerRing.forEach(([longitude, latitude], index) => {
    const [nextLongitude, nextLatitude] = outerRing[(index + 1) % outerRing.length];
    const crossProduct = longitude * nextLatitude - nextLongitude * latitude;
    area += crossProduct;
    longitudeTotal += (longitude + nextLongitude) * crossProduct;
    latitudeTotal += (latitude + nextLatitude) * crossProduct;
  });

  if (Math.abs(area) < Number.EPSILON) {
    const [longitudeTotalFallback, latitudeTotalFallback] = outerRing.reduce(
      ([longitudeSum, latitudeSum], [longitude, latitude]) => [longitudeSum + longitude, latitudeSum + latitude],
      [0, 0],
    );
    return [longitudeTotalFallback / outerRing.length, latitudeTotalFallback / outerRing.length];
  }

  const centroid: [number, number] = [longitudeTotal / (3 * area), latitudeTotal / (3 * area)];
  if (isPointInsideRing(centroid, outerRing)) return centroid;

  const longitudes = outerRing.map(([longitude]) => longitude);
  const latitudes = outerRing.map(([, latitude]) => latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const candidates: Array<[number, number]> = [];

  for (let longitudeStep = 1; longitudeStep < 10; longitudeStep += 1) {
    for (let latitudeStep = 1; latitudeStep < 10; latitudeStep += 1) {
      const candidate: [number, number] = [
        minLongitude + ((maxLongitude - minLongitude) * longitudeStep) / 10,
        minLatitude + ((maxLatitude - minLatitude) * latitudeStep) / 10,
      ];
      if (isPointInsideRing(candidate, outerRing)) candidates.push(candidate);
    }
  }

  return candidates.sort(
    (left, right) =>
      (left[0] - centroid[0]) ** 2 + (left[1] - centroid[1]) ** 2 -
      ((right[0] - centroid[0]) ** 2 + (right[1] - centroid[1]) ** 2),
  )[0] ?? (outerRing[0] as [number, number]);
}

export function getDistributedGeometryPoints(
  coordinates: ProvinceFeatureCollection["features"][number]["geometry"]["coordinates"],
  count: number,
): Array<[number, number]> {
  if (count <= 0) return [];

  const outerRing = getLargestOuterRing(coordinates);
  if (!outerRing) return [];

  const longitudes = outerRing.map(([longitude]) => longitude);
  const latitudes = outerRing.map(([, latitude]) => latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const gridSize = Math.max(4, Math.ceil(Math.sqrt(count) * 2));
  const candidates: Array<[number, number]> = [];

  for (let latitudeStep = 0; latitudeStep < gridSize; latitudeStep += 1) {
    for (let longitudeStep = 0; longitudeStep < gridSize; longitudeStep += 1) {
      const candidate: [number, number] = [
        minLongitude + ((maxLongitude - minLongitude) * (longitudeStep + 0.5)) / gridSize,
        minLatitude + ((maxLatitude - minLatitude) * (latitudeStep + 0.5)) / gridSize,
      ];

      if (isPointInsideRing(candidate, outerRing)) candidates.push(candidate);
    }
  }

  if (candidates.length <= count) return candidates;

  return Array.from({ length: count }, (_, index) => {
    const candidateIndex = Math.min(
      candidates.length - 1,
      Math.floor(((index + 0.5) * candidates.length) / count),
    );
    return candidates[candidateIndex];
  });
}
