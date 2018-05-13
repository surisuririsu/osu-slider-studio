import React from 'react'
import {
  ArcSegment,
  BezierSegment,
  Circle,
  LinearSegment,
  SplineSegment
} from '../elements'
import { SCALE_FACTOR } from '../utils/constants'

const FORM_WIDTH = 260
const CTRL_KEY = 17
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
    this.setState({ mouseDown: true })
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
    if (e.button === LEFT_BUTTON) {
      if (this.state.drawing) {
        this.placePoint(x, y)
      } else if (this.state.dragging) {

      } else if (e.ctrlKey) {
        // Find the nearest segment and insert a point
      } else {
        // If near a segment, select segment
      }
    } else if (e.button === RIGHT_BUTTON) {
      if (this.state.drawing) {
        this.placePoint(x, y)
        this.setState({ drawing: false })
      }
    }
    this.setState({
      mouseDown: false,
      dragging: false
    })
  }

  computeXY(e) {
    const x = Math.floor((e.clientX - FORM_WIDTH) / SCALE_FACTOR / this.props.grid) * this.props.grid
    const y = Math.floor(e.clientY / SCALE_FACTOR / this.props.grid) * this.props.grid
    return { x, y }
  }

  placePoint(x, y, anchor) {
    console.log(`Point: (${x}, ${y})`)
    let type = null
    if (this.state.throughSegment) {
      const segments = this.segment(this.props.points)
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

  segment(points) {
    const segments = []
    let j = 0
    while (true) {
      if (j >= points.length - 1) break
      const seg = [points[j++]]
      while (points[j]) {
        seg.push(points[j])
        if (points[j].anchor) break
        j++
      }
      segments.push(seg)
    }
    return segments
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
    if (!canvas.getContext || points.length === 0 ) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (this.state.drawing) {
      points.push(this.state.pendingPoint)
    }

    const scaledPoints = points.map(pt => Object.assign({}, pt, {
      x: pt.x * SCALE_FACTOR,
      y: pt.y * SCALE_FACTOR
    }))

    const head = scaledPoints[0]
    const tail = scaledPoints[scaledPoints.length - 1]

    const segments = this.segment(scaledPoints)
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
