const Event = require('../models/Event');
const responseFormatter = require('../utils/responseFormatter');

const createEvent = async (req, res) => {
  try {
    console.log(req.role);
    if (req.role !== 'organizer' && req.role !== 'admin') {
      return res
        .status(403)
        .json(responseFormatter({}, 403, 'Only organizers or admins can create events'));
    }

    const {
      title,
      description,
      date,
      time,
      location,
      capacity,
      ticketPrice,
      category,
      imageUrl
    } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      capacity,
      ticketPrice,
      category,
      imageUrl,
      organizer: req.userId
    });

    res
      .status(201)
      .json(responseFormatter(event, 201, 'Event created successfully'));
  } catch (error) {
    res
      .status(400)
      .json(responseFormatter({}, 400, `Error: ${error.message}`));
  }
};

const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filterOptions = {};
    if (req.query.category) filterOptions.category = req.query.category;
    if (req.query.date) filterOptions.date = req.query.date;

    if (req.query.startDate && req.query.endDate) {
      filterOptions.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    if (req.query.search) {
      filterOptions.title = { $regex: req.query.search, $options: 'i' };
    }

    const events = await Event.find(filterOptions)
      .populate('organizer', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ date: 1 });

    const total = await Event.countDocuments(filterOptions);

    res.status(200).json(responseFormatter({
      events,
      page,
      pages: Math.ceil(total / limit),
      total
    }, 200, 'Events fetched successfully'));
  } catch (error) {
    res.status(500).json(responseFormatter({}, 500, `Error: ${error.message}`));
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json(responseFormatter({}, 404, 'Event not found'));
    }

    res.status(200).json(responseFormatter(event, 200, 'Event retrieved successfully'));
  } catch (error) {
    res.status(404).json(responseFormatter({}, 404, `Error: ${error.message}`));
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json(responseFormatter({}, 404, 'Event not found'));
    }

    if (event.organizer.toString() !== req.userId.toString()) {
      return res.status(403).json(responseFormatter({}, 403, 'User not authorized to update this event'));
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(responseFormatter(updatedEvent, 200, 'Event updated successfully'));
  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json(responseFormatter({}, statusCode, `Error: ${error.message}`));
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json(responseFormatter({}, 404, 'Event not found'));
    }

    if (req.role !== 'admin' && event.organizer.toString() !== req.userId.toString()) {
      return res.status(403).json(responseFormatter({}, 403, 'User not authorized to delete this event'));
    }

    await event.deleteOne();
    res.status(200).json(responseFormatter({}, 200, 'Event removed'));
  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json(responseFormatter({}, statusCode, `Error: ${error.message}`));
  }
};

const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.userId });
    res.status(200).json(responseFormatter(events, 200, 'My events retrieved successfully'));
  } catch (error) {
    res.status(500).json(responseFormatter({}, 500, `Error: ${error.message}`));
  }
};

const getAllEventsIncludingPast = async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json(
        responseFormatter({}, 403, "Not authorized to access all events")
      );
    }

    const events = await Event.find({ showPastEvents: true })
      .populate('organizer', 'name');

    res.status(200).json(
      responseFormatter(
        events,
        200,
        "All events retrieved successfully, including past events"
      )
    );
  } catch (error) {
    res.status(500).json(
      responseFormatter({}, 500, `Error: ${error.message}`)
    );
  }
};

const getArchivedEvents = async (req, res) => {
  try {
    const events = await Event.find({
      organizer: req.userId,
      date: { $lt: new Date() }
    }).populate('organizer', 'name');

    res.status(200).json(
      responseFormatter(
        events,
        200,
        "Archived events retrieved successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      responseFormatter({}, 500, `Error: ${error.message}`)
    );
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getAllEventsIncludingPast,
  getArchivedEvents
};
