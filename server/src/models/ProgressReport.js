import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ProgressReport = sequelize.define('ProgressReport', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'student_id' },
  mentorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'mentor_id' },
  academicPerformance: { type: DataTypes.TEXT, allowNull: false, field: 'academic_performance' },
  achievements: { type: DataTypes.TEXT, allowNull: true },
  challenges: { type: DataTypes.TEXT, allowNull: true },
  remarks: { type: DataTypes.TEXT, allowNull: true },
  submittedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'submitted_at' }
}, { tableName: 'progress_reports', timestamps: false, indexes: [{ fields: ['student_id', 'submitted_at'] }] });

export default ProgressReport;
