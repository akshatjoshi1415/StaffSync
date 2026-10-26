const Announcement = require('../models/Announcement');

/**
 * Get all announcements (All authenticated users)
 * @route GET /api/announcements
 */
const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate('author', 'fullName email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create announcement (HR only)
 * @route POST /api/announcements
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content for the announcement.'
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      author: req.user._id
    });

    const populated = await Announcement.findById(announcement._id).populate('author', 'fullName email role');

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      announcement: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update announcement (HR only)
 * @route PUT /api/announcements/:id
 */
const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.'
      });
    }

    if (title) announcement.title = title.trim();
    if (content) announcement.content = content.trim();

    await announcement.save();

    const populated = await Announcement.findById(announcement._id).populate('author', 'fullName email role');

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete announcement (HR only)
 * @route DELETE /api/announcements/:id
 */
const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.'
      });
    }

    await Announcement.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};
