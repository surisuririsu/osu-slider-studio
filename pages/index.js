import { useRef, useState } from 'react'
import Head from '@/components/Head'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import FormContainer from '@/components/FormContainer'
import ToolbarContainer from '@/components/ToolbarContainer'
import CanvasContainer from '@/components/CanvasContainer'
import Slider from '@/models/Slider'
import { trackEvent } from '@/utils/helpers'

export default function MainContainer() {
  const slider = useRef(new Slider())
  const [settings, setSettings] = useState({
    baseSv: 1,
    svMultiplier: 1,
    beatSnap: 0.25,
  })
  const [showCanvas, setShowCanvas] = useState(true)
  const [gridSize, setGridSize] = useState(0)
  const [sliderCode, setSliderCode] = useState('')
  const [sliderLength, setSliderLength] = useState(0)

  const { baseSv, svMultiplier, beatSnap } = settings
  const tickDist = beatSnap * baseSv * svMultiplier * 100

  const handleChangeSettings = (val) => {
    setSettings(val)
    trackEvent('changeSettings')
  }

  const handleSliderChange = () => {
    const fullDist = slider.current.getFullDist()
    setSliderLength(Math.floor(fullDist / tickDist) * beatSnap)
  }

  const handleClear = () => {
    slider.current = new Slider()
    setShowCanvas(false)
    setTimeout(() => setShowCanvas(true), 0)
    trackEvent('clear')
  }

  const handleGenerateCode = () => {
    if (!slider.current) return
    if (!tickDist) return ''
    setSliderCode(slider.current.getOsuCode(tickDist))
    trackEvent('generateCode')
  }
  return (
    <>
      <Head />
      <GoogleAnalytics />
      <div id="main">
        <FormContainer
          key="form_container"
          code={sliderCode}
          hasLength={sliderLength > 0}
          onChangeSettings={handleChangeSettings}
          onGenerateCode={handleGenerateCode}
        />
        <div id="right_content">
          <ToolbarContainer sliderLength={sliderLength} onClear={handleClear} />
          {showCanvas && (
            <CanvasContainer
              key="canvas_container"
              tickDist={tickDist}
              gridSize={gridSize}
              slider={slider}
              onSliderChange={handleSliderChange}
            />
          )}
        </div>
      </div>
    </>
  )
}
