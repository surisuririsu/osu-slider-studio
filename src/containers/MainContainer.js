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
      gridSize: 4
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
        gridSize={this.state.gridSize}
      />
    ]
  }

  handleChangeSettings = (settings) => {
    this.setState({ settings })
  }

  handleChangeGridSize = (gridSize) => {
    this.setState({ gridSize })
  }
}
