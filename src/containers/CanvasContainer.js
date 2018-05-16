import React from 'react'
import {
  ArcSegment,
  BezierSegment,
  Circle,
  LinearSegment,
  SplineSegment
} from '../elements'
import { SCALE_FACTOR } from '../utils/constants'
import { makeSegments } from '../utils/helpers'

const FORM_WIDTH = 260
const CTRL_KEY = 17
const ESC_KEY = 27
const LEFT_BUTTON = 0
const RIGHT_BUTTON = 2
const BORDER_SIZE = 68
const FILL_SIZE = 60
const BORDER_COLOR = 'white'
const FILL_COLOR = '#1da1f2'

export default class CanvasContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      mouseDown: false,
      drawing: true,
      dragging: false,
      dragPointIndex: null,
      pendingPoint: {},
      throughSegment: false
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize, false)
    document.onkeydown = this.handleKeyDown
    document.onkeyup = this.handleKeyUp

    this.setCanvasSize()
    this.drawSlider()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.points.length === 0 && !this.state.drawing) {
      this.setState({ drawing: true })
    }
  }

  componentDidUpdate() {
    this.drawSlider()
  }

  render() {
    const gridSize = (this.props.grid || 0) * SCALE_FACTOR
    return (
      <div ref="container" id="canvas_container">
        <canvas
          id="grid_container"
          ref="canvas"
          style={{backgroundSize: `${gridSize}px ${gridSize}px`}}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          onContextMenu={this.handleMouseDown}
        />
      </div>
    )
  }

  handleResize = () => {
    this.setCanvasSize()
    this.drawSlider()
  }

  handleKeyDown = (e) => {
    e = e || window.event
    if (e.keyCode === CTRL_KEY) {
      if (this.state.drawing) {
        this.setState({ throughSegment: true })
      }
    } else if (e.keyCode === ESC_KEY && this.state.drawing) {
      this.setState({ drawing: false })
    }
  }

  handleKeyUp = (e) => {
    e = e || window.event
    if (e.keyCode === CTRL_KEY) {
      if (this.state.drawing) {
        this.setState({ throughSegment: false })
      }
    }
  }

  handleMouseDown = (e) => {
    e.preventDefault()
    if (e.button !== LEFT_BUTTON) return
    const { x, y } = this.computeXY(e)
    const nearPointIndex = this.pointNear(x, y)
    if (nearPointIndex !== null) {
      this.setState({
        dragPointIndex: nearPointIndex,
        mouseDown: true
      })
    }
  }

  handleMouseMove = (e) => {
    e.preventDefault()
    if (this.state.drawing) {
      const { x, y } = this.computeXY(e)
      this.setState({ pendingPoint: { x, y } })
    }
    if (!this.state.mouseDown) return
    if (!this.state.dragging) this.setState({ dragging: true })
  }

  handleMouseUp = (e) => {
    e.preventDefault()
    const { x, y } = this.computeXY(e)
    const nearPointIndex = this.pointNear(x, y)
    if (e.button === LEFT_BUTTON) {
      if (this.state.drawing) {
        this.placePoint(x, y)
      } else if (this.state.dragging) {

      } else if (e.ctrlKey) {
        const nearEdgeIndex = this.edgeNear(x, y)
        if (nearPointIndex !== null) {
          this.props.onChangePoint(
            { ...this.props.points[nearPointIndex], anchor: true },
            nearPointIndex
          )
        } else if (nearEdgeIndex !== null) {
          const segments = makeSegments(this.props.points)
          const segLengths = segments.map(s => s.length)
          let i = 0
          let j = 0
          while (true) {
            j += segLengths[i++]
            if (j > nearEdgeIndex) break
          }
          const seg = segments[i - 1]
          let segmentType = seg[seg.length - 1].type
          if (seg.length === 2) {
            segmentType = 'arc'
          } else if (!segmentType || segmentType === 'arc') {
            segmentType = 'bezier'
          }
          this.props.onChangePoint({ ...this.props.points[j - 1], type: segmentType }, j - 1)
          this.props.onAddPoint({ x, y }, nearEdgeIndex)
        }
      } else {
        // If near a segment, select segment
      }
    } else if (e.button === RIGHT_BUTTON) {
      if (this.state.drawing) {
        this.placePoint(x, y)
        this.setState({ drawing: false })
      } else if (nearPointIndex !== null) {
        this.props.onDeletePoint(nearPointIndex)
      }
    }
    this.setState({
      mouseDown: false,
      dragging: false
    })
  }

  computeXY(e) {
    const x = Math.round((e.clientX - FORM_WIDTH) / SCALE_FACTOR / this.props.grid) * this.props.grid
    const y = Math.round(e.clientY / SCALE_FACTOR / this.props.grid) * this.props.grid
    return { x, y }
  }

  pointNear(x, y) {
    const points = this.props.points
    if (points.length === 0) return null
    let nearestIndex = -1
    let nearestDist = -1
    for (let i = 0; i < points.length; i++) {
      const dx = Math.abs(points[i].x - x)
      const dy = Math.abs(points[i].y - y)
      const dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
      if (nearestIndex === -1 || dist < nearestDist) {
        nearestIndex = i
        nearestDist = dist
      }
    }
    if (nearestDist > 8) return null
    return nearestIndex
  }

  edgeNear(x, y) {
    const points = this.props.points
    if (points.length < 2) return null
    let minAng = 2 * Math.PI
    let minAngIndex = -1
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1]
      const p2 = points[i]
      const ang = Math.abs(Math.atan2(p1.y - y, p1.x - x) - Math.atan2(p2.y - y, p2.x - x))
      if (ang < Math.PI / 2) continue
      if (ang < minAng) {
        minAng = ang
        minAngIndex = i
      }
    }
    if (minAngIndex === -1) return null
    return minAngIndex
  }

  placePoint(x, y, anchor) {
    console.log(`Point: (${x}, ${y})`)
    let type = null
    const segments = makeSegments(this.props.points)
    if (this.state.throughSegment && segments.length) {
      const lastSegment = segments[segments.length - 1]
      if (lastSegment.length === 2) {
        type = 'arc'
        anchor = true
      } else if (lastSegment.length > 2) {
        type = 'spline'
      }
    }
    this.props.onAddPoint({ x, y, anchor, type })
  }

  setCanvasSize() {
    const canvas = this.refs.canvas
    const container = this.refs.container
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
  }

  drawSegment(ctx, segment, width) {
    const lastPt = segment[segment.length - 1]
    let element = BezierSegment
    if (segment.length == 2) {
      element = LinearSegment
    } else if (lastPt.type === 'arc') {
      element = ArcSegment
    } else if (lastPt.type === 'spline') {
      element = SplineSegment
    }
    element.draw(ctx, segment, width)
  }

  drawControlPoints(ctx, points) {
    ctx.lineWidth = 1
    ctx.strokeStyle = 'gray'

    for (let i = 1; i < points.length; i++) {
      const pt = points[i]
      const lastPt = points[i - 1]

      ctx.beginPath()
      ctx.moveTo(lastPt.x, lastPt.y)
      ctx.lineTo(pt.x, pt.y)
      ctx.stroke()
      ctx.closePath()
    }

    for (let i = 0; i < points.length; i++) {
      const pt = points[i]
      ctx.fillStyle = pt.anchor ? 'red' : BORDER_COLOR

      ctx.beginPath()
      ctx.rect(pt.x - 3, pt.y - 3, 6, 6)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
    }
  }

  drawSlider() {
    const canvas = this.refs.canvas
    let points = this.props.points.slice()
    if (!canvas.getContext) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (points.length === 0) return

    if (this.state.drawing) {
      points.push(this.state.pendingPoint)
    }

    const scaledPoints = points.map(pt => Object.assign({}, pt, {
      x: pt.x * SCALE_FACTOR,
      y: pt.y * SCALE_FACTOR
    }))

    const head = scaledPoints[0]
    const tail = scaledPoints[scaledPoints.length - 1]

    const segments = makeSegments(scaledPoints)
    if (this.state.drawing) {
      const lastSegment = segments[segments.length - 1]
      if (this.state.throughSegment) {
        const lastPt = lastSegment[lastSegment.length - 1]
        lastPt.type = lastSegment.length === 3 ? 'arc' : 'spline'
      }
    }

    ctx.fillStyle = BORDER_COLOR
    ctx.strokeStyle = BORDER_COLOR
    segments.forEach(s => this.drawSegment(ctx, s, BORDER_SIZE))
    Circle.draw(ctx, head, BORDER_SIZE)
    Circle.draw(ctx, tail, BORDER_SIZE)

    ctx.fillStyle = FILL_COLOR
    ctx.strokeStyle = FILL_COLOR
    segments.forEach(s => this.drawSegment(ctx, s, FILL_SIZE))
    Circle.draw(ctx, head, FILL_SIZE)
    Circle.draw(ctx, tail, FILL_SIZE)

    this.drawControlPoints(ctx, scaledPoints)
  }
}
