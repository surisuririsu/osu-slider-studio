import { SCALE_FACTOR } from '../../utils/constants'

export default class LinearSegment {
  static draw(ctx, points, width) {
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    ctx.lineTo(points[1].x, points[1].y)
    ctx.lineWidth = width * SCALE_FACTOR
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.arc(points[0].x, points[0].y, width * SCALE_FACTOR / 2, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.closePath()
  }
}
