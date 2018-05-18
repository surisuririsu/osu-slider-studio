import Segment from './Segment'

const BORDER_SIZE = 68
const FILL_SIZE = 60
const BORDER_COLOR = 'white'
const FILL_COLOR = '#1da1f2'

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
