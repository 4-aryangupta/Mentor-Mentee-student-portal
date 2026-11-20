export default function Loader({ label = 'Loading portal…', inline = false }) {
  return <div className={inline ? 'loader-inline' : 'loader-wrap'}><span className="spinner"/><span>{label}</span></div>;
}
