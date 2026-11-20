import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User, Mentorship } from '../models/index.js';
import { asyncHandler, safeUser, sendData } from '../utils/serializers.js';

export const listUsers = asyncHandler(async (req, res) => {
  let where = { isActive: true };
  if (req.user.role === 'mentor') {
    const rows = await Mentorship.findAll({ where: { mentorId: req.user.id, status: 'active' }, attributes: ['studentId'] });
    where.id = rows.length ? rows.map((r) => r.studentId) : -1;
    where.role = 'student';
  } else if (req.user.role === 'student') where.id = req.user.id;
  else if (req.query.role && ['admin', 'mentor', 'student'].includes(req.query.role)) where.role = req.query.role;
  if (req.query.search) where[Op.or] = [{ name: { [Op.like]: `%${req.query.search}%` } }, { email: { [Op.like]: `%${req.query.search}%` } }];
  const users = await User.findAll({ where, attributes: { exclude: ['passwordHash'] }, order: [['name', 'ASC']] });
  sendData(res, users.map(safeUser));
});

export const getUser = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (req.user.role === 'student' && req.user.id !== id) return res.status(403).json({ success: false, message: 'You can only view your own profile.' });
  if (req.user.role === 'mentor') {
    const assignment = await Mentorship.findOne({ where: { mentorId: req.user.id, studentId: id, status: 'active' } });
    if (!assignment && req.user.id !== id) return res.status(403).json({ success: false, message: 'This student is not assigned to you.' });
  }
  const user = await User.findByPk(id, { attributes: { exclude: ['passwordHash'] } });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  sendData(res, safeUser(user));
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, department } = req.body;
  const user = await User.create({ name: name.trim(), email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role, phone, department });
  sendData(res, safeUser(user), 201);
});

export const updateUser = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const target = await User.findByPk(id);
  if (!target) return res.status(404).json({ success: false, message: 'User not found.' });
  const self = req.user.id === id;
  if (req.user.role !== 'admin' && !self) return res.status(403).json({ success: false, message: 'You can only update your own profile.' });
  const allowed = self && req.user.role !== 'admin' ? ['name', 'phone', 'department'] : ['name', 'email', 'role', 'phone', 'department', 'isActive'];
  const changes = {};
  for (const key of allowed) if (req.body[key] !== undefined) changes[key] = req.body[key];
  if (changes.email) changes.email = changes.email.toLowerCase();
  if (req.body.password && (self || req.user.role === 'admin')) changes.passwordHash = await bcrypt.hash(req.body.password, 12);
  if (changes.role && changes.role !== target.role) {
    const hasHistory = await Mentorship.count({ where: { [Op.or]: [{ mentorId: target.id }, { studentId: target.id }] } });
    if (hasHistory) return res.status(400).json({ success: false, message: 'Role cannot be changed after mentorship history exists.' });
  }
  await target.update(changes);
  if (changes.isActive === false) await Mentorship.update({ status: 'completed' }, { where: { status: 'active', [target.role === 'mentor' ? 'mentorId' : 'studentId']: target.id } });
  sendData(res, safeUser(target));
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const target = await User.findByPk(Number(req.params.id));
  if (!target) return res.status(404).json({ success: false, message: 'User not found.' });
  if (target.role === 'admin') return res.status(400).json({ success: false, message: 'Admin accounts cannot be deactivated here.' });
  await target.update({ isActive: false });
  await Mentorship.update({ status: 'completed' }, { where: { status: 'active', [target.role === 'mentor' ? 'mentorId' : 'studentId']: target.id } });
  sendData(res, { id: target.id, isActive: false, message: 'Account deactivated. Historical records were retained.' });
});
