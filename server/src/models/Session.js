import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Session = sequelize.define('Session', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  mentorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'mentor_id' },
  studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'student_id' },
  sessionDate: { type: DataTypes.DATE, allowNull: false, field: 'session_date' },
  topic: { type: DataTypes.STRING(180), allowNull: false },
  status: { type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'), allowNull: false, defaultValue: 'scheduled' },
  meetingNotes: { type: DataTypes.TEXT, allowNull: true, field: 'meeting_notes' }
}, { tableName: 'sessions', timestamps: true, indexes: [{ fields: ['mentor_id', 'session_date'] }, { fields: ['student_id', 'session_date'] }] });

export default Session;
