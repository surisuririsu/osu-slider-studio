import { SCALE_FACTOR } from '@/utils/constants'
import { d2 } from '@/utils/helpers'

export default class LinearSegment {
  static draw(ctx, points, width, pct = 1) {
    const dx = points[1].x - points[0].x
    const dy = points[1].y - points[0].y

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    ctx.lineTo(points[0].x + dx * pct, points[0].y + dy * pct)
    ctx.lineWidth = width * SCALE_FACTOR
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.arc(
      points[0].x,
      points[0].y,
      (width * SCALE_FACTOR) / 2,
      0,
      2 * Math.PI,
      false
    )
    ctx.fill()
    ctx.closePath()
  }

  static computeDist(points) {
    return Math.sqrt(d2(points[1], points[0]))
  }

  static getEndPoint(points, pct) {
    const dx = points[1].x - points[0].x
    const dy = points[1].y - points[0].y
    return {
      x: points[0].x + dx * pct,
      y: points[0].y + dy * pct,
    }
  }

  static getBezierApproximation(points) {
    return points
  }
}
