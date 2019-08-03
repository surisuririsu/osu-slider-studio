import React from 'react'

export default class ToolbarContainer extends React.PureComponent {
  render() {
    const { sliderLength, onClear } = this.props
    return (
      <div id="toolbar_container">
        <h2>Slider length: {parseFloat(sliderLength.toFixed(4))} beats</h2>
        <button onClick={onClear}>Clear</button>
      </div>
    )
  }
}
