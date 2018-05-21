import React from 'react'
import FloatInput from '../components/FloatInput'
import RangeInput from '../components/RangeInput'
import CodeArea from '../components/CodeArea'

const BEAT_SNAPPINGS = {
  '1/1': 1,
  '1/2': 1 / 2,
  '1/3': 1 / 3,
  '1/4': 1 / 4,
  '1/6': 1 / 6,
  '1/8': 1 / 8,
  '1/12': 1 / 12,
  '1/16': 1 / 16,
  'Any': 0
}

export default class FormContainer extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      baseSv: 1,
      svMultiplier: 1,
      beatSnap: '1/4'
    }
  }

  render() {
    return (
      <div id="form_container">
        <h1>SliderStudio</h1>
        <span>by <a href="https://osu.ppy.sh/u/2099102">Little</a></span>

        <form id="settings_section" className="formSection" onSubmit={this.handleSubmit}>
          <FloatInput key="base_sv" label="Base SV" onChange={this.handleChangeBaseSv} value={this.state.baseSv} />
          <FloatInput key="sv_multiplier" label="SV Multiplier" onChange={this.handleChangeSvMultiplier} value={this.state.svMultiplier} />
          <RangeInput key="beat_snap" label="Beat snap" options={Object.keys(BEAT_SNAPPINGS)} onChange={this.handleChangeBeatSnap} value={this.state.beatSnap} />
          <button type="submit">Apply settings</button>
        </form>

        <div id="code_section" className="formSection">
          <CodeArea label="Code" value={this.props.code} />
          <button onClick={this.handleCodeClick}>Generate code</button>
        </div>
      </div>
    )
  }

        // <div id="canvas_section" className="formSection">

        // </div>

  handleChangeBaseSv = (e) => {
    this.setState({ baseSv: e.target.value })
  }

  handleChangeSvMultiplier = (e) => {
    this.setState({ svMultiplier: e.target.value })
  }

  handleCodeClick = (e) => {
    this.props.onGenerateCode()
  }

  handleChangeBeatSnap = (snap) => {
    this.setState({ beatSnap: snap })
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
      baseSv, svMultiplier
    })
  }
}
