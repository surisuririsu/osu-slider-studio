import React from 'react'

export default class CodeArea extends React.PureComponent {
  render() {
    return (
      <div className="formInput">
        <div className="formLabel">{this.props.label}</div>
        <textarea readOnly value={this.props.value} />
      </div>
    )
  }
}
