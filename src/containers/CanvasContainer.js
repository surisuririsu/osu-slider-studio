import React from 'react'
import bezierSpline from '../utils/bezierSpline'
import bezierCurve from '../utils/bezierCurve'
import circularCurve from '../utils/circularCurve'
import lineSegment from '../utils/lineSegment'

const SCALE_FACTOR = 1.5

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
    this.handleMouseDown = this._handleMouseDown.bind(this)
    this.handleMouseMove = this._handleMouseMove.bind(this)
    this.handleMouseUp = this._handleMouseUp.bind(this)
  }

  componentDidMount() {
    window.addEventListener('resize', () => {
      this.setCanvasSize()
      this.drawSlider()
    }, false)
    document.onkeydown = this.handleKeyDown.bind(this)
    document.onkeyup = this.handleKeyUp.bind(this)
    this.setCanvasSize()
    this.drawSlider()
  }

  componentDidUpdate() {
    this.drawSlider()
  }

  render() {
    const gridSize = (this.props.grid || 0) * SCALE_FACTOR;
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

  computeXY(e) {
    const x = Math.floor((e.clientX - 260) / SCALE_FACTOR / this.props.grid) * this.props.grid
    const y = Math.floor(e.clientY / SCALE_FACTOR / this.props.grid) * this.props.grid
    return { x, y }
  }

  handleKeyDown(e) {
    e = e || window.event
    if (e.keyCode === 17) {
      if (this.state.drawing) {
        this.setState({ throughSegment: true })
      }
    }
  }

  handleKeyUp(e) {
    e = e || window.event
    if (e.keyCode === 17) {
      if (this.state.drawing) {
        this.setState({ throughSegment: false })
      }
    }
  }

  _handleMouseDown(e) {
    e.preventDefault()
    if (e.button !== 0) return
    this.setState({ mouseDown: true })
  }

  _handleMouseMove(e) {
    e.preventDefault()
    if (this.state.drawing) {
      const { x, y } = this.computeXY(e)
      this.setState({
        pendingPoint: { x, y }
      })
    }
    if (!this.state.mouseDown) return
    if (!this.state.dragging) this.setState({ dragging: true })
  }

  _handleMouseUp(e) {
    e.preventDefault()
    const { x, y } = this.computeXY(e)
    if (e.button === 0) {
      if (this.state.drawing) {
        this.placePoint(x, y)
      } else if (this.state.dragging) {

      } else if (e.ctrlKey) {
        // Find the nearest segment and insert a point
      } else {
        // If near a segment, select segment
      }
    } else if (e.button === 2) {
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

  drawCircleBorder(ctx, pt) {
    ctx.fillStyle = 'white'

    ctx.beginPath()
    ctx.arc(pt.x, pt.y, 34 * SCALE_FACTOR, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.closePath()
  }

  drawCircleFill(ctx, pt) {
    ctx.fillStyle = '#1da1f2'

    ctx.beginPath()
    ctx.arc(pt.x, pt.y, 30 * SCALE_FACTOR, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.closePath()
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
    if (segment.length == 2) {
      lineSegment(ctx, segment, width)
    } else if (lastPt.type === 'arc') {
      circularCurve(ctx, segment, width)
    } else if (lastPt.type === 'spline') {
      bezierSpline(ctx, segment, width)
    } else {
      bezierCurve(ctx, segment, width)
    }
  }

  drawSlider() {
    const canvas = this.refs.canvas
    let points = this.props.points.slice()
    if (!canvas.getContext || points.length === 0 ) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.state.drawing) {
      points.push(this.state.pendingPoint)
    }

    const scaledPoints = points.map(pt => Object.assign({}, pt, {
      x: pt.x * SCALE_FACTOR,
      y: pt.y * SCALE_FACTOR
    }))

    const head = scaledPoints[0]
    const tail = scaledPoints[scaledPoints.length - 1]

    this.drawCircleBorder(ctx, head)
    this.drawCircleBorder(ctx, tail)

    const segments = this.segment(scaledPoints)
    if (this.state.drawing) {
      const lastSegment = segments[segments.length - 1]
      if (this.state.throughSegment) {
        const lastPt = lastSegment[lastSegment.length - 1]
        lastPt.type = lastSegment.length === 3 ? 'arc' : 'spline'
      }
    }

    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'white'
    segments.forEach(s => this.drawSegment(ctx, s, 68))

    ctx.fillStyle = '#1da1f2'
    ctx.strokeStyle = '#1da1f2'
    segments.forEach(s => this.drawSegment(ctx, s, 60))

    // bezierSpline(ctx, scaledPoints)
    // bezierCurve(ctx, scaledPoints)

    this.drawCircleFill(ctx, head)
    this.drawCircleFill(ctx, tail)

    ctx.lineWidth = 1
    ctx.strokeStyle = 'gray'
    for (let i = 1; i < points.length; i++) {
      const pt = points[i]
      const lastPt = points[i - 1]

      ctx.beginPath()
      ctx.moveTo(lastPt.x * SCALE_FACTOR, lastPt.y * SCALE_FACTOR)
      ctx.lineTo(pt.x * SCALE_FACTOR, pt.y * SCALE_FACTOR)
      ctx.stroke()
      ctx.closePath()
    }

    for (let i = 0; i < points.length; i++) {
      const pt = points[i]
      ctx.fillStyle = pt.anchor ? 'red' : 'white'

      ctx.beginPath()
      ctx.rect((pt.x - 2) * SCALE_FACTOR, (pt.y - 2) * SCALE_FACTOR, 4 * SCALE_FACTOR, 4 * SCALE_FACTOR)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
    }
  }
}
