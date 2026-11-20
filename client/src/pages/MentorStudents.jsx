import { useEffect, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api.js';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
export default function MentorStudents() {
  const [students, setStudents] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [query, setQuery] = useState('');
  const load = async () => { setLoading(true); setError(''); try { const { data } = await api.get('/users?role=student'); setStudents(data.data); } catch (err) { setError(getErrorMessage(err)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const filtered = students.filter((s) => `${s.name} ${s.email}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="page-stack"><PageHeader eyebrow="ADVISEE DIRECTORY" title="My students" description="Students currently assigned to you. Student records outside your active assignments are not visible here."/><div className="toolbar"><div className="search-field"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your students"/></div><span className="record-count">{filtered.length} assigned</span></div>{error && <div className="inline-error">{error} <button onClick={load}>Try again</button></div>}{loading ? <Loader/> : filtered.length ? <div className="student-card-grid">{filtered.map((student, index) => <Link className="student-card" to={`/mentor/students/${student.id}`} key={student.id}><div className="student-card-top"><span className={`student-index student-index-${index % 3}`}>{String(index + 1).padStart(2, '0')}</span><ArrowUpRight size={17}/></div><div className="student-card-avatar">{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><h2>{student.name}</h2><p>{student.email}</p><div className="student-card-footer"><span>{student.department || 'Information Technology'}</span><span>View student <ArrowUpRight size={13}/></span></div></Link>)}</div> : <div className="panel"><EmptyState title={query ? 'No matching students' : 'No active advisees'} description={query ? 'Try a different name or email.' : 'The department has not assigned any students to you yet.'} /></div>}</div>;
}
