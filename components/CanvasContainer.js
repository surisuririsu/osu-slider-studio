import { useEffect, useRef, useState } from 'react'
import { SCALE_FACTOR } from '@/utils/constants'

const FORM_WIDTH = 260
const TIMELINE_HEIGHT = 52
const CTRL_KEY = 17
const ESC_KEY = 27
const LEFT_BUTTON = 0
const RIGHT_BUTTON = 2

export default function CanvasContainer({
  gridSize,
  tickDist,
  slider,
  onSliderChange,
}) {
  const containerRef = useRef()
  const canvasRef = useRef()
  const drawing = useRef(true)
  const focusPoint = useRef(null)

  const setCanvasSize = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
  }

  const reportSliderChange = () => {
    onSliderChange()
  }

  const redraw = () => {
    const canvas = canvasRef.current
    if (!canvas || !canvas.getContext) return

    setCanvasSize()
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    slider.current.draw(ctx, tickDist)

    reportSliderChange()
  }

  const computePtFromEvent = (e) => {
    const safeGridSize = gridSize || 1
    const x =
      Math.round((e.clientX - FORM_WIDTH) / SCALE_FACTOR / safeGridSize) *
      safeGridSize
    const y =
      Math.round((e.clientY - TIMELINE_HEIGHT) / SCALE_FACTOR / safeGridSize) *
      safeGridSize
    return { x, y }
  }

  const handleKeyDown = (e) => {
    if (!drawing.current) return
    e = e || window.event
    if (e.keyCode === CTRL_KEY) {
      slider.current.setLastSegmentThrough(true)
    } else if (e.keyCode === ESC_KEY) {
      slider.current.popPoint()
      drawing.current = false
    }
    redraw()
  }

  const handleKeyUp = (e) => {
    if (!drawing.current) return
    e = e || window.event
    if (e.keyCode === CTRL_KEY) {
      slider.current.setLastSegmentThrough(false)
    }
    redraw()
  }

  useEffect(() => {
    window.addEventListener('resize', () => redraw(), false)
    document.onkeydown = handleKeyDown
    document.onkeyup = handleKeyUp
    redraw()
  }, [])

  const handleMouseDown = (e) => {
    if (e.button !== LEFT_BUTTON) return
    if (drawing.current) return
    const mousePoint = computePtFromEvent(e)
    const nearPoint = slider.current.getNearPoint(mousePoint)
    if (nearPoint.segIndex === null) return
    focusPoint.current = nearPoint
  }

  const handleMouseMove = (e) => {
    const mousePoint = computePtFromEvent(e)
    if (drawing.current) {
      if (slider.current.isEmpty()) {
        slider.current.pushPoint(mousePoint)
      } else {
        const { segIndex, ptIndex } = slider.current.getLastPoint()
        slider.current.movePoint(segIndex, ptIndex, mousePoint)
      }
    } else if (focusPoint.current) {
      const { segIndex, ptIndex } = focusPoint.current
      slider.current.movePoint(segIndex, ptIndex, mousePoint)
    } else {
      return
    }
    redraw()
  }

  const handleMouseUp = (e) => {
    const mousePoint = computePtFromEvent(e)
    const nearPoint = slider.current.getNearPoint(mousePoint)
    const nearEdge = slider.current.getNearEdge(mousePoint)
    if (e.button === LEFT_BUTTON) {
      if (drawing.current) {
        const lastSegment = slider.current.getLastSegment()
        const anchoringPrev =
          lastSegment.getLength() > 1 &&
          lastSegment.isSecondLastPoint(mousePoint)
        const closingArc = lastSegment.type === 'arc'
        if (anchoringPrev) {
          slider.current.setAnchor(
            slider.current.getLength() - 1,
            lastSegment.getLength() - 2
          )
        } else {
          if (closingArc) {
            const { segIndex, ptIndex } = slider.current.getLastPoint()
            slider.current.setAnchor(segIndex, ptIndex)
          }
          slider.current.pushPoint(mousePoint)
        }
      } else if (e.ctrlKey) {
        if (nearPoint.segIndex !== null) {
          const { segIndex, ptIndex } = nearPoint
          slider.current.upgradePoint(segIndex, ptIndex)
        } else if (nearEdge.segIndex !== null) {
          const { segIndex, edgeIndex } = nearEdge
          slider.current.insertPoint(mousePoint, segIndex, edgeIndex)
        }
      }
    } else if (e.button === RIGHT_BUTTON) {
      if (drawing.current) {
        drawing.current = false
      } else if (nearPoint.segIndex !== null) {
        const { segIndex, ptIndex } = nearPoint
        if (slider.current.isAnchor(segIndex, ptIndex)) {
          slider.current.resetAnchor(segIndex, ptIndex)
        } else {
          slider.current.deletePoint(segIndex, ptIndex)
        }
        if (slider.current.isEmpty()) {
          drawing.current = true
        }
      }
    }
    focusPoint.current = null
    redraw()
  }

  const scaledGridSize = gridSize * SCALE_FACTOR
  const style = scaledGridSize
    ? {
        backgroundSize: `${scaledGridSize}px ${scaledGridSize}px`,
      }
    : {}

  return (
    <div ref={containerRef} id="canvas_container">
      <canvas
        ref={canvasRef}
        style={style}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  )
}
