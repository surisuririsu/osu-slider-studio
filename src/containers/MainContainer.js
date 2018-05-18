import React from 'react'
import FormContainer from './FormContainer'
import CanvasContainer from './CanvasContainer'
import NewCanvasContainer from './NewCanvasContainer'
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
      gridSize: 4,
      points: []
    }
  }

      //   <CanvasContainer
      //   key="canvas_container"
      //   grid={this.state.grid}
      //   points={this.state.points}
      //   onAddPoint={this.handleAddPoint}
      //   onChangePoint={this.handleChangePoint}
      //   onDeletePoint={this.handleDeletePoint}
      // />,

  render() {
    return [
      <FormContainer
        key="form_container"
        onChangeSettings={this.handleChangeSettings}
      />,
      <NewCanvasContainer
        key="canvas_container"
        gridSize={this.state.gridSize}
        points={this.state.points}
        onAddPoint={this.handleAddPoint}
        onChangePoint={this.handleChangePoint}
        onDeletePoint={this.handleDeletePoint}
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
    this.setState((currentState) => {
      const points = currentState.points
      const i = index || points.length
      const lastPt = points[i - 1] || {}
      const dx = Math.abs(point.x - lastPt.x)
      const dy = Math.abs(point.y - lastPt.y)
      if (dx < 4 && dy < 4) {
        lastPt.anchor = true
      } else {
        points.splice(i, 0, point)
      }
      return currentState
    })
  }

  handleChangePoint = (point, index) => {
    this.setState((currentState) => {
      currentState.points[index] = point
      return currentState
    })
  }

  handleDeletePoint = (index) => {
    this.setState((currentState) => {
      const point = currentState.points[index]
      if (point.anchor) {
        point.anchor = false
      } else {
        currentState.points.splice(index, 1)
      }
      return currentState
    })
  }
}
