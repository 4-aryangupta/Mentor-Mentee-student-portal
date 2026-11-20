import sequelize from '../config/db.js';
import { QueryTypes } from 'sequelize';
import { User, Mentorship, ProgressReport, Session } from '../models/index.js';
import { asyncHandler, sendData } from '../utils/serializers.js';

export const dashboard = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const id = req.user.id;
  const sessionScope = role === 'mentor' ? 'WHERE mentor_id = :id AND student_id IN (SELECT student_id FROM mentorships WHERE mentor_id = :id AND status = \'active\')' : role === 'student' ? 'WHERE student_id = :id' : '';
  const reportScope = role === 'mentor' ? 'WHERE student_id IN (SELECT student_id FROM mentorships WHERE mentor_id = :id AND status = \'active\')' : role === 'student' ? 'WHERE student_id = :id' : '';
  const common = { replacements: { id }, type: QueryTypes.SELECT };
  const [students, mentors, activeAssignments, sessionsByStatus, reportsByMonth, activeStudentsByMentor] = await Promise.all([
    role === 'admin' ? User.count({ where: { role: 'student', isActive: true } }) : role === 'mentor' ? Mentorship.count({ where: { mentorId: id, status: 'active' } }) : Promise.resolve(1),
    role === 'admin' ? User.count({ where: { role: 'mentor', isActive: true } }) : Promise.resolve(role === 'mentor' ? 1 : 0),
    role === 'admin' ? Mentorship.count({ where: { status: 'active' } }) : role === 'mentor' ? Mentorship.count({ where: { mentorId: id, status: 'active' } }) : Mentorship.count({ where: { studentId: id, status: 'active' } }),
    sequelize.query(`SELECT status, COUNT(*) AS total FROM sessions ${sessionScope} GROUP BY status ORDER BY status`, common),
    sequelize.query(`SELECT DATE_FORMAT(submitted_at, '%Y-%m') AS month, COUNT(*) AS total FROM progress_reports ${reportScope} GROUP BY DATE_FORMAT(submitted_at, '%Y-%m') ORDER BY month DESC LIMIT 6`, common),
    role === 'admin' ? sequelize.query("SELECT u.id AS mentor_id, u.name AS mentor_name, COUNT(m.id) AS active_students FROM users u LEFT JOIN mentorships m ON m.mentor_id = u.id AND m.status = 'active' WHERE u.role = 'mentor' AND u.is_active = 1 GROUP BY u.id, u.name ORDER BY active_students DESC, u.name", { type: QueryTypes.SELECT }) : Promise.resolve([])
  ]);
  const currentMentorships = role === 'mentor' ? await Mentorship.findAll({ where: { mentorId: id, status: 'active' }, attributes: ['studentId'] }) : [];
  const upcomingWhere = role === 'mentor' ? { mentorId: id, studentId: currentMentorships.length ? currentMentorships.map((link) => link.studentId) : -1, status: 'scheduled' } : role === 'student' ? { studentId: id, status: 'scheduled' } : { status: 'scheduled' };
  const upcomingSessions = await Session.findAll({ where: upcomingWhere, limit: 5, order: [['sessionDate', 'ASC']], include: [{ model: User, as: 'student', attributes: ['id', 'name'] }, { model: User, as: 'mentor', attributes: ['id', 'name'] }] });
  let reportWhere = role === 'student' ? { studentId: id } : {};
  if (role === 'mentor') {
    const assigned = await Mentorship.findAll({ where: { mentorId: id, status: 'active' }, attributes: ['studentId'] });
    reportWhere = { studentId: assigned.length ? assigned.map((link) => link.studentId) : -1 };
  }
  const latestReports = await ProgressReport.findAll({ where: reportWhere, limit: 5, order: [['submittedAt', 'DESC']], include: [{ model: User, as: 'student', attributes: ['id', 'name'] }] });
  sendData(res, { role, stats: { students, mentors, activeAssignments }, sessionsByStatus, reportsByMonth, activeStudentsByMentor, upcomingSessions, latestReports });
});
