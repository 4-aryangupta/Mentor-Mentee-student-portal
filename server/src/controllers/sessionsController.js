import { Session, User, Mentorship } from '../models/index.js';
import { assertStudentAccess } from '../utils/access.js';
import { asyncHandler, sendData } from '../utils/serializers.js';

export const listSessions = asyncHandler(async (req, res) => {
  const where = {};
  if (req.user.role === 'mentor') {
    const links = await Mentorship.findAll({ where: { mentorId: req.user.id, status: 'active' }, attributes: ['studentId'] });
    where.mentorId = req.user.id; where.studentId = links.length ? links.map((link) => link.studentId) : -1;
  }
  if (req.user.role === 'student') where.studentId = req.user.id;
  if (req.query.studentId && req.user.role !== 'student') { await assertStudentAccess(req.user, req.query.studentId); where.studentId = Number(req.query.studentId); }
  if (req.query.status && ['scheduled', 'completed', 'cancelled'].includes(req.query.status)) where.status = req.query.status;
  const rows = await Session.findAll({ where, include: [{ model: User, as: 'mentor', attributes: ['id', 'name'] }, { model: User, as: 'student', attributes: ['id', 'name', 'email'] }], order: [['sessionDate', 'ASC']] });
  sendData(res, rows);
});
export const getSession = asyncHandler(async (req, res) => {
  const row = await Session.findByPk(req.params.id, { include: [{ model: User, as: 'mentor', attributes: ['id', 'name'] }, { model: User, as: 'student', attributes: ['id', 'name'] }] });
  if (!row) return res.status(404).json({ success: false, message: 'Session not found.' });
  await assertStudentAccess(req.user, row.studentId);
  if (req.user.role === 'mentor' && row.mentorId !== req.user.id) return res.status(403).json({ success: false, message: 'You cannot view this session.' });
  sendData(res, row);
});
export const createSession = asyncHandler(async (req, res) => {
  const { studentId, sessionDate, topic } = req.body;
  await assertStudentAccess(req.user, studentId);
  const mentorId = req.user.role === 'admin' ? Number(req.body.mentorId) : req.user.id;
  if (req.user.role === 'admin') {
    if (!Number.isInteger(mentorId) || mentorId < 1) return res.status(400).json({ success: false, message: 'A valid assigned mentor is required.' });
    const mentor = await User.findByPk(mentorId);
    const assigned = await Mentorship.findOne({ where: { mentorId, studentId: Number(studentId), status: 'active' } });
    if (!mentor || mentor.role !== 'mentor' || !mentor.isActive || !assigned) return res.status(400).json({ success: false, message: 'Choose an active mentor currently assigned to this student.' });
  }
  const row = await Session.create({ mentorId, studentId: Number(studentId), sessionDate, topic, status: 'scheduled' });
  sendData(res, await Session.findByPk(row.id, { include: [{ model: User, as: 'mentor', attributes: ['id', 'name'] }, { model: User, as: 'student', attributes: ['id', 'name'] }] }), 201);
});
export const updateSession = asyncHandler(async (req, res) => {
  const row = await Session.findByPk(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: 'Session not found.' });
  await assertStudentAccess(req.user, row.studentId);
  if (req.user.role !== 'admin' && row.mentorId !== req.user.id) return res.status(403).json({ success: false, message: 'Only the assigned mentor can update this session.' });
  const allowed = {};
  for (const key of ['sessionDate', 'topic', 'status', 'meetingNotes']) if (req.body[key] !== undefined) allowed[key] = req.body[key];
  await row.update(allowed);
  sendData(res, row);
});
export const deleteSession = asyncHandler(async (req, res) => {
  const row = await Session.findByPk(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: 'Session not found.' });
  if (req.user.role !== 'admin' && row.mentorId !== req.user.id) return res.status(403).json({ success: false, message: 'Only the assigned mentor can delete this session.' });
  if (req.user.role === 'mentor') await assertStudentAccess(req.user, row.studentId);
  await row.destroy(); sendData(res, { message: 'Session deleted.' });
});
