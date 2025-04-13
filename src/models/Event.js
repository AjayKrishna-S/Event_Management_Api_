const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  time: {
    type: String,
    required: [true, 'Please add a time']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  capacity: {
    type: Number,
    required: [true, 'Please add a capacity']
  },
  ticketPrice: {
    type: Number,
    required: [true, 'Please add a ticket price']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


eventSchema.virtual('isPast').get(function() {
  return new Date(this.date) < new Date();
});

eventSchema.pre(/^find/, function(next) {
  if (!this._conditions.date && !this._conditions.showPastEvents) {
    this.find({ date: { $gte: new Date() } });
  }
  
  if (this._conditions.showPastEvents !== undefined) {
    delete this._conditions.showPastEvents;
  }

  next();
});

module.exports = mongoose.model('Event', eventSchema);
