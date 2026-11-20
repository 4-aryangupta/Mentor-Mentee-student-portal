import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import sequelize from '../src/config/db.js';
import { User, Mentorship, ProgressReport, Session, Feedback } from '../src/models/index.js';

const main = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
  const passwordMap = { admin: 'Admin@123', mentor: 'Mentor@123', student: 'Student@123' };
  const passwordHash = {};
  for (const role of Object.keys(passwordMap)) passwordHash[role] = await bcrypt.hash(passwordMap[role], 12);
  const makeUser = async (name, email, role, department, phone) => {
    const [user] = await User.findOrCreate({ where: { email }, defaults: { name, email, role, department, phone, passwordHash: passwordHash[role], isActive: true } });
    return user;
  };
  const admin = await makeUser('Portal Administrator', 'admin@portal.edu', 'admin', 'Computer Science', '9876500001');
  const mentors = await Promise.all([
    makeUser('Dr. Meera Sharma', 'mentor1@portal.edu', 'mentor', 'Information Technology', '9876500011'),
    makeUser('Prof. Arjun Rathore', 'mentor2@portal.edu', 'mentor', 'Computer Science', '9876500012'),
    makeUser('Ms. Kavya Iyer', 'mentor3@portal.edu', 'mentor', 'Information Technology', '9876500013')
  ]);
  const names = [
    ['Aarav Gupta', 'Jaipur'], ['Ananya Sharma', 'Jaipur'], ['Vivaan Mehta', 'Ajmer'], ['Ishita Verma', 'Kota'],
    ['Aditya Singh', 'Jodhpur'], ['Diya Patel', 'Udaipur'], ['Reyansh Joshi', 'Jaipur'], ['Saanvi Kapoor', 'Alwar'],
    ['Kabir Malhotra', 'Bikaner'], ['Myra Nair', 'Jaipur']
  ];
  const students = [];
  for (let i = 0; i < names.length; i++) students.push(await makeUser(names[i][0], `student${i + 1}@portal.edu`, 'student', 'Information Technology', `987${String(6500020 + i).padStart(7, '0')}`));
  const groups = [[0, 1, 2, 3], [4, 5, 6], [7, 8, 9]];
  for (let m = 0; m < mentors.length; m++) {
    for (const idx of groups[m]) {
      await Mentorship.findOrCreate({ where: { mentorId: mentors[m].id, studentId: students[idx].id, status: 'active' }, defaults: { assignedAt: new Date(Date.now() - (idx + 2) * 86400000) } });
    }
  }
  const reportNotes = [
    ['Completed DBMS normalization exercises and improved quiz score to 82%.', 'Finished a React dashboard mini-project.', 'Need more practice with SQL joins.'],
    ['Maintained a consistent 8.1 SGPA this term.', 'Presented a paper at the department seminar.', 'Balancing lab work and DSA preparation.'],
    ['Completed CN assignments and a packet tracer lab.', 'Built a small REST API for practice.', 'Would like guidance on internship preparation.']
  ];
  for (let i = 0; i < students.length; i++) {
    const mentor = mentors[groups.findIndex((g) => g.includes(i))];
    await ProgressReport.findOrCreate({ where: { studentId: students[i].id, academicPerformance: reportNotes[i % 3][0] }, defaults: { mentorId: mentor.id, achievements: reportNotes[i % 3][1], challenges: reportNotes[i % 3][2], remarks: i % 2 ? 'Good progress. Keep a weekly revision slot.' : null, submittedAt: new Date(Date.now() - (i + 1) * 86400000) } });
    const date = new Date(); date.setDate(date.getDate() + (i === 2 ? -2 : (i % 5) + 1)); date.setHours(10 + (i % 4), 0, 0, 0);
    await Session.findOrCreate({ where: { studentId: students[i].id, topic: ['Semester progress review', 'Internship roadmap', 'Project discussion'][i % 3] }, defaults: { mentorId: mentor.id, sessionDate: date, status: i === 2 ? 'completed' : 'scheduled', meetingNotes: i === 2 ? 'Reviewed the semester plan and agreed on next steps.' : null } });
    if (i < 6) await Feedback.findOrCreate({ where: { studentId: students[i].id, message: `You are making steady progress, ${students[i].name.split(' ')[0]}. Keep your goals measurable and review them every week.` }, defaults: { mentorId: mentor.id, rating: 4 + (i % 2), createdAt: new Date(Date.now() - i * 3600000) } });
  }
  console.log('Seed complete. Demo credentials:');
  console.log(`Admin: ${admin.email} / ${passwordMap.admin}`);
  console.log('Mentors: mentor1@portal.edu, mentor2@portal.edu, mentor3@portal.edu / Mentor@123');
  console.log('Students: student1@portal.edu through student10@portal.edu / Student@123');
  await sequelize.close();
};
main().catch(async (error) => { console.error(error.message); await sequelize.close(); process.exit(1); });
