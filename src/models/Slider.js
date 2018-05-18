import {
  ArcSegment,
  BezierSegment,
  Circle,
  LinearSegment,
  SplineSegment
} from '../elements'
import { SCALE_FACTOR } from '../utils/constants'

const BORDER_SIZE = 68
const FILL_SIZE = 60
const BORDER_COLOR = 'white'
const FILL_COLOR = '#1da1f2'

const SEGMENT_TYPES = {
  arc: ArcSegment,
  bezier: BezierSegment,
  linear: LinearSegment,
  spline: SplineSegment
}

function d2(p1, p2) {
  const dx = Math.abs(p2.x - p1.x)
  const dy = Math.abs(p2.y - p1.y)
  return Math.pow(dx, 2) + Math.pow(dy, 2)
}

function angle(p1, p2, p3) {
  const a = Math.atan2(p1.y - p2.y, p1.x - p2.x)
  const b = Math.atan2(p3.y - p2.y, p3.x - p2.x)
  return Math.abs(a - b)
}

class Segment {
  points = []
  type = 'bezier'

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
    const nearestPoint = this.points.reduce((acc, curr, index) => {
      const dist2 = d2(curr, point)
      return dist2 < acc.dist2 ? { dist2, index } : acc
    }, { dist2: 64, index: null })
    return nearestPoint
  }

  getNearEdge(point) {
    const nearestEdge = this.points.reduce((acc, curr, index) => {
      if (index === 0) return acc
      const p1 = curr
      const p2 = this.points[index - 1]
      const t1 = angle(point, p1, p2)
      const t2 = angle(point, p2, p1)
      if (Math.min(t1, t2) > Math.PI / 2) return acc
      const a = (p2.y - p1.y) * point.x - (p2.x - p1.x) * point.y + p2.x * p1.y - p2.y * p1.x
      const dist = Math.abs(a) / Math.sqrt(d2(p2, p1))
      return dist < acc.dist ? { dist, index } : acc
    }, { dist: 64, index: null })
    return nearestEdge
  }

  pushPoint(point) {
    this.points.push(point)
  }

  popPoint() {
    this.points.pop()
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
    if (length < 2) {
      this.setType('bezier')
    } else if (length === 2) {
      this.setType('linear')
    } else if (this.getType() === 'arc' && length !== 3) {
      this.setType('bezier')
    }
  }

  drawControlPoints(ctx, points) {
    ctx.lineWidth = 1
    ctx.strokeStyle = 'gray'
    ctx.fillStyle = BORDER_COLOR

    points.forEach((point, index) => {
      if (index === 0) return
      const prevPoint = points[index - 1]
      ctx.beginPath()
      ctx.moveTo(prevPoint.x, prevPoint.y)
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
      ctx.closePath()
    })

    points.forEach((point) => {
      ctx.beginPath()
      ctx.rect(point.x - 3, point.y - 3, 6, 6)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
    })
  }

  draw(ctx, width) {
    if (!this.getLength()) return
    const type = SEGMENT_TYPES[this.type]
    const scaledPoints = this.points.map((point) => ({
      x: point.x * SCALE_FACTOR,
      y: point.y * SCALE_FACTOR
    }))
    type.draw(ctx, scaledPoints, width)
    Circle.draw(ctx, scaledPoints[0], width)
    Circle.draw(ctx, scaledPoints[scaledPoints.length - 1], width)
    this.drawControlPoints(ctx, scaledPoints)
  }
}

export default class Slider {
  segments = []

  constructor() {
    this.segments.push(new Segment())
  }

  isEmpty() {
    if (!this.getLength()) return true
    return !this.segments[0].getLength()
  }

  getLength() {
    return this.segments.length
  }

  getLastSegment() {
    return this.segments[this.segments.length - 1]
  }

  setLastSegmentThrough(through) {
    const segment = this.getLastSegment()
    const length = segment.getLength()
    if (length < 3) return
    if (!through) {
      segment.setType('bezier')
    } else if (length === 3) {
      segment.setType('arc')
    } else if (length > 3) {
      segment.setType('spline')
    }
  }

  getNearPoint(point) {
    const nearPoints = this.segments.map(segment => segment.getNearPoint(point))
    const nearestPoint = nearPoints.reduce((acc, curr, index) => {
      return curr.dist2 < acc.dist2 ? {
        dist2: curr.dist2,
        segIndex: index,
        ptIndex: curr.index
      } : acc
    }, { dist2: 64, segIndex: null, ptIndex: null })
    return nearestPoint
  }

  getNearEdge(point) {
    const nearEdges = this.segments.map(segment => segment.getNearEdge(point))
    const nearestEdge = nearEdges.reduce((acc, curr, index) => {
      return curr.dist < acc.dist ? {
        dist: curr.dist,
        segIndex: index,
        edgeIndex: curr.index
      } : acc
    }, { dist: 64, segIndex: null, ptIndex: null })
    return nearestEdge
  }

  pushPoint(point) {
    this.getLastSegment().pushPoint(point)
  }

  popPoint(point) {
    this.getLastSegment().popPoint()
  }

  insertPoint(point, segIndex, ptIndex) {
    this.segments[segIndex].insertPoint(point, ptIndex)
  }

  deletePoint(segIndex, ptIndex) {
    this.segments[segIndex].deletePoint(ptIndex)
  }

  movePoint(segIndex, ptIndex, point) {
    this.segments[segIndex].movePoint(ptIndex, point)
  }

  draw(ctx) {
    ctx.fillStyle = BORDER_COLOR
    ctx.strokeStyle = BORDER_COLOR
    this.segments.forEach(segment => segment.draw(ctx, BORDER_SIZE))

    ctx.fillStyle = FILL_COLOR
    ctx.strokeStyle = FILL_COLOR
    this.segments.forEach(segment => segment.draw(ctx, FILL_SIZE))
  }
}
