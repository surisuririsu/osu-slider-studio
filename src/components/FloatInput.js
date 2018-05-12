import React from 'react'

export default class FloatInput extends React.PureComponent {
  render() {
    return (
      <div className="formInput">
        <div className="formLabel">{this.props.label}</div>
        <input onChange={this.props.onChange} value={this.props.value} />
      </div>
    )
  }
}