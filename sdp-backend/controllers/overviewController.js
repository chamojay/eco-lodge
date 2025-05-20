const pool = require('../config/db');

const getOverviewData = async (req, res) => {
  const { range } = req.query;
  const connection = await pool.getConnection();

  try {
    // Calculate date range
    const today = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'weekly':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(today.getMonth() - 1);
        break;
      default: // daily
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    // Updated revenue query with COALESCE and proper type casting
    const [revenue] = await connection.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN p.Source = 'Reception' THEN CAST(p.Amount AS DECIMAL(10,2)) ELSE 0 END), 0) as RoomRevenue,
        COALESCE(SUM(CASE WHEN p.Source = 'Restaurant' THEN CAST(p.Amount AS DECIMAL(10,2)) ELSE 0 END), 0) as RestaurantRevenue,
        COALESCE((
          SELECT SUM(CAST(Amount AS DECIMAL(10,2))) 
          FROM reservation_activities 
          WHERE CreatedAt >= ?
        ), 0) as ActivityRevenue,
        COALESCE((
          SELECT SUM(CAST(Amount AS DECIMAL(10,2))) 
          FROM extra_charges 
          WHERE CreatedAt >= ?
        ), 0) as ExtraCharges
      FROM payments p
      WHERE p.PaymentDate >= ?
    `, [startDate, startDate, startDate]);

    // Updated bookings query with proper type casting
    const [bookings] = await connection.query(`
      SELECT 
        COUNT(*) as Total,
        CAST(SUM(CASE WHEN Room_Status = 'Confirmed' THEN 1 ELSE 0 END) AS UNSIGNED) as Confirmed,
        CAST(SUM(CASE WHEN Room_Status = 'Pending' THEN 1 ELSE 0 END) AS UNSIGNED) as Pending,
        CAST(SUM(CASE WHEN Room_Status = 'Cancelled' THEN 1 ELSE 0 END) AS UNSIGNED) as Cancelled
      FROM reservations
      WHERE CreatedAt >= ?
    `, [startDate]);

    // Get popular activities
    const [activities] = await connection.query(`
      SELECT 
        a.Name,
        COUNT(*) as Count
      FROM reservation_activities ra
      JOIN activities a ON ra.ActivityID = a.ActivityID
      WHERE ra.CreatedAt >= ?
      GROUP BY a.ActivityID
      ORDER BY Count DESC
      LIMIT 5
    `, [startDate]);

    // Updated restaurant query with COALESCE and proper type casting
    const [restaurant] = await connection.query(`
      SELECT 
        COALESCE(COUNT(DISTINCT OrderID), 0) as TotalOrders,
        COALESCE(SUM(CAST(TotalAmount AS DECIMAL(10,2))), 0) as Revenue,
        COALESCE((
          SELECT COUNT(*) 
          FROM restaurant_order_items roi
          WHERE roi.OrderID IN (
            SELECT OrderID 
            FROM restaurant_orders 
            WHERE OrderDate >= ?
          )
        ), 0) as ItemsSold
      FROM restaurant_orders
      WHERE OrderDate >= ?
    `, [startDate, startDate]);

    // Updated occupancy query with proper type casting
    const [occupancy] = await connection.query(`
      SELECT 
        CAST(
          (COUNT(DISTINCT r.RoomID) * 100.0 / NULLIF((SELECT COUNT(*) FROM rooms), 0)
        ) AS DECIMAL(5,2)) as OccupancyRate
      FROM reservations r
      WHERE r.Room_Status = 'Confirmed'
        AND CURRENT_DATE BETWEEN r.CheckInDate AND r.CheckOutDate
    `);

    // Ensure all values are properly formatted before sending response
    const responseData = {
      timeRange: range,
      revenue: {
        rooms: Number(revenue[0]?.RoomRevenue || 0),
        activities: Number(revenue[0]?.ActivityRevenue || 0),
        restaurant: Number(revenue[0]?.RestaurantRevenue || 0),
        extraCharges: Number(revenue[0]?.ExtraCharges || 0),
        total: 0  // Will be calculated below
      },
      bookings: {
        total: Number(bookings[0]?.Total || 0),
        confirmed: Number(bookings[0]?.Confirmed || 0),
        pending: Number(bookings[0]?.Pending || 0),
        cancelled: Number(bookings[0]?.Cancelled || 0)
      },
      activities: {
        popular: activities.map(a => ({
          name: a.Name,
          count: Number(a.Count)
        })),
        revenue: Number(revenue[0]?.ActivityRevenue || 0),
        upcoming: 0
      },
      restaurant: {
        orders: Number(restaurant[0]?.TotalOrders || 0),
        revenue: Number(restaurant[0]?.Revenue || 0),
        itemsSold: Number(restaurant[0]?.ItemsSold || 0),
        popularItems: []
      },
      occupancyRate: Number(occupancy[0]?.OccupancyRate || 0)
    };

    // Calculate total revenue
    responseData.revenue.total = responseData.revenue.rooms +
                                responseData.revenue.activities +
                                responseData.revenue.restaurant +
                                responseData.revenue.extraCharges;

    // Debug log
    console.log('Sending response:', responseData);

    res.json(responseData);

  } catch (error) {
    console.error('Error fetching overview data:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getOverviewData
};