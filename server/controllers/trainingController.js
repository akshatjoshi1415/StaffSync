const Training = require('../models/Training');

/**
 * Get all training programs (All authenticated users)
 * @route GET /api/trainings
 */
const getTrainings = async (req, res, next) => {
  try {
    const trainings = await Training.find()
      .populate('createdBy', 'fullName email role')
      .sort({ schedule: 1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      trainings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create training program (Manager or HR)
 * @route POST /api/trainings
 */
const createTraining = async (req, res, next) => {
  try {
    const { title, description, schedule, department } = req.body;

    if (!title || !description || !schedule) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and scheduled date.'
      });
    }

    const training = await Training.create({
      title: title.trim(),
      description: description.trim(),
      schedule: new Date(schedule),
      department: department ? department.trim() : 'All Departments',
      createdBy: req.user._id
    });

    const populated = await Training.findById(training._id).populate('createdBy', 'fullName email role');

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      training: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update training program (Manager or HR)
 * @route PUT /api/trainings/:id
 */
const updateTraining = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, schedule, department } = req.body;

    const training = await Training.findById(id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.'
      });
    }

    if (title) training.title = title.trim();
    if (description) training.description = description.trim();
    if (schedule) training.schedule = new Date(schedule);
    if (department) training.department = department.trim();

    await training.save();

    const populated = await Training.findById(training._id).populate('createdBy', 'fullName email role');

    res.status(200).json({
      success: true,
      message: 'Training program updated successfully',
      training: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete training program (Manager or HR)
 * @route DELETE /api/trainings/:id
 */
const deleteTraining = async (req, res, next) => {
  try {
    const { id } = req.params;

    const training = await Training.findById(id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.'
      });
    }

    await Training.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Training program deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrainings,
  createTraining,
  updateTraining,
  deleteTraining
};
