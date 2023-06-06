export default function FloatInput({ label, onChange, value }) {
  return (
    <div className="formInput">
      <div className="formLabel">{label}</div>
      <input onChange={onChange} value={value} />
    </div>
  )
}
