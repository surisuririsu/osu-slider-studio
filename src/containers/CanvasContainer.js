import React from 'react'
import Slider from '../models/Slider'
import { SCALE_FACTOR } from '../utils/constants'

const FORM_WIDTH = 260
const TIMELINE_HEIGHT = 60
const CTRL_KEY = 17
const ESC_KEY = 27
const LEFT_BUTTON = 0
const RIGHT_BUTTON = 2

export default class CanvasContainer extends React.Component {
  constructor(props) {
    super(props)
    const tickDist = this.computeTickDistance(props.settings)
    this.state = {
      drawing: true,
      focusPoint: null,
      tickDist
    }
    this.slider = new Slider()
  }

  componentDidMount() {
    window.addEventListener('resize', () => this.redraw(), false)
    document.onkeydown = this.handleKeyDown
    document.onkeyup = this.handleKeyUp
    this.redraw()
  }

  componentWillReceiveProps(nextProps) {
    const tickDist = this.computeTickDistance(nextProps.settings)
    this.setState({ tickDist })
  }

  render() {
    const gridSize = this.props.gridSize * SCALE_FACTOR
    const style = gridSize ? {
      backgroundSize: `${gridSize}px ${gridSize}px`
    } : {}
    return (
      <div ref="container" id="canvas_container">
        <canvas
          ref="canvas"
          style={style}
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
      if (this.slider.isEmpty()) {
        this.slider.pushPoint(mousePoint)
      } else {
        const { segIndex, ptIndex } = this.slider.getLastPoint()
        this.slider.movePoint(segIndex, ptIndex, mousePoint)
      }
    } else if (this.state.focusPoint) {
      const { segIndex, ptIndex } = this.state.focusPoint
      this.slider.movePoint(segIndex, ptIndex, mousePoint)
    } else {
      return
    }
    this.redraw()
  }

  handleMouseUp = (e) => {
    const mousePoint = this.computePtFromEvent(e)
    const nearPoint = this.slider.getNearPoint(mousePoint)
    const nearEdge = this.slider.getNearEdge(mousePoint)
    if (e.button === LEFT_BUTTON) {
      if (this.state.drawing) {
        const lastSegment = this.slider.getLastSegment()
        const anchoringPrev = lastSegment.getLength() > 1 && lastSegment.isSecondLastPoint(mousePoint)
        const closingArc = lastSegment.type === 'arc'
        if (anchoringPrev) {
          this.slider.setAnchor(this.slider.getLength() - 1, lastSegment.getLength() - 2)
        } else {
          if (closingArc) {
            const { segIndex, ptIndex } = this.slider.getLastPoint()
            this.slider.setAnchor(segIndex, ptIndex)
          }
          this.slider.pushPoint(mousePoint)
        }
      } else if (e.ctrlKey) {
        if (nearPoint.segIndex !== null) {
          const { segIndex, ptIndex } = nearPoint
          this.slider.setAnchor(segIndex, ptIndex)
        } else if (nearEdge.segIndex !== null) {
          const { segIndex, edgeIndex } = nearEdge
          this.slider.insertPoint(mousePoint, segIndex, edgeIndex)
        }
      }
    } else if (e.button === RIGHT_BUTTON) {
      if (this.state.drawing) {
        this.setState({ drawing: false })
      } else if (nearPoint.segIndex !== null) {
        const { segIndex, ptIndex } = nearPoint
        if (this.slider.isAnchor(segIndex, ptIndex)) {
          this.slider.resetAnchor(segIndex, ptIndex)
        } else {
          this.slider.deletePoint(segIndex, ptIndex)
        }
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

  clear() {
    this.slider = new Slider()
    this.setState({
      drawing: true,
      focusPoint: null,
    })
    this.redraw()
  }

  getSliderCode() {
    if (!this.state.tickDist) return ''
    return this.slider.getOsuCode(this.state.tickDist)
  }

  computeTickDistance(settings) {
    const { baseSv, svMultiplier, beatSnap } = settings
    const dist = beatSnap * baseSv * svMultiplier * 100
    return dist
  }

  computePtFromEvent(e) {
    const gridSize = this.props.gridSize || 1
    const x = Math.round((e.clientX - FORM_WIDTH) / SCALE_FACTOR / gridSize) * gridSize
    const y = Math.round((e.clientY - TIMELINE_HEIGHT) / SCALE_FACTOR / gridSize) * gridSize
    return { x, y }
  }

  setCanvasSize() {
    const canvas = this.refs.canvas
    const container = this.refs.container
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
  }

  reportSliderChange() {
    const { settings, onSliderChange } = this.props
    const tickDist = this.computeTickDistance(settings)
    const fullDist = this.slider.getFullDist()
    onSliderChange(Math.floor(fullDist / tickDist) * settings.beatSnap)
  }

  redraw() {
    const canvas = this.refs.canvas
    if (!canvas || !canvas.getContext) return

    this.setCanvasSize()
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.slider.draw(ctx, this.state.tickDist)

    this.reportSliderChange()
  }
}
