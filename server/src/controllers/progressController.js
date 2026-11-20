import { ProgressReport, User, Mentorship } from '../models/index.js';
import { assertStudentAccess, activeMentorFor } from '../utils/access.js';
import { asyncHandler, sendData } from '../utils/serializers.js';

export const listProgress = asyncHandler(async (req, res) => {
  const where = {};
  if (req.user.role === 'student') where.studentId = req.user.id;
  if (req.user.role === 'mentor') {
    const links = await Mentorship.findAll({ where: { mentorId: req.user.id, status: 'active' }, attributes: ['studentId'] });
    where.studentId = links.length ? links.map((link) => link.studentId) : -1;
  }
  if (req.query.studentId && req.user.role !== 'student') {
    await assertStudentAccess(req.user, req.query.studentId); where.studentId = Number(req.query.studentId);
  }
  const rows = await ProgressReport.findAll({ where, include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }, { model: User, as: 'mentor', attributes: ['id', 'name'] }], order: [['submittedAt', 'DESC']] });
  sendData(res, rows);
});
export const getProgress = asyncHandler(async (req, res) => {
  const row = await ProgressReport.findByPk(req.params.id, { include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }, { model: User, as: 'mentor', attributes: ['id', 'name'] }] });
  if (!row) return res.status(404).json({ success: false, message: 'Progress report not found.' });
  await assertStudentAccess(req.user, row.studentId);
  sendData(res, row);
});
export const createProgress = asyncHandler(async (req, res) => {
  const studentId = req.user.role === 'student' ? req.user.id : Number(req.body.studentId);
  if (req.user.role !== 'student') return res.status(403).json({ success: false, message: 'Only students can submit progress reports.' });
  const mentorId = await activeMentorFor(studentId);
  const row = await ProgressReport.create({ studentId, mentorId, academicPerformance: req.body.academicPerformance, achievements: req.body.achievements, challenges: req.body.challenges, remarks: null });
  sendData(res, row, 201);
});
export const updateProgress = asyncHandler(async (req, res) => {
  const row = await ProgressReport.findByPk(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: 'Progress report not found.' });
  await assertStudentAccess(req.user, row.studentId);
  if (req.user.role === 'mentor') await row.update({ remarks: req.body.remarks, mentorId: req.user.id });
  else if (req.user.role === 'student' && row.studentId === req.user.id) {
    if (row.submittedAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) return res.status(400).json({ success: false, message: 'Reports can only be edited within 24 hours of submission.' });
    await row.update({ academicPerformance: req.body.academicPerformance ?? row.academicPerformance, achievements: req.body.achievements ?? row.achievements, challenges: req.body.challenges ?? row.challenges });
  } else return res.status(403).json({ success: false, message: 'You cannot edit this report.' });
  sendData(res, row);
});
export const deleteProgress = asyncHandler(async (req, res) => {
  const row = await ProgressReport.findByPk(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: 'Progress report not found.' });
  await assertStudentAccess(req.user, row.studentId);
  if (req.user.role !== 'admin' && !(req.user.role === 'student' && row.studentId === req.user.id)) return res.status(403).json({ success: false, message: 'You cannot delete this report.' });
  await row.destroy(); sendData(res, { message: 'Report deleted.' });
});
