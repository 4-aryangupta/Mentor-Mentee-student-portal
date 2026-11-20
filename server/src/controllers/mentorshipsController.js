import { Op } from 'sequelize';
import sequelize from '../config/db.js';
import { User, Mentorship } from '../models/index.js';
import { asyncHandler, sendData } from '../utils/serializers.js';

const includeUsers = [{ model: User, as: 'mentor', attributes: ['id', 'name', 'email', 'department'] }, { model: User, as: 'student', attributes: ['id', 'name', 'email', 'department'] }];
export const listMentorships = asyncHandler(async (req, res) => {
  const where = {};
  if (req.user.role === 'mentor') where.mentorId = req.user.id;
  if (req.user.role === 'student') where.studentId = req.user.id;
  if (req.query.status && ['active', 'completed'].includes(req.query.status)) where.status = req.query.status;
  const rows = await Mentorship.findAll({ where, include: includeUsers, order: [['assignedAt', 'DESC']] });
  sendData(res, rows);
});
export const getMentorship = asyncHandler(async (req, res) => {
  const row = await Mentorship.findByPk(req.params.id, { include: includeUsers });
  if (!row) return res.status(404).json({ success: false, message: 'Assignment not found.' });
  if (req.user.role === 'mentor' && row.mentorId !== req.user.id) return res.status(403).json({ success: false, message: 'You cannot view this assignment.' });
  if (req.user.role === 'student' && row.studentId !== req.user.id) return res.status(403).json({ success: false, message: 'You cannot view this assignment.' });
  sendData(res, row);
});
export const createMentorship = asyncHandler(async (req, res) => {
  const { mentorId, studentId } = req.body;
  const [mentor, student] = await Promise.all([User.findByPk(mentorId), User.findByPk(studentId)]);
  if (!mentor || mentor.role !== 'mentor' || !mentor.isActive) return res.status(400).json({ success: false, message: 'Choose an active mentor account.' });
  if (!student || student.role !== 'student' || !student.isActive) return res.status(400).json({ success: false, message: 'Choose an active student account.' });
  const result = await sequelize.transaction(async (transaction) => {
    await Mentorship.update({ status: 'completed' }, { where: { studentId, status: 'active' }, transaction });
    return Mentorship.create({ mentorId, studentId, status: 'active', assignedAt: new Date() }, { transaction });
  });
  const hydrated = await Mentorship.findByPk(result.id, { include: includeUsers });
  sendData(res, hydrated, 201);
});
export const updateMentorship = asyncHandler(async (req, res) => {
  const row = await Mentorship.findByPk(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: 'Assignment not found.' });
  if (req.body.status === 'active') {
    const [mentor, student] = await Promise.all([User.findByPk(row.mentorId), User.findByPk(row.studentId)]);
    if (!mentor?.isActive || mentor.role !== 'mentor' || !student?.isActive || student.role !== 'student') return res.status(400).json({ success: false, message: 'Only active mentor and student accounts can be assigned.' });
  }
  if (req.body.status && !['active', 'completed'].includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid assignment status.' });
  if (req.body.status === 'active') {
    await sequelize.transaction(async (transaction) => {
      await Mentorship.update({ status: 'completed' }, { where: { studentId: row.studentId, status: 'active', id: { [Op.ne]: row.id } }, transaction });
      await row.update({ status: 'active' }, { transaction });
    });
  } else await row.update({ status: req.body.status || 'completed' });
  sendData(res, await Mentorship.findByPk(row.id, { include: includeUsers }));
});
export const deleteMentorship = asyncHandler(async (req, res) => {
  const row = await Mentorship.findByPk(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: 'Assignment not found.' });
  await row.update({ status: 'completed' });
  sendData(res, { id: row.id, status: 'completed', message: 'Assignment closed. History retained.' });
});
