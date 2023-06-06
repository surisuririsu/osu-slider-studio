import { useState } from 'react'
import FloatInput from '@/components/FloatInput'
import RangeInput from '@/components/RangeInput'
import CodeArea from '@/components/CodeArea'
import { trackEvent } from '@/utils/helpers'

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

export default function FormContainer({
  code,
  hasLength,
  onChangeSettings,
  onGenerateCode,
}) {
  const [baseSv, setBaseSv] = useState(1)
  const [svMultiplier, setSvMultiplier] = useState(1)
  const [beatSnap, setBeatSnap] = useState('1/4')
  const [hasChanges, setHasChanges] = useState(false)

  const handleProfileClick = () => trackEvent('profileClick')

  const handleReadMeClick = () => {
    alert(
      'Usage:\n' +
        '- Enter the slider velocity and beat snapping settings, and click "Apply settings".\n' +
        '- Slider point placement is similar to osu! editor, but defaults to bezier curve.\n' +
        '- To create a perfect curve segment, hold CTRL before placing the 3rd point.\n' +
        '- To create a bezier spline segment, hold CTRL before placing the 4th point.'
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const parsedBaseSv = parseFloat(baseSv)
    const parsedSvMultiplier = parseFloat(svMultiplier)
    const parsedBeatSnap = BEAT_SNAPPINGS[beatSnap]
    if (!(parsedBaseSv && parsedSvMultiplier)) {
      alert('Invalid settings.')
      return
    }

    onChangeSettings({
      baseSv: parsedBaseSv,
      svMultiplier: parsedSvMultiplier,
      beatSnap: parsedBeatSnap,
    })
    setBaseSv(parsedBaseSv)
    setSvMultiplier(parsedSvMultiplier)
    setHasChanges(false)
  }

  const handleChangeBaseSv = (e) => {
    setBaseSv(e.target.value)
    setHasChanges(true)
  }

  const handleChangeSvMultiplier = (e) => {
    setSvMultiplier(e.target.value)
    setHasChanges(true)
  }

  const handleCodeClick = () => {
    onGenerateCode()
  }

  const handleChangeBeatSnap = (snap) => {
    setBeatSnap(snap)
    setHasChanges(true)
  }

  return (
    <div id="form_container">
      <h1>SliderStudio</h1>
      <span>
        by{' '}
        <a
          onClick={handleProfileClick}
          href="https://osu.ppy.sh/u/2099102"
          target="_blank"
        >
          Little
        </a>
      </span>

      <div id="info_section" className="formSection">
        <button onClick={handleReadMeClick}>Read me</button>
      </div>

      <form
        id="settings_section"
        className="formSection"
        onSubmit={handleSubmit}
      >
        <FloatInput
          key="base_sv"
          label="Base SV"
          onChange={handleChangeBaseSv}
          value={baseSv}
        />
        <FloatInput
          key="sv_multiplier"
          label="SV Multiplier"
          onChange={handleChangeSvMultiplier}
          value={svMultiplier}
        />
        <RangeInput
          key="beat_snap"
          label="Beat snap"
          options={Object.keys(BEAT_SNAPPINGS)}
          onChange={handleChangeBeatSnap}
          value={beatSnap}
        />
        <button
          disabled={!hasChanges}
          className={hasChanges ? '' : 'disabled'}
          type="submit"
        >
          Apply settings
        </button>
      </form>

      <div id="code_section" className="formSection">
        <CodeArea label="Code" value={code} />
        <button
          disabled={!hasLength}
          className={hasLength ? '' : 'disabled'}
          onClick={handleCodeClick}
        >
          Generate code
        </button>
      </div>
    </div>
  )
}
