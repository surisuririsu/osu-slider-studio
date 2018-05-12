import React from 'react'
import catmullCurve from '../utils/catmullCurve'

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

  drawSlider() {
    const canvas = this.refs.canvas
    if (!canvas.getContext) return
    const ctx = canvas.getContext('2d')

    const points = this.props.points

    const truePoints = points;

    ctx.lineWidth = 4 * SCALE_FACTOR
    ctx.strokeStyle = 'white'
    ctx.fillStyle = '#1da1f2'

    const head = truePoints[0]
    ctx.beginPath()
    ctx.arc(head.x * SCALE_FACTOR, head.y * SCALE_FACTOR, 32 * SCALE_FACTOR, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.stroke()
    ctx.closePath()

    const tail = truePoints[truePoints.length - 1]
    ctx.beginPath()
    ctx.arc(tail.x * SCALE_FACTOR, tail.y * SCALE_FACTOR, 32 * SCALE_FACTOR, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.stroke()
    ctx.closePath()

    ctx.lineWidth = 68 * SCALE_FACTOR
    ctx.strokeStyle = 'white'

    catmullCurve(ctx, points.map(pt => ([
      pt.x * SCALE_FACTOR, pt.y * SCALE_FACTOR
    ])))

    ctx.lineWidth = 60 * SCALE_FACTOR
    ctx.strokeStyle = '#1da1f2'

    catmullCurve(ctx, points.map(pt => ([
      pt.x * SCALE_FACTOR, pt.y * SCALE_FACTOR
    ])))

    ctx.lineWidth = 4 * SCALE_FACTOR

    ctx.beginPath()
    ctx.arc(head.x * SCALE_FACTOR, head.y * SCALE_FACTOR, 30 * SCALE_FACTOR, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.closePath()

    ctx.beginPath()
    ctx.arc(tail.x * SCALE_FACTOR, tail.y * SCALE_FACTOR, 30 * SCALE_FACTOR, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.closePath()

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
