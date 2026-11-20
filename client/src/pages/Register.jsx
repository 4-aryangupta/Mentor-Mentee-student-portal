import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import FormInput from '../components/FormInput.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../services/api.js';
export default function Register() {
  const { register } = useAuth(); const navigate = useNavigate(); const notify = useToast(); const firstField = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', department: 'Information Technology' }); const [errors, setErrors] = useState({}); const [busy, setBusy] = useState(false);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = async (event) => { event.preventDefault(); const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.';
    if (form.phone && !/^[0-9+\- ]{7,20}$/.test(form.phone)) next.phone = 'Enter a valid phone number.';
    setErrors(next); if (Object.keys(next).length) { firstField.current?.focus(); return; }
    setBusy(true); try { const { confirmPassword, ...payload } = form; const user = await register(payload); notify('Your student account is ready.'); navigate(`/${user.role}/dashboard`, { replace: true }); }
    catch (err) { notify(getErrorMessage(err), 'error'); } finally { setBusy(false); }
  };
  return <div className="auth-layout register-layout"><section className="auth-story"><div className="auth-brand"><span className="brand-mark"><GraduationCap size={22}/></span><div><strong>Mentor<span>Desk</span></strong><small>DEPARTMENT OF INFORMATION TECHNOLOGY</small></div></div><div className="auth-story-content"><div className="eyebrow">STUDENT ONBOARDING</div><h1>Start with a<br/><em>clear plan.</em></h1><p>Create your student account to share progress updates, keep track of advising sessions, and access mentor feedback.</p><div className="onboarding-note"><span>01</span><div><strong>One student account</strong><small>New registrations are always created with student access. Mentors and administrators are added by the department.</small></div></div></div><div className="auth-story-footer"><span>SWAMI KESHWANAND INSTITUTE OF TECHNOLOGY</span><span>JAIPUR · RAJASTHAN</span></div><div className="auth-art" aria-hidden="true"><span/><span/><span/><i/></div></section>
    <section className="auth-form-side"><div className="auth-form-wrap"><Link to="/login" className="back-link"><ArrowLeft size={15}/> Back to sign in</Link><div className="auth-form-kicker">STUDENT REGISTRATION <span>02 / ACCOUNT</span></div><h2>Create your account</h2><p className="auth-subtitle">Use the details registered with your department.</p><form onSubmit={submit} noValidate><FormInput ref={firstField} label="Full name" name="name" placeholder="Your full name" value={form.name} error={errors.name} onChange={update('name')} required/><FormInput label="College email" name="email" type="email" placeholder="name@college.edu" value={form.email} error={errors.email} onChange={update('email')} required/><div className="form-grid-two"><FormInput label="Phone (optional)" name="phone" placeholder="+91 98765 43210" value={form.phone} error={errors.phone} onChange={update('phone')}/><FormInput label="Department" name="department" value={form.department} onChange={update('department')}/></div><FormInput label="Password" name="password" type="password" placeholder="At least 8 characters" value={form.password} error={errors.password} onChange={update('password')} required/><FormInput label="Confirm password" name="confirmPassword" type="password" placeholder="Re-enter password" value={form.confirmPassword} error={errors.confirmPassword} onChange={update('confirmPassword')} required/><button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Creating account…' : 'Create student account'} <ArrowRight size={17}/></button></form><p className="auth-legal">Faculty and administrator accounts are created by the department administrator.</p></div></section></div>;
}
