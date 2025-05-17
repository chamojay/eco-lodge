const pool = require('../config/db');
const axios = require('axios');

// --- Activities CRUD Operations ---

// Create a new activity
const createActivity = async (req, res) => {
  try {
    const { name, description, localPrice, foreignPrice } = req.body;

    // Validate input
    if (!name || !localPrice || !foreignPrice) {
      return res.status(400).json({ error: 'Name, localPrice, and foreignPrice are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO activities (Name, Description, LocalPrice, ForeignPrice) VALUES (?, ?, ?, ?)',
      [name, description || null, parseFloat(localPrice), parseFloat(foreignPrice)]
    );

    const activity = {
      ActivityID: result.insertId,
      Name: name,
      Description: description,
      LocalPrice: parseFloat(localPrice),
      ForeignPrice: parseFloat(foreignPrice),
    };

    res.status(201).json({ message: 'Activity created successfully', activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
};

// Get all activities
const getAllActivities = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM activities');
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

// Get a single activity by ID
const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM activities WHERE ActivityID = ?', [parseInt(id)]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};

// Update an activity
const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, localPrice, foreignPrice } = req.body;

    // Validate input
    if (!name || !localPrice || !foreignPrice) {
      return res.status(400).json({ error: 'Name, localPrice, and foreignPrice are required' });
    }

    const [result] = await pool.execute(
      'UPDATE activities SET Name = ?, Description = ?, LocalPrice = ?, ForeignPrice = ? WHERE ActivityID = ?',
      [name, description || null, parseFloat(localPrice), parseFloat(foreignPrice), parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const activity = { ActivityID: parseInt(id), Name: name, Description: description, LocalPrice: parseFloat(localPrice), ForeignPrice: parseFloat(foreignPrice) };
    res.status(200).json({ message: 'Activity updated successfully', activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
};

// Delete an activity
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM activities WHERE ActivityID = ?', [parseInt(id)]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'Cannot delete activity with associated reservations' });
    }
    res.status(500).json({ error: 'Failed to delete activity' });
  }
};

// --- Reservation Activities CRUD Operations ---

// Add an activity to a reservation
const addActivityToReservation = async (req, res) => {
  try {
    const { reservationId, activityId, scheduledDate, participants } = req.body;

    // Validate input
    if (!reservationId || !activityId || !scheduledDate || !participants) {
      return res.status(400).json({ error: 'Reservation ID, Activity ID, Scheduled Date, and Participants are required' });
    }
    if (!Number.isInteger(participants) || participants < 1) {
      return res.status(400).json({ error: 'Participants must be a positive integer' });
    }

    // Fetch reservation and associated customer
    const [reservations] = await pool.execute(
      'SELECT r.*, c.Country FROM reservations r JOIN customers c ON r.CustomerID = c.CustomerID WHERE r.ReservationID = ?',
      [parseInt(reservationId)]
    );

    if (reservations.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = reservations[0];

    // Fetch activity
    const [activities] = await pool.execute('SELECT * FROM activities WHERE ActivityID = ?', [parseInt(activityId)]);

    if (activities.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const activity = activities[0];

    // Determine price based on customer's country
    const isLocal = reservation.Country === 'Sri Lanka';
    let totalPrice;

    if (isLocal) {
      totalPrice = activity.LocalPrice * participants;
    } else {
      try {
        // Fetch current exchange rate
        const API_KEY = 'd46d62b08eb9229e97a8cf52';
        const response = await axios.get(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
        );
        
        const exchangeRate = response.data.conversion_rates.LKR;
        if (!exchangeRate) {
          throw new Error('LKR exchange rate not found');
        }

        // Calculate total price in LKR for foreign customers
        const priceInUSD = activity.ForeignPrice * participants;
        totalPrice = priceInUSD * exchangeRate;
      } catch (error) {
        console.error('Exchange rate API error:', error);
        // Fallback exchange rate if API fails
        const fallbackRate = 320;
        totalPrice = activity.ForeignPrice * participants * fallbackRate;
      }
    }

    // Validate scheduled date
    const scheduled = new Date(scheduledDate);
    const checkIn = new Date(reservation.CheckInDate);
    const checkOut = new Date(reservation.CheckOutDate);

    if (scheduled < checkIn || scheduled > checkOut) {
      return res.status(400).json({ error: 'Scheduled date must be within reservation dates' });
    }

    // Insert reservation activity with converted amount
    const [result] = await pool.execute(
      'INSERT INTO reservation_activities (ReservationID, ActivityID, ScheduledDate, Amount, Participants) VALUES (?, ?, ?, ?, ?)',
      [parseInt(reservationId), parseInt(activityId), scheduledDate, parseFloat(totalPrice), parseInt(participants)]
    );

    const reservationActivity = {
      ReservationActivityID: result.insertId,
      ReservationID: parseInt(reservationId),
      ActivityID: parseInt(activityId),
      ScheduledDate: scheduledDate,
      Amount: parseFloat(totalPrice),
      Participants: parseInt(participants),
    };

    res.status(201).json({ message: 'Activity added to reservation', reservationActivity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add activity to reservation' });
  }
};

// Get all activities for a reservation
const getActivitiesForReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const query = `
      SELECT 
        ra.*,
        a.Name,
        a.Description,
        a.LocalPrice,
        a.ForeignPrice,
        c.Country
      FROM reservation_activities ra 
      JOIN activities a ON ra.ActivityID = a.ActivityID 
      JOIN reservations r ON ra.ReservationID = r.ReservationID
      JOIN customers c ON r.CustomerID = c.CustomerID
      WHERE ra.ReservationID = ?
    `;
    
    const [rows] = await pool.execute(query, [parseInt(reservationId)]);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reservation activities' });
  }
};

// Update a reservation activity
const updateReservationActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, amount, participants } = req.body;

    // Validate input
    if (!scheduledDate || !amount || !participants) {
      return res.status(400).json({ error: 'Scheduled Date, Amount, and Participants are required' });
    }
    if (!Number.isInteger(participants) || participants < 1) {
      return res.status(400).json({ error: 'Participants must be a positive integer' });
    }

    // Fetch reservation activity and associated reservation
    const [activities] = await pool.execute(
      'SELECT ra.*, r.CheckInDate, r.CheckOutDate FROM reservation_activities ra JOIN reservations r ON ra.ReservationID = r.ReservationID WHERE ra.ReservationActivityID = ?',
      [parseInt(id)]
    );

    if (activities.length === 0) {
      return res.status(404).json({ error: 'Reservation activity not found' });
    }

    const reservationActivity = activities[0];

    // Validate scheduled date
    const scheduled = new Date(scheduledDate);
    const checkIn = new Date(reservationActivity.CheckInDate);
    const checkOut = new Date(reservationActivity.CheckOutDate);

    if (scheduled < checkIn || scheduled > checkOut) {
      return res.status(400).json({ error: 'Scheduled date must be within reservation dates' });
    }

    // Update reservation activity
    const [result] = await pool.execute(
      'UPDATE reservation_activities SET ScheduledDate = ?, Amount = ?, Participants = ? WHERE ReservationActivityID = ?',
      [scheduledDate, parseFloat(amount), parseInt(participants), parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reservation activity not found' });
    }

    const updatedActivity = {
      ReservationActivityID: parseInt(id),
      ScheduledDate: scheduledDate,
      Amount: parseFloat(amount),
      Participants: parseInt(participants),
    };
    res.status(200).json({ message: 'Reservation activity updated', updatedActivity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update reservation activity' });
  }
};

// Delete a reservation activity
const deleteReservationActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM reservation_activities WHERE ReservationActivityID = ?', [parseInt(id)]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reservation activity not found' });
    }

    res.status(200).json({ message: 'Reservation activity deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete reservation activity' });
  }
};

module.exports = {
  createActivity,
  getAllActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  addActivityToReservation,
  getActivitiesForReservation,
  updateReservationActivity,
  deleteReservationActivity,
};