import { Mentorship } from '../models/index.js';

export const hasActiveAssignment = async (mentorId, studentId) => Boolean(await Mentorship.findOne({
  where: { mentorId, studentId, status: 'active' }, attributes: ['id']
}));

export const assertStudentAccess = async (user, studentId) => {
  const id = Number(studentId);
  if (!Number.isInteger(id) || id < 1) {
    const error = new Error('A valid student ID is required.'); error.statusCode = 400; throw error;
  }
  if (user.role === 'admin' || (user.role === 'student' && user.id === id)) return;
  if (user.role === 'mentor' && await hasActiveAssignment(user.id, id)) return;
  const error = new Error('You do not have access to this student.'); error.statusCode = 403; throw error;
};

export const activeMentorFor = async (studentId) => {
  const assignment = await Mentorship.findOne({ where: { studentId, status: 'active' }, attributes: ['mentorId'] });
  return assignment?.mentorId || null;
};
