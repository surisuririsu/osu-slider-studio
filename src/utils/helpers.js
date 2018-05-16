export function makeSegments(points) {
  const segments = []
  let j = 0
  while (true) {
    if (j >= points.length - 1) break
    const seg = [points[j++]]
    while (points[j]) {
      seg.push(points[j])
      if (points[j].anchor) break
      j++
    }
    segments.push(seg)
  }
  return segments
}
