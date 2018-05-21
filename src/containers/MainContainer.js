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
      gridSize: 0,
      sliderCode: ''
    }
  }

  componentDidMount() {
    alert(
      'PLEASE READ BEFORE USING:\n' +
      'This tool is a work-in-progress (there will be bugs and missing features!).\n\n' +
      'Usage:\n' +
      '- Enter the slider velocity and beat snapping settings, and click "Apply settings".\n' +
      '- Slider point placement is similar to osu! editor, but defaults to bezier curve.\n' +
      '- To create a perfect curve segment, hold CTRL before placing the 3rd point.\n' +
      '- To create a bezier spline segment, hold CTRL before placing the 4th point.'
    )
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
