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

  static split(segment, index) {
    const segment1 = new Segment()
    segment1.points = segment.points.slice(0, index + 1)
    segment1.type = segment.type
    segment1.recomputeType()

    const segment2 = new Segment()
    segment2.points = segment.points.slice(index)
    segment2.type = segment.type
    segment2.recomputeType()

    return [ segment1, segment2 ]
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
      y: point.y * SCALE_FACTOR
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
      ctx.fillStyle = index ? BORDER_COLOR : 'red'
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

  getLastPoint() {
    return {
      segIndex: this.getLength() - 1,
      ptIndex: this.getLastSegment().getLength() - 1
    }
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
    if (this.isAnchor(segIndex, ptIndex)) {
      const anchorPair = this.getAnchorPair(segIndex, ptIndex)
      anchorPair.forEach((anchor) => {
        this.segments[anchor.segIndex].movePoint(anchor.ptIndex, point)
      })
    } else {
      this.segments[segIndex].movePoint(ptIndex, point)
    }
  }

  isAnchor(segIndex, ptIndex) {
    const segment = this.segments[segIndex]
    return (
      ptIndex === 0 && segIndex !== 0 ||
      ptIndex === segment.getLength() - 1 && segIndex !== this.getLength() - 1
    )
  }

  getAnchorPair(segIndex, ptIndex) {
    const segment = this.segments[segIndex]
    const pair = [{ segIndex, ptIndex }]
    if (ptIndex === 0 && segIndex !== 0) {
      pair.unshift({
        segIndex: segIndex - 1,
        ptIndex: this.segments[segIndex - 1].getLength() - 1
      })
    } else if (ptIndex === segment.getLength() - 1 && segIndex !== this.getLength() - 1) {
      pair.push({
        segIndex: segIndex + 1,
        ptIndex: 0
      })
    }
    return pair
  }

  setAnchor(segIndex, ptIndex) {
    const newSegments = Segment.split(this.segments[segIndex], ptIndex)
    this.segments.splice(segIndex, 1, ...newSegments)
  }

  resetAnchor(segIndex, ptIndex) {
    const anchorPair = this.getAnchorPair(segIndex, ptIndex)
    const segment = Segment.join(
      this.segments[anchorPair[0].segIndex],
      this.segments[anchorPair[1].segIndex]
    )
    this.segments.splice(anchorPair[0].segIndex, 2, segment)
  }

  draw(ctx) {
    ctx.fillStyle = BORDER_COLOR
    ctx.strokeStyle = BORDER_COLOR
    this.segments.forEach(segment => segment.draw(ctx, BORDER_SIZE))

    ctx.fillStyle = FILL_COLOR
    ctx.strokeStyle = FILL_COLOR
    this.segments.forEach(segment => segment.draw(ctx, FILL_SIZE))

    this.segments.forEach(segment => segment.drawControlPoints(ctx))
  }
}
