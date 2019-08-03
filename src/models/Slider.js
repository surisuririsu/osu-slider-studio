import Segment from './Segment'

const BORDER_SIZE = 68
const FILL_SIZE = 60
const BORDER_COLOR = 'white'
const FILL_COLOR = '#1da1f2'

const SLIDER_TYPES = {
  arc: 'P',
  bezier: 'B',
  linear: 'L'
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
    const segment = this.segments[segIndex]
    if (segIndex === this.segments.length - 1) {
      if (ptIndex === 0 && segment.getLength() === 2) return
    } else {
      if (ptIndex === 0 || ptIndex === segment.getLength() - 1) return
    }
    const newSegments = Segment.split(segment, ptIndex)
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

  draw(ctx, tickDist) {
    const fullDist = this.segments.reduce((acc, curr) => (
      acc + curr.getDist()
    ), 0)
    let lSegIndex = this.segments.length - 1
    if (this.segments[lSegIndex].getLength() === 1 && lSegIndex > 0) {
      lSegIndex--
    }
    const rem = fullDist % tickDist
    const lastSeg = this.segments[lSegIndex]
    const lastPct = Math.max((lastSeg.getDist() - rem) / lastSeg.getDist(), 0)

    ctx.fillStyle = BORDER_COLOR
    ctx.strokeStyle = BORDER_COLOR
    this.segments.forEach((segment, i) =>
      segment.draw(ctx, BORDER_SIZE, i === lSegIndex ? lastPct : 1)
    )

    ctx.fillStyle = FILL_COLOR
    ctx.strokeStyle = FILL_COLOR
    this.segments.forEach((segment, i) =>
      segment.draw(ctx, FILL_SIZE, i === lSegIndex ? lastPct : 1)
    )

    this.segments.forEach(segment => segment.drawControlPoints(ctx))
  }

  getMidpoint() {
    const boundaries = this.segments.reduce((acc, curr) => {
      const segBounds = curr.getBoundaries()
      return {
        maxX: Math.max(acc.maxX, segBounds.maxX),
        maxY: Math.max(acc.maxY, segBounds.maxY),
        minX: Math.min(acc.minX, segBounds.minX),
        minY: Math.min(acc.minY, segBounds.minY)
      }
    }, { maxX: 0, maxY: 0, minX: 512, minY: 384 })
    return {
      x: Math.round((boundaries.maxX + boundaries.minX) / 2),
      y: Math.round((boundaries.maxY + boundaries.minY) / 2)
    }
  }

  getFullDist() {
    return this.segments.reduce((acc, curr) => (
      acc + curr.getDist()
    ), 0)
  }

  getOsuCode(tickDist) {
    if (this.getLength() < 1 || this.segments[0].getLength() < 2) return ''

    const midpoint = this.getMidpoint()
    let dX = 256 - midpoint.x
    let dY = 192 - midpoint.y

    const headX = this.segments[0].points[0].x
    if (headX + dX < 0) {
      dX -= headX + dX
    } else if (headX + dX > 512) {
      dX -= headX + dX - 512
    }
    const headY = this.segments[0].points[0].y
    if (headY + dY < 0) {
      dY -= headY + dY
    } else if (headY + dY > 512) {
      dY -= headY + dY - 512
    }

    let allPoints
    let sliderType = this.segments[0].getType()
    if (this.getLength() === 1 && sliderType !== 'spline') {
      allPoints = this.segments[0].points
    } else {
      sliderType = 'bezier'
      allPoints = this.segments.reduce((acc, curr) => (
        acc.concat(curr.getBezierPoints())
      ), [])
    }

    allPoints = allPoints.map(p => ({
      x: Math.round(p.x + dX),
      y: Math.round(p.y + dY)
    }))

    const fullDist = this.getFullDist()
    let lSegIndex = this.segments.length - 1
    if (this.segments[lSegIndex].getLength() === 1 && lSegIndex > 0) {
      lSegIndex--
    }
    const rem = fullDist % tickDist

    let codeLine = ''
    codeLine += `${allPoints[0].x},${allPoints[0].y}`
    codeLine += `,0,2,0,${SLIDER_TYPES[sliderType]}|`
    codeLine += allPoints.slice(1).map(p => `${p.x}:${p.y}`).join('|')
    codeLine += `,1,${fullDist - rem}`

    return codeLine
  }
}
