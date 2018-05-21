import React from 'react'
import FormContainer from './FormContainer'
import CanvasContainer from './CanvasContainer'
import '../styles/style.scss'

export default class MainContainer extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      settings: {
        baseSv: 1,
        svMultiplier: 1,
        beatSnap: 0.25
      },
      gridSize: 4,
      sliderCode: ''
    }
  }

  render() {
    return [
      <FormContainer
        key="form_container"
        code={this.state.sliderCode}
        onChangeSettings={this.handleChangeSettings}
        onGenerateCode={this.handleGenerateCode}
      />,
      <CanvasContainer
        key="canvas_container"
        ref="canvasContainer"
        settings={this.state.settings}
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

  handleGenerateCode = () => {
    const canvasContainer = this.refs.canvasContainer
    if (!canvasContainer) return
    this.setState({ sliderCode: canvasContainer.getSliderCode() })
  }
}
