import React from 'react'
import FormContainer from './FormContainer'
import CanvasContainer from './CanvasContainer'
import '../styles/style.scss'

export default class MainContainer extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      settings: {
        tempo: 120,
        baseSv: 1,
        svMultiplier: 1
      },
      grid: 4,
      points: []
    }
  }

  render() {
    return [
      <FormContainer
        key="form_container"
        onChangeSettings={this.handleChangeSettings}
      />,
      <CanvasContainer
        key="canvas_container"
        grid={this.state.grid}
        points={this.state.points}
        onAddPoint={this.handleAddPoint}
      />
    ]
  }

  handleChangeSettings = (settings) => {
    this.setState({ settings })
  }

  handleChangeGrid = (grid) => {
    this.setState({ grid })
  }

  handleAddPoint = (point, index) => {
    const newPoints = this.state.points.slice()
    const i = index || newPoints.length
    const lastPt = newPoints[newPoints.length - 1] || {}
    const dx = Math.abs(point.x - lastPt.x)
    const dy = Math.abs(point.y - lastPt.y)
    if (dx < 4 && dy < 4) {
      lastPt.anchor = true
    } else {
      newPoints.splice(i, 0, point)
    }
    this.setState({ points: newPoints })
  }
}
