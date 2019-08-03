import React from 'react'
import FormContainer from './FormContainer'
import ToolbarContainer from './ToolbarContainer'
import CanvasContainer from './CanvasContainer'
import { trackEvent } from '../utils/helpers'
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
      sliderCode: '',
      sliderLength: 0,
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
    return (
      <React.Fragment>
        <FormContainer
          key="form_container"
          code={this.state.sliderCode}
          hasLength={this.state.sliderLength > 0}
          onChangeSettings={this.handleChangeSettings}
          onGenerateCode={this.handleGenerateCode}
        />
        <div id="right_content">
          <ToolbarContainer
            sliderLength={this.state.sliderLength}
            onClear={this.handleClear}
          />
          <CanvasContainer
            key="canvas_container"
            ref="canvasContainer"
            settings={this.state.settings}
            gridSize={this.state.gridSize}
            onSliderChange={this.handleSliderChange}
          />
        </div>
      </React.Fragment>
    )
  }

  handleChangeSettings = (settings) => {
    this.setState({ settings })
    trackEvent('changeSettings')
  }

  handleChangeGridSize = (gridSize) => {
    this.setState({ gridSize })
    trackEvent('changeGridSize')
  }

  handleSliderChange = (sliderLength) => {
    this.setState({ sliderLength })
  }

  handleClear = () => {
    const canvasContainer = this.refs.canvasContainer
    if (!canvasContainer) return
    canvasContainer.clear()
    trackEvent('clear')
  }

  handleGenerateCode = () => {
    const canvasContainer = this.refs.canvasContainer
    if (!canvasContainer) return
    this.setState({ sliderCode: canvasContainer.getSliderCode() })
    trackEvent('generateCode')
  }
}
