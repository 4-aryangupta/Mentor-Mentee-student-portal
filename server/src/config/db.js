import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'mentor_mentee_portal',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? false : false,
    define: { underscored: true, freezeTableName: true },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: { decimalNumbers: true }
  }
);

export default sequelize;
