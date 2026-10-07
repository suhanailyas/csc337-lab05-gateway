require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const accounts = [
    ['Super Admin', 'superadmin@test.com', 'SuperAdmin', 'Admin@12345'],
    ['Manager User', 'manager@test.com', 'Manager', 'Manager@12345'],
    ['Employee User', 'employee@test.com', 'Employee', 'Employee@12345'],
  ];
  for (const [name, email, role, pw] of accounts) {
    await User.deleteOne({ email });
    await User.create({ name, email, role, password: await bcrypt.hash(pw, 12) });
  }
  console.log('Seeded'); process.exit(0);
})();