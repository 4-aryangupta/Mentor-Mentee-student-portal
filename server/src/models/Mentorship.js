import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Mentorship = sequelize.define('Mentorship', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  mentorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'mentor_id' },
  studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'student_id' },
  assignedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'assigned_at' },
  status: { type: DataTypes.ENUM('active', 'completed'), allowNull: false, defaultValue: 'active' }
}, { tableName: 'mentorships', timestamps: false, indexes: [{ fields: ['mentor_id', 'status'] }, { fields: ['student_id', 'status'] }] });

export default Mentorship;
