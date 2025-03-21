const db = require('../config/db');

exports.getRoomStatus = async (req, res) => {
  try {
    const { RoomID } = req.params;
    const [status] = await db.execute(
      `SELECT * FROM room_status_history WHERE RoomID = ? ORDER BY StartDate DESC LIMIT 1`,
      [RoomID]
    );
    res.json(status.length ? status[0] : { message: 'No status found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
