import { Feedback, User, Mentorship } from '../models/index.js';
import { assertStudentAccess } from '../utils/access.js';
import { asyncHandler, sendData } from '../utils/serializers.js';

export const listFeedback = asyncHandler(async (req, res) => {
  const where = {};
  if (req.user.role === 'student') where.studentId = req.user.id;
  if (req.user.role === 'mentor') {
    const links = await Mentorship.findAll({ where: { mentorId: req.user.id, status: 'active' }, attributes: ['studentId'] });
    where.mentorId = req.user.id; where.studentId = links.length ? links.map((link) => link.studentId) : -1;
  }
  if (req.query.studentId && req.user.role !== 'student') { await assertStudentAccess(req.user, req.query.studentId); where.studentId = Number(req.query.studentId); }
  const rows = await Feedback.findAll({ where, include: [{ model: User, as: 'mentor', attributes: ['id', 'name'] }, { model: User, as: 'student', attributes: ['id', 'name'] }], order: [['createdAt', 'DESC']] });
  sendData(res, rows);
});
export const getFeedback = asyncHandler(async (req, res) => {
  const row = await Feedback.findByPk(req.params.id, { include: [{ model: User, as: 'mentor', attributes: ['id', 'name'] }, { model: User, as: 'student', attributes: ['id', 'name'] }] });
  if (!row) return res.status(404).json({ success: false, message: 'Feedback not found.' });
  await assertStudentAccess(req.user, row.studentId);
  sendData(res, row);
});
export const createFeedback = asyncHandler(async (req, res) => {
  if (req.user.role !== 'mentor' && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only mentors can give feedback.' });
  await assertStudentAccess(req.user, req.body.studentId);
  const mentorId = req.user.role === 'admin' ? Number(req.body.mentorId) : req.user.id;
  if (req.user.role === 'admin') {
    if (!Number.isInteger(mentorId) || mentorId < 1) return res.status(400).json({ success: false, message: 'A valid assigned mentor is required.' });
    const mentor = await User.findByPk(mentorId);
    const assigned = await Mentorship.findOne({ where: { mentorId, studentId: Number(req.body.studentId), status: 'active' } });
    if (!mentor || mentor.role !== 'mentor' || !mentor.isActive || !assigned) return res.status(400).json({ success: false, message: 'Choose an active mentor currently assigned to this student.' });
  }
  const row = await Feedback.create({ mentorId, studentId: Number(req.body.studentId), message: req.body.message, rating: Number(req.body.rating) });
  sendData(res, row, 201);
});
export const updateFeedback = asyncHandler(async (req, res) => {
  const row = await Feedback.findByPk(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: 'Feedback not found.' });
  if (req.user.role !== 'admin' && row.mentorId !== req.user.id) return res.status(403).json({ success: false, message: 'Only the authoring mentor can edit this feedback.' });
  await assertStudentAccess(req.user, row.studentId);
  await row.update({ message: req.body.message ?? row.message, rating: req.body.rating ?? row.rating });
  sendData(res, row);
});
export const deleteFeedback = asyncHandler(async (req, res) => {
  const row = await Feedback.findByPk(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: 'Feedback not found.' });
  if (req.user.role !== 'admin' && row.mentorId !== req.user.id) return res.status(403).json({ success: false, message: 'Only the authoring mentor can delete this feedback.' });
  if (req.user.role === 'mentor') await assertStudentAccess(req.user, row.studentId);
  await row.destroy(); sendData(res, { message: 'Feedback deleted.' });
});
