import React from 'react'
import bezierSpline from '../utils/bezierSpline'
import bezierCurve from '../utils/bezierCurve'

const SCALE_FACTOR = 1.5

export default class CanvasContainer extends React.Component {
  constructor(props) {
    super(props)
    this.handleMouseDown = this._handleMouseDown.bind(this)
    this.handleMouseMove = this._handleMouseMove.bind(this)
    this.handleMouseUp = this._handleMouseUp.bind(this)
  }

  componentDidMount() {
    window.addEventListener('resize', this.setCanvasSize, false)
    window.addEventListener('contextmenu', e => e.preventDefault())
    this.setCanvasSize()
    this.drawSlider()
  }

  componentDidUpdate() {
    this.drawSlider()
  }

  render() {
    const gridSize = (this.props.grid || 0) * SCALE_FACTOR;
    // const gridSize = 0
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

  _handleMouseDown(e) {
    console.log(e.button)
    e.preventDefault()
    console.log('down')
  }

  _handleMouseMove(e) {
    e.preventDefault()
    console.log('move')
  }

  _handleMouseUp(e) {
    e.preventDefault()
    console.log('up')
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

  drawSlider() {
    const canvas = this.refs.canvas
    if (!canvas.getContext) return
    const ctx = canvas.getContext('2d')

    const points = this.props.points
    const scaledPoints = points.map(pt => Object.assign({}, pt, {
      x: pt.x * SCALE_FACTOR,
      y: pt.y * SCALE_FACTOR
    }))

    const truePoints = points;

    const head = scaledPoints[0]
    const tail = scaledPoints[scaledPoints.length - 1]

    this.drawCircleBorder(ctx, head)
    this.drawCircleBorder(ctx, tail)

    // bezierSpline(ctx, scaledPoints)
    bezierCurve(ctx, scaledPoints)

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

    // ctx.beginPath()
    // ctx.moveTo(points[0].x * SCALE_FACTOR, points[0].y * SCALE_FACTOR)
    // for (let i = 1; i < points.length - 1; i++) {
    //   const pt = points[i]
    //   const lastPt = points[i - 1]
    //   const nextPt = points[i+1]

    //   ctx.bezierCurveTo(lastPt.x * SCALE_FACTOR, lastPt.y * SCALE_FACTOR, pt.x * SCALE_FACTOR, pt.y * SCALE_FACTOR, nextPt.x * SCALE_FACTOR, nextPt.y * SCALE_FACTOR)
    //   ctx.stroke()
    // }
    // ctx.closePath()

  //   let lastPt = {}
  //   points.forEach((pt, i) => {
  //     const anchorPt = pt.x === lastPt.x && pt.y === lastPt.y

  //     if (i !== 0) {
  //       ctx.beginPath()
  //       ctx.moveTo(lastPt.x, lastPt.y)
  //       ctx.lineTo(pt.x, pt.y)
  //       ctx.stroke()
  //       ctx.closePath()
  //     }

  //     ctx.fillStyle = anchorPt ? 'red' : 'white'
  //     ctx.beginPath()
  //     ctx.rect(pt.x - 2, pt.y - 2, 4, 4)
  //     ctx.fill()
  //     ctx.closePath()

  //     lastPt = pt
  //   })


  //   ctx.beginPath()
  //   ctx.moveTo(80, 100)
  //   ctx.lineTo(240, 100)
  //   ctx.stroke()
  }
}
