import User from './User.js';
import Mentorship from './Mentorship.js';
import ProgressReport from './ProgressReport.js';
import Session from './Session.js';
import Feedback from './Feedback.js';

User.hasMany(Mentorship, { as: 'mentorAssignments', foreignKey: 'mentorId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
User.hasMany(Mentorship, { as: 'studentAssignments', foreignKey: 'studentId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Mentorship.belongsTo(User, { as: 'mentor', foreignKey: 'mentorId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Mentorship.belongsTo(User, { as: 'student', foreignKey: 'studentId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
User.hasMany(ProgressReport, { as: 'progressReports', foreignKey: 'studentId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
ProgressReport.belongsTo(User, { as: 'student', foreignKey: 'studentId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
ProgressReport.belongsTo(User, { as: 'mentor', foreignKey: 'mentorId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
User.hasMany(Session, { as: 'mentorSessions', foreignKey: 'mentorId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
User.hasMany(Session, { as: 'studentSessions', foreignKey: 'studentId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Session.belongsTo(User, { as: 'mentor', foreignKey: 'mentorId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Session.belongsTo(User, { as: 'student', foreignKey: 'studentId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
User.hasMany(Feedback, { as: 'receivedFeedback', foreignKey: 'studentId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Feedback.belongsTo(User, { as: 'student', foreignKey: 'studentId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Feedback.belongsTo(User, { as: 'mentor', foreignKey: 'mentorId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

export { User, Mentorship, ProgressReport, Session, Feedback };
