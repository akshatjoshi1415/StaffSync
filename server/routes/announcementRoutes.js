const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');

router.use(authenticate);

// View announcements (All roles)
router.get('/', getAnnouncements);

// HR management endpoints
router.post('/', authorize('hr'), createAnnouncement);
router.put('/:id', authorize('hr'), updateAnnouncement);
router.delete('/:id', authorize('hr'), deleteAnnouncement);

module.exports = router;
