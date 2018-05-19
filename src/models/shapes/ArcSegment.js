import { SCALE_FACTOR } from '../../utils/constants'

function getCenter(m, n, o) {
  const a = n.x - m.x
  const b = n.y - m.y
  const c = o.x - m.x
  const d = o.y - m.y
  const e = a * (m.x + n.x) + b * (m.y + n.y)
  const f = c * (m.x + o.x) + d * (m.y + o.y)
  const g = 2 * (a * (o.y - n.y) - b * (o.x - n.x))
  if (g === 0) return null
  return {
    x: (d * e - b * f) / g,
    y: (a * f - c * e) / g
  }
}

function computeAngle(pt1, pt2) {
  return Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x)
}

export default class ArcSegment {
  static draw(ctx, points, width) {
    let center = getCenter(points[0], points[1], points[2])
    if (!center) {
      center = {
        x: Math.round((points[0].x + points[1].x) / 2),
        y: Math.round((points[0].y + points[1].y) / 2)
      }
    }
    const radius = Math.sqrt(Math.pow(center.x - points[0].x, 2) + Math.pow(center.y - points[0].y, 2))
    const initialAngle = computeAngle(center, points[0])
    const finalAngle = computeAngle(center, points[2])

    const s1 = computeAngle(points[0], points[1])
    const s2 = computeAngle(points[0], points[2])

    const fc = 2 * Math.PI
    let a1 = initialAngle
    let a2 = initialAngle
    if ((fc + s2 - s1) % fc > Math.PI) {
      a1 = finalAngle
    } else {
      a2 = finalAngle
    }

    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, a1, a2, false)
    ctx.lineWidth = width * SCALE_FACTOR
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.arc(points[0].x, points[0].y, width * SCALE_FACTOR / 2, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.closePath()
  }

  static getBezierApproximation(points) {
    return points
  }
}
