export default function CodeArea({ label, value }) {
  return (
    <div className="formInput">
      <div className="formLabel">{label}</div>
      <textarea readOnly value={value} />
    </div>
  )
}
