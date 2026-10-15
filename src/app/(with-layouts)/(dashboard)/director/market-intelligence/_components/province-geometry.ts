// Ray casting in geographic coordinates; boundary points belong to the province.
function locateInRing(point: [number, number], ring: number[][]): -1 | 0 | 1 {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[j];
    const [bx, by] = ring[i];
    const cross = (x - ax) * (by - ay) - (y - ay) * (bx - ax);
    if (
      Math.abs(cross) <= 1e-10 &&
      x >= Math.min(ax, bx) &&
      x <= Math.max(ax, bx) &&
      y >= Math.min(ay, by) &&
      y <= Math.max(ay, by)
    )
      return 0;
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) {
      inside = !inside;
    }
  }
  return inside ? 1 : -1;
}

export function containsMapPoint(
  geometry: GeoJSON.MultiPolygon,
  point: [number, number],
): boolean {
  return geometry.coordinates.some(([outer, ...holes]) => {
    if (!outer) return false;
    const location = locateInRing(point, outer);
    if (location === -1) return false;
    return !holes.some((hole) => locateInRing(point, hole) === 1);
  });
}
