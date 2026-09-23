function point(radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return [50 + radius * Math.cos(radians), 50 + radius * Math.sin(radians)];
}

// Percentage coordinates align visible sectors and pointer targets at every size.
export function getVisual360Sector(index: number) {
  const angle = -90 + index * 72;
  const start = angle - 36;
  const end = angle + 36;
  const points = [
    ...Array.from({ length: 25 }, (_, i) => point(48, start + (72 * i) / 24)),
    ...Array.from({ length: 25 }, (_, i) => point(25, end - (72 * i) / 24)),
  ];
  return {
    path: `M ${point(48, start)} A 48 48 0 0 1 ${point(48, end)} L ${point(25, end)} A 25 25 0 0 0 ${point(25, start)} Z`,
    clipPath: `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(",")})`,
    label: point(36.5, angle),
  };
}

export function getVisual360Rotation(previous: number, selectedIndex: number) {
  const target = -selectedIndex * 72;
  const delta = ((((target - previous) % 360) + 540) % 360) - 180;
  return previous + delta;
}
