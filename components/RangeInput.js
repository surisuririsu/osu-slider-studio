export default function RangeInput({ label, options, value, onChange }) {
  const val = options.indexOf(value)
  return (
    <div className="formInput">
      <div className="formLabel">{label}</div>
      <div className="sliderInput">
        <input
          type="range"
          min={0}
          max={options.length - 1}
          step={1}
          value={val}
          onChange={(e) => onChange(options[e.target.value])}
        />
        <span>{value}</span>
      </div>
    </div>
  )
}
