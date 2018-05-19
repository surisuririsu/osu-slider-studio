import React from 'react'
import FloatInput from '../components/FloatInput'
import CodeArea from '../components/CodeArea'

export default class FormContainer extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      tempo: 120,
      baseSv: 1,
      svMultiplier: 1
    }
  }

  render() {
    return (
      <div id="form_container">
        <h1>SliderStudio</h1>
        <span>by <a href="https://osu.ppy.sh/u/2099102">Little</a></span>

        <form id="settings_section" className="formSection" onSubmit={this.handleSubmit}>
          <FloatInput key="tempo" label="Tempo (BPM)" onChange={this.handleChangeTempo} value={this.state.tempo} />
          <FloatInput key="base_sv" label="Base SV" onChange={this.handleChangeBaseSv} value={this.state.baseSv} />
          <FloatInput key="sv_multiplier" label="SV Multiplier" onChange={this.handleChangeSvMultiplier} value={this.state.svMultiplier} />
          <button type="submit">Apply settings</button>
        </form>

        <div id="canvas_section" className="formSection">

        </div>

        <div id="code_section" className="formSection">
          <CodeArea label="Code" value={this.props.code} />
          <button onClick={this.handleCodeClick}>Generate code</button>
        </div>
      </div>
    )
  }

  handleChangeTempo = (e) => {
    this.setState({ tempo: e.target.value })
  }

  handleChangeBaseSv = (e) => {
    this.setState({ baseSv: e.target.value })
  }

  handleChangeSvMultiplier = (e) => {
    this.setState({ svMultiplier: e.target.value })
  }

  handleCodeClick = (e) => {
    this.props.onGenerateCode()
  }

  handleSubmit = (e) => {
    e.preventDefault()

    const tempo = parseFloat(this.state.tempo)
    const baseSv = parseFloat(this.state.baseSv)
    const svMultiplier = parseFloat(this.state.svMultiplier)
    if (!(tempo && baseSv && svMultiplier)) {
      alert('Invalid settings.')
      return
    }

    this.props.onChangeSettings({
      tempo, baseSv, svMultiplier
    })
    this.setState({
      tempo, baseSv, svMultiplier
    })
  }
}
