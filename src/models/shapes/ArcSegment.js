import { SCALE_FACTOR } from '../../utils/constants'
import { angle, d2 } from '../../utils/helpers'

function getCenter(m, n, o) {
  const a = n.x - m.x
  const b = n.y - m.y
  const c = o.x - m.x
  const d = o.y - m.y
  const e = a * (m.x + n.x) + b * (m.y + n.y)
  const f = c * (m.x + o.x) + d * (m.y + o.y)
  const g = 2 * (a * (o.y - n.y) - b * (o.x - n.x))
  return g === 0 ? {
    x: (m.x + n.x) / 2,
    y: (m.y + n.y) / 2
  } : {
    x: (d * e - b * f) / g,
    y: (a * f - c * e) / g
  }
}

function computeAngle(pt1, pt2) {
  return Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x)
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

// function approximateArc(angle) {
//   const p1 = {
//     x: Math.cos(angle / 2),
//     y: Math.sin(angle / 2)
//   }
//   const p2 = {
//     x: (4 - p1.x) / 3,
//     y: (1 - p1.x) * (3 - p1.x) / (3 * p1.y)
//   }
//   const p3 = {
//     x: p2.x,
//     y: -p2.y
//   }
//   const p4 = {
//     x: p1.x,
//     y: -p1.y
//   }
//   return [ p1, p2, p3, p4 ]
// }

function approximateArc2(angle) {
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
  static draw(ctx, points, width) {
    const center = getCenter(points[0], points[1], points[2])
    const radius = Math.sqrt(Math.pow(center.x - points[0].x, 2) + Math.pow(center.y - points[0].y, 2))
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

  static getBezierApproximation(points) {
    const center = getCenter(...points)
    console.log(center)
    // const tPoints = points.map((pt) => ({
    //   x: pt.x - center.x,
    //   y: pt.y - center.y
    // }))
    // console.log(tPoints)
    const radius = Math.sqrt(d2(points[0], center))
    console.log(radius)
    // const radius = Math.sqrt(Math.pow(center.x - points[0].x, 2) + Math.pow(center.y - points[0].y, 2))
    let a1 = angle(points[0], center, points[1])
    let a2 = angle(points[1], center, points[2])
    // const cw = a2 - a1 > 0
    const cw = isClockwise(...points)
    if (cw) {
      if (a1 < 0) a1 += 2 * Math.PI
      if (a2 < 0) a2 += 2 * Math.PI
    } else {
      if (a1 > 0) a1 -= 2 * Math.PI
      if (a2 > 0) a2 -= 2 * Math.PI
    }
    const arcAngle = Math.abs(a1 + a2)
    // if (cw) {
    //   arcAngle = a1 + a2
    // } else {
    //   arcAngle =
    // }
    console.log(a1)
    console.log(a2)
    console.log(cw)
    // if (cw) {
    //   arcAngle = 2 * Math.PI + a1 + a2
    // } else {
    //   arcAngle = 2 * Math.PI - a1 - a2
    // }
    console.log(arcAngle)
    let parts = 1
    while (arcAngle / parts > Math.PI / 2) {
      parts++
    }
    const partAngle = arcAngle / parts
    const unitArcPoints = approximateArc2(partAngle)
    const xp = cw ? points[0] : points[2]
    const initialAngle = angle({ x: center.x, y: center.y + 1 }, center, xp) // Help
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

  static getBezierApproximation2(points) {
    const center = getCenter(points[0], points[1], points[2])
    const radius = Math.sqrt(Math.pow(center.x - points[0].x, 2) + Math.pow(center.y - points[0].y, 2))
    const angles = orderedAngles(center, points[0], points[1], points[2])
    let dT = Math.abs(angles[1] - angles[0])
    let cw = 1
    if (angles[0] > angles[1]) {
      dT = 2 * Math.PI - dT
    } else {
      cw = -1
    }
    let parts = 1
    while (dT / parts > Math.PI / 2) {
      parts++
    }
    const partAngle = dT / parts
    const unitArcPoints = approximateArc2(partAngle)

    const initialAngle = computeAngle(center, points[0])
    let bpoints = []
    for (let i = 0; i < parts; i++) {
      for (let j = 0; j < 4; j++) {
        const arcPoints = unitArcPoints.slice()
        if (cw === 1) {
          arcPoints.reverse()
        }
        const scaledPt = {
          x: arcPoints[j].x * radius,
          y: arcPoints[j].y * radius
        }
        const rotatedPt = rotatePoint(scaledPt, initialAngle + partAngle * i * cw)
        const translatedPt = {
          x: rotatedPt.x + center.x,
          y: rotatedPt.y + center.y
        }
        bpoints.push(translatedPt)
      }
    }
    if (cw === -1) bpoints.reverse()
    return bpoints
  }
}
