export default function ToolbarContainer({ sliderLength, onClear }) {
  return (
    <div id="toolbar_container">
      <h2>Slider length: {parseFloat(sliderLength.toFixed(4))} beats</h2>
      <button onClick={onClear}>Clear</button>
    </div>
  )
}
