import { forwardRef } from 'react';
const FormInput = forwardRef(function FormInput({ label, error, as = 'input', options = [], ...props }, ref) {
  const id = props.id || props.name;
  return <div className={`form-field ${error ? 'has-error' : ''}`}><label htmlFor={id}>{label}{props.required && <i> *</i>}</label>{as === 'select' ? <select id={id} ref={ref} {...props}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : as === 'textarea' ? <textarea id={id} ref={ref} rows={4} {...props}/> : <input id={id} ref={ref} {...props}/>}{error && <small className="field-error">{error}</small>}</div>;
});
export default FormInput;
