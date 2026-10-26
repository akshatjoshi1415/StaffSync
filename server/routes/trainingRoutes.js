const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  getTrainings,
  createTraining,
  updateTraining,
  deleteTraining
} = require('../controllers/trainingController');

router.use(authenticate);

// View training programs (All roles)
router.get('/', getTrainings);

// Manager & HR training management
router.post('/', authorize('manager', 'hr'), createTraining);
router.put('/:id', authorize('manager', 'hr'), updateTraining);
router.delete('/:id', authorize('manager', 'hr'), deleteTraining);

module.exports = router;
