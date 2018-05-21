import BezierSegment from './BezierSegment'
import { SCALE_FACTOR } from '../../utils/constants'
import { angle, d2 } from '../../utils/helpers'

function getCenter(p1, p2, p3) {
  const a = p2.x - p1.x
  const b = p2.y - p1.y
  const c = p3.x - p1.x
  const d = p3.y - p1.y
  const e = a * (p1.x + p2.x) + b * (p1.y + p2.y)
  const f = c * (p1.x + p3.x) + d * (p1.y + p3.y)
  const g = 2 * (a * (p3.y - p2.y) - b * (p3.x - p2.x))
  return g === 0 ? {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  } : {
    x: (d * e - b * f) / g,
    y: (a * f - c * e) / g
  }
}

function computeAngle(p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x)
}

function orderedAngles(c, p1, p2, p3) {
  const a1 = computeAngle(c, p1)
  const a2 = computeAngle(c, p3)
  const s1 = computeAngle(p1, p2)
  const s2 = computeAngle(p1, p3)
  const fc = 2 * Math.PI
  let initial = a1
  let final = a1
  if ((fc + s2 - s1) % fc > Math.PI) {
    initial = a2
  } else {
    final = a2
  }
  return [ initial, final ]
}

function approximateArc(angle) {
  const f = 4 * Math.tan(angle / 4) / 3
  const p1 = { x: 0, y: 1 }
  const p2 = { x: f, y: 1 }
  const p3 = { x: Math.sin(angle) - f * Math.cos(angle), y: Math.cos(angle) + f * Math.sin(angle) }
  const p4 = rotatePoint({ x: 0, y: 1 }, -angle)
  return [ p1, p2, p3, p4 ]
}

function rotatePoint(pt, angle) {
  const s = Math.sin(angle)
  const c = Math.cos(angle)
  return {
    x: pt.x * c - pt.y * s,
    y: pt.x * s + pt.y * c
  }
}

function isClockwise(p1, p2, p3) {
  const a = {
    x: p3.x - p1.x,
    y: p3.y - p1.y
  }
  const b = {
    x: p2.x - p1.x,
    y: p2.y - p1.y
  }
  const c = a.x * b.y - a.y * b.x
  return c > 0
}

export default class ArcSegment {
  static draw(ctx, points, width, pct=1) {
    if (pct !== 1) {
      const bezierPoints = ArcSegment.getBezierApproximation(points)
      BezierSegment.draw(ctx, bezierPoints, width, pct)
      return
    }

    const center = getCenter(...points)
    const radius = Math.sqrt(d2(points[0], center))
    const angles = orderedAngles(center, points[0], points[1], points[2])
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, angles[0], angles[1], false)
    ctx.lineWidth = width * SCALE_FACTOR
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.arc(points[0].x, points[0].y, width * SCALE_FACTOR / 2, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.closePath()
  }

  static computeDist(points) {
    const center = getCenter(...points)
    const radius = Math.sqrt(d2(points[0], center))
    const cw = isClockwise(...points)
    let a1 = angle(points[0], center, points[1])
    let a2 = angle(points[1], center, points[2])
    if (cw) {
      if (a1 < 0) a1 += 2 * Math.PI
      if (a2 < 0) a2 += 2 * Math.PI
    } else {
      if (a1 > 0) a1 -= 2 * Math.PI
      if (a2 > 0) a2 -= 2 * Math.PI
    }
    const arcAngle = Math.abs(a1 + a2)
    return radius * arcAngle
  }

  static getEndPoint(points, pct) {
    const bezierPoints = ArcSegment.getBezierApproximation(points)
    return BezierSegment.getEndPoint(bezierPoints, pct)
  }

  static getBezierApproximation(points) {
    const center = getCenter(...points)
    const radius = Math.sqrt(d2(points[0], center))
    const cw = isClockwise(...points)

    let a1 = angle(points[0], center, points[1])
    let a2 = angle(points[1], center, points[2])
    if (cw) {
      if (a1 < 0) a1 += 2 * Math.PI
      if (a2 < 0) a2 += 2 * Math.PI
    } else {
      if (a1 > 0) a1 -= 2 * Math.PI
      if (a2 > 0) a2 -= 2 * Math.PI
    }
    const arcAngle = Math.abs(a1 + a2)

    let parts = 1
    while (arcAngle / parts > Math.PI / 2) {
      parts++
    }

    const partAngle = arcAngle / parts
    const unitArcPoints = approximateArc(partAngle)
    const initialAngle = angle({ x: center.x, y: center.y + 1 }, center, points[cw ? 0 : 2])

    let bpoints = []
    for (let i = 0; i < parts; i++) {
      const scaledPts = unitArcPoints.map((pt) => ({
        x: pt.x * radius,
        y: pt.y * radius
      }))
      const rotatedPts = scaledPts.map((pt) => (
        rotatePoint(pt, - initialAngle - i * partAngle)
      ))
      const translatedPts = rotatedPts.map((pt) => ({
        x: pt.x + center.x,
        y: pt.y + center.y
      }))
      bpoints = bpoints.concat(translatedPts)
    }

    if (!cw) {
      bpoints.reverse()
    }

    return bpoints
  }
}
