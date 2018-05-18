import { SCALE_FACTOR } from '../../utils/constants'

export default class Circle {
  static draw(ctx, point, width) {
    ctx.beginPath()
    ctx.arc(point.x, point.y, width * SCALE_FACTOR / 2, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.closePath()
  }
}
