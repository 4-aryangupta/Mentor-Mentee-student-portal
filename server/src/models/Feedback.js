import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Feedback = sequelize.define('Feedback', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  mentorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'mentor_id' },
  studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'student_id' },
  message: { type: DataTypes.TEXT, allowNull: false },
  rating: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, validate: { min: 1, max: 5 } },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' }
}, { tableName: 'feedback', timestamps: false, indexes: [{ fields: ['student_id', 'created_at'] }, { fields: ['mentor_id', 'created_at'] }] });

export default Feedback;
