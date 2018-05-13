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
      points: [
        { x: 284, y: 28, anchor: true, type: null },
        { x: 304, y: 59, anchor: false, type: null },
        { x: 311, y: 95, anchor: false, type: 'perfect' },
        { x: 256, y: 140, anchor: false, type: null },
        { x: 376, y: 176, anchor: true, type: 'bezier' }
      ],
    }
    this.handleChangeSettings = this._handleChangeSettings.bind(this)
    this.handleChangeGrid = this._handleChangeGrid.bind(this)
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
      />
    ]
  }

  _handleChangeSettings(settings) {
    this.setState({ settings })
  }

  _handleChangeGrid(grid) {
    this.setState({ grid })
  }
}
