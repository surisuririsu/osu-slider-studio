import React from 'react'
import Slider from '../models/Slider'
import { SCALE_FACTOR } from '../utils/constants'

const FORM_WIDTH = 260
const CTRL_KEY = 17
const ESC_KEY = 27
const LEFT_BUTTON = 0
const RIGHT_BUTTON = 2

export default class CanvasContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      drawing: true,
      dragging: false,
      focusPoint: null
    }
    this.slider = new Slider()
  }

  componentDidMount() {
    window.addEventListener('resize', () => this.redraw(), false)
    document.onkeydown = this.handleKeyDown
    document.onkeyup = this.handleKeyUp
    this.redraw()
  }

  render() {
    const gridSize = (this.props.gridSize || 0) * SCALE_FACTOR
    return (
      <div ref="container" id="canvas_container">
        <canvas
          ref="canvas"
          style={{ backgroundSize: `${gridSize}px ${gridSize}px` }}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          onContextMenu={this.handleContextMenu}
        />
      </div>
    )
  }

  handleKeyDown = (e) => {
    if (!this.state.drawing) return
    e = e || window.event
    if (e.keyCode === CTRL_KEY) {
      this.slider.setLastSegmentThrough(true)
    } else if (e.keyCode === ESC_KEY) {
      this.slider.popPoint()
      this.setState({ drawing: false })
    }
    this.redraw()
  }

  handleKeyUp = (e) => {
    if (!this.state.drawing) return
    e = e || window.event
    if (e.keyCode === CTRL_KEY) {
      this.slider.setLastSegmentThrough(false)
    }
    this.redraw()
  }

  handleMouseDown = (e) => {
    if (e.button !== LEFT_BUTTON) return
    if (this.state.drawing) return
    const mousePoint = this.computePtFromEvent(e)
    const nearPoint = this.slider.getNearPoint(mousePoint)
    if (nearPoint.segIndex === null) return
    this.setState({ focusPoint: nearPoint })
  }

  handleMouseMove = (e) => {
    const mousePoint = this.computePtFromEvent(e)
    if (this.state.drawing) {
      this.slider.popPoint()
      this.slider.pushPoint(mousePoint)
    } else if (this.state.focusPoint) {
      const { segIndex, ptIndex } = this.state.focusPoint
      this.slider.movePoint(segIndex, ptIndex, mousePoint)
    }
    this.redraw()
  }

  handleMouseUp = (e) => {
    const mousePoint = this.computePtFromEvent(e)
    const nearPoint = this.slider.getNearPoint(mousePoint)
    const nearEdge = this.slider.getNearEdge(mousePoint)
    if (e.button === LEFT_BUTTON) {
      if (this.state.drawing) {
        this.slider.pushPoint(mousePoint)
      } else if (e.ctrlKey && !this.state.focusPoint) {
        if (nearPoint.segIndex !== null) {
          // this.makeAnchor(nearPtIndex)
        } else if (nearEdge.segIndex !== null) {
          console.log(nearEdge)
          const { segIndex, edgeIndex } = nearEdge
          this.slider.insertPoint(mousePoint, segIndex, edgeIndex)
        }
      }
    } else if (e.button === RIGHT_BUTTON) {
      if (this.state.drawing) {
        this.setState({ drawing: false })
      } else if (nearPoint.segIndex !== null) {
        const { segIndex, ptIndex } = nearPoint
        this.slider.deletePoint(segIndex, ptIndex)
        if (this.slider.isEmpty()) {
          this.setState({ drawing: true })
        }
      }
    }
    this.setState({ focusPoint: null })
    this.redraw()
  }

  handleContextMenu = (e) => {
    e.preventDefault()
  }

  computePtFromEvent(e) {
    const gridSize = this.props.gridSize
    const x = Math.round((e.clientX - FORM_WIDTH) / SCALE_FACTOR / gridSize) * gridSize
    const y = Math.round(e.clientY / SCALE_FACTOR / gridSize) * gridSize
    return { x, y }
  }

  setCanvasSize() {
    const canvas = this.refs.canvas
    const container = this.refs.container
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
  }

  redraw() {
    const canvas = this.refs.canvas
    if (!canvas || !canvas.getContext) return

    this.setCanvasSize()
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.slider.draw(ctx)
  }
}