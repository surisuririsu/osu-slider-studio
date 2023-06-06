import {
  ArcSegment,
  BezierSegment,
  Circle,
  LinearSegment,
  SplineSegment,
} from './shapes'
import { SCALE_FACTOR } from '@/utils/constants'
import { d2, angle } from '@/utils/helpers'

const SEGMENT_TYPES = {
  arc: ArcSegment,
  bezier: BezierSegment,
  linear: LinearSegment,
  spline: SplineSegment,
}

export default class Segment {
  points = []
  type = 'bezier'

  static split(segment, index) {
    const segment1 = new Segment()
    segment1.points = segment.points.slice(0, index + 1)
    segment1.type = segment.type
    segment1.recomputeType()

    const segment2 = new Segment()
    segment2.points = segment.points.slice(index)
    segment2.type = segment.type
    segment2.recomputeType()

    return [segment1, segment2]
  }

  static join(segment1, segment2) {
    const segment = new Segment()
    segment.points = segment1.points.concat(segment2.points.slice(1))
    segment.recomputeType()
    return segment
  }

  isSecondLastPoint(point) {
    const secondLast = this.points[this.points.length - 2]
    return secondLast.x === point.x && secondLast.y === point.y
  }

  getLength() {
    return this.points.length
  }

  getLastPoint() {
    return this.points[this.points.length - 1]
  }

  getType() {
    return this.type
  }

  setType(type) {
    this.type = type
  }

  getNearPoint(point) {
    const nearestPoint = this.points.reduce(
      (acc, curr, index) => {
        const dist2 = d2(curr, point)
        return dist2 < acc.dist2 ? { dist2, index } : acc
      },
      { dist2: 64, index: null }
    )
    return nearestPoint
  }

  getNearEdge(point) {
    const nearestEdge = this.points.reduce(
      (acc, curr, index) => {
        if (index === 0) return acc
        const p1 = curr
        const p2 = this.points[index - 1]
        const t1 = Math.abs(angle(point, p1, p2))
        const t2 = Math.abs(angle(point, p2, p1))
        if (Math.min(t1, t2) > Math.PI / 2) return acc
        const a =
          (p2.y - p1.y) * point.x -
          (p2.x - p1.x) * point.y +
          p2.x * p1.y -
          p2.y * p1.x
        const dist = Math.abs(a) / Math.sqrt(d2(p2, p1))
        return dist < acc.dist ? { dist, index } : acc
      },
      { dist: 64, index: null }
    )
    return nearestEdge
  }

  pushPoint(point) {
    this.points.push(point)
    this.recomputeType()
  }

  popPoint() {
    this.points.pop()
    this.recomputeType()
  }

  insertPoint(point, index) {
    this.points.splice(index, 0, point)
    this.recomputeType()
  }

  deletePoint(index) {
    this.points.splice(index, 1)
    this.recomputeType()
  }

  movePoint(index, point) {
    this.points[index] = point
  }

  recomputeType() {
    const length = this.getLength()
    const type = this.getType()
    if (length < 2) {
      this.setType('bezier')
    } else if (length === 2) {
      this.setType('linear')
    } else if (type === 'linear' && length > 2) {
      this.setType('bezier')
    } else if (type === 'arc' && length > 3) {
      this.setType('bezier')
    }
  }

  drawControlPoints(ctx) {
    if (!this.getLength()) return
    const scaledPoints = this.points.map((point) => ({
      x: point.x * SCALE_FACTOR,
      y: point.y * SCALE_FACTOR,
    }))

    ctx.lineWidth = 1
    ctx.strokeStyle = 'gray'

    scaledPoints.forEach((point, index) => {
      if (index === 0) return
      const prevPoint = scaledPoints[index - 1]
      ctx.beginPath()
      ctx.moveTo(prevPoint.x, prevPoint.y)
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
      ctx.closePath()
    })

    scaledPoints.forEach((point, index) => {
      ctx.fillStyle = index ? 'white' : 'red'
      ctx.beginPath()
      ctx.rect(point.x - 3, point.y - 3, 6, 6)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
    })
  }

  draw(ctx, width, pct) {
    if (!this.getLength()) return
    const type = SEGMENT_TYPES[this.type]
    const scaledPoints = this.points.map((point) => ({
      x: point.x * SCALE_FACTOR,
      y: point.y * SCALE_FACTOR,
    }))
    type.draw(ctx, scaledPoints, width, pct)
    const endPoint =
      pct === 1
        ? scaledPoints[scaledPoints.length - 1]
        : type.getEndPoint(scaledPoints, pct)
    Circle.draw(ctx, scaledPoints[0], width)
    Circle.draw(ctx, endPoint, width)
  }

  getBezierPoints() {
    return SEGMENT_TYPES[this.type].getBezierApproximation(this.points)
  }

  getDist() {
    if (!this.points.length) return 0
    return SEGMENT_TYPES[this.type].computeDist(this.points)
  }

  getBoundaries() {
    return this.points.reduce(
      (acc, curr) => ({
        maxX: Math.max(acc.maxX, curr.x),
        maxY: Math.max(acc.maxY, curr.y),
        minX: Math.min(acc.minX, curr.x),
        minY: Math.min(acc.minY, curr.y),
      }),
      { maxX: 0, maxY: 0, minX: 512, minY: 384 }
    )
  }
}
