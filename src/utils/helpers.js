export function d2(p1, p2) {
  const dx = Math.abs(p2.x - p1.x)
  const dy = Math.abs(p2.y - p1.y)
  return Math.pow(dx, 2) + Math.pow(dy, 2)
}

export function angle(p1, p2, p3) {
  const a = Math.atan2(p1.y - p2.y, p1.x - p2.x)
  const b = Math.atan2(p3.y - p2.y, p3.x - p2.x)
  return Math.abs(a - b)
}
