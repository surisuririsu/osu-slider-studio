import React from 'react'

export default class RangeInput extends React.PureComponent {
  render() {
    const val = this.props.options.indexOf(this.props.value)
    return (
      <div className="formInput">
        <div className="formLabel">{this.props.label}</div>
        <div className="sliderInput">
          <input
            type="range"
            min={0}
            max={this.props.options.length - 1}
            step={1}
            value={val}
            onChange={this.handleChange}
          />
          <span>{this.props.value}</span>
        </div>
      </div>
    )
  }

  handleChange = (e) => {
    this.props.onChange(this.props.options[e.target.value])
  }
}
