import React from 'react'
import FloatInput from '../components/FloatInput'
import RangeInput from '../components/RangeInput'
import CodeArea from '../components/CodeArea'
import { trackEvent } from '../utils/helpers'

const BEAT_SNAPPINGS = {
  '1/1': 1,
  '1/2': 1 / 2,
  '1/3': 1 / 3,
  '1/4': 1 / 4,
  '1/6': 1 / 6,
  '1/8': 1 / 8,
  '1/12': 1 / 12,
  '1/16': 1 / 16,
}

export default class FormContainer extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      baseSv: 1,
      svMultiplier: 1,
      beatSnap: '1/4',
      hasChanges: false,
    }
  }

  render() {
    const { hasLength } = this.props
    const { hasChanges } = this.state
    return (
      <div id="form_container">
        <h1>SliderStudio</h1>
        <span>by <a onClick={this.handleProfileClick} href="https://osu.ppy.sh/u/2099102" target="_blank">Little</a></span>

        <div id="info_section" className="formSection">
          <button onClick={this.handleReadMeClick}>Read me</button>
        </div>

        <form id="settings_section" className="formSection" onSubmit={this.handleSubmit}>
          <FloatInput key="base_sv" label="Base SV" onChange={this.handleChangeBaseSv} value={this.state.baseSv} />
          <FloatInput key="sv_multiplier" label="SV Multiplier" onChange={this.handleChangeSvMultiplier} value={this.state.svMultiplier} />
          <RangeInput key="beat_snap" label="Beat snap" options={Object.keys(BEAT_SNAPPINGS)} onChange={this.handleChangeBeatSnap} value={this.state.beatSnap} />
          <button
            disabled={!hasChanges}
            className={hasChanges ? '' : 'disabled'}
            type="submit"
          >
            Apply settings
          </button>
        </form>

        <div id="code_section" className="formSection">
          <CodeArea label="Code" value={this.props.code} />
          <button
            disabled={!hasLength}
            className={hasLength ? '' : 'disabled'}
            onClick={this.handleCodeClick}
          >
            Generate code
          </button>
        </div>
      </div>
    )
  }

  handleProfileClick = () => {
    trackEvent('profileClick')
  }

  handleReadMeClick = () => {
    alert(
      'Usage:\n' +
      '- Enter the slider velocity and beat snapping settings, and click "Apply settings".\n' +
      '- Slider point placement is similar to osu! editor, but defaults to bezier curve.\n' +
      '- To create a perfect curve segment, hold CTRL before placing the 3rd point.\n' +
      '- To create a bezier spline segment, hold CTRL before placing the 4th point.'
    )
  }

  handleChangeBaseSv = (e) => {
    this.setState({
      baseSv: e.target.value,
      hasChanges: true,
    })
  }

  handleChangeSvMultiplier = (e) => {
    this.setState({
      svMultiplier: e.target.value,
      hasChanges: true,
    })
  }

  handleCodeClick = (e) => {
    this.props.onGenerateCode()
  }

  handleChangeBeatSnap = (snap) => {
    this.setState({
      beatSnap: snap,
      hasChanges: true,
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()

    const baseSv = parseFloat(this.state.baseSv)
    const svMultiplier = parseFloat(this.state.svMultiplier)
    const beatSnap = BEAT_SNAPPINGS[this.state.beatSnap]
    if (!(baseSv && svMultiplier)) {
      alert('Invalid settings.')
      return
    }

    this.props.onChangeSettings({
      baseSv, svMultiplier, beatSnap
    })
    this.setState({
      baseSv, svMultiplier,
      hasChanges: false,
    })
  }
}
