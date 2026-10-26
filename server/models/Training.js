const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Training title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Training description is required'],
      trim: true
    },
    schedule: {
      type: Date,
      required: [true, 'Training schedule date is required']
    },
    department: {
      type: String,
      trim: true,
      default: 'All Departments'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required']
    }
  },
  {
    timestamps: true
  }
);

const Training = mongoose.model('Training', trainingSchema);

module.exports = Training;
