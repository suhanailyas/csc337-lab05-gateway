const router = require('express').Router();
const User = require('../models/User');
const { authenticate, checkRole } = require('../middleware/auth');

router.get('/employee/profile', authenticate,
  checkRole(['SuperAdmin', 'Manager', 'Employee']),
  async (req, res) => {
    const u = await User.findById(req.user.sub).select('-password -refreshTokens');
    res.json(u);
  });

router.post('/payroll/approve', authenticate,
  checkRole(['Manager', 'SuperAdmin']),
  (req, res) => res.json({ message: 'Payroll approved' }));

router.delete('/users/:id', authenticate,
  checkRole(['SuperAdmin']),
  async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  });

module.exports = router;