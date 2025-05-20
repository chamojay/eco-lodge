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
    // Update the revenue query to include web payments
    const [revenue] = await connection.query(`
      SELECT 
        COALESCE(SUM(CASE 
          WHEN p.Source IN ('Reception', 'Web') 
          THEN CAST(p.Amount AS DECIMAL(10,2)) 
          ELSE 0 
        END), 0) as RoomRevenue,
        COALESCE(SUM(CASE 
          WHEN p.Source = 'Restaurant' 
          THEN CAST(p.Amount AS DECIMAL(10,2)) 
          ELSE 0 
        END), 0) as RestaurantRevenue,
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

    // Updated restaurant query to include popular items
    const [restaurant] = await connection.query(`
      SELECT 
        COALESCE(COUNT(DISTINCT ro.OrderID), 0) as TotalOrders,
        COALESCE(SUM(CAST(ro.TotalAmount AS DECIMAL(10,2))), 0) as Revenue,
        COALESCE((
          SELECT COUNT(*) 
          FROM restaurant_order_items roi
          WHERE roi.OrderID IN (
            SELECT OrderID 
            FROM restaurant_orders 
            WHERE OrderDate >= ?
          )
        ), 0) as ItemsSold
      FROM restaurant_orders ro
      WHERE ro.OrderDate >= ?
    `, [startDate, startDate]);

    // Update the popularItems query to match your actual schema
    const [popularItems] = await connection.query(`
      SELECT 
        mi.Name as name,
        COUNT(*) as count,
        SUM(roi.Quantity) as total_quantity
      FROM restaurant_order_items roi
      JOIN menu_items mi ON roi.ItemID = mi.ItemID
      JOIN restaurant_orders ro ON roi.OrderID = ro.OrderID
      WHERE ro.OrderDate >= ?
        AND mi.IsActive = true
      GROUP BY mi.ItemID, mi.Name
      ORDER BY total_quantity DESC
      LIMIT 5
    `, [startDate]);

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

    // Add new queries for room analytics
    // Update the roomTypeStats query to match your schema
    const [roomTypeStats] = await connection.query(`
      SELECT 
        rt.Name as roomType,
        COUNT(*) as bookingCount,
        ROUND(AVG(r.TotalAmount), 2) as averageRevenue
      FROM reservations r
      JOIN rooms rm ON r.RoomID = rm.RoomID
      JOIN room_types rt ON rm.TypeID = rt.TypeID  -- Changed RoomTypeID to TypeID
      WHERE r.CreatedAt >= ?
      GROUP BY rt.TypeID, rt.Name  -- Changed RoomTypeID to TypeID
      ORDER BY bookingCount DESC
    `, [startDate]);

    // Update the packageStats query
    const [packageStats] = await connection.query(`
      SELECT 
        pt.Name as packageName,
        COUNT(*) as bookingCount,
        ROUND(AVG(r.TotalAmount), 2) as averageRevenue
      FROM reservations r
      JOIN package_types pt ON r.PackageID = pt.PackageID
      WHERE r.CreatedAt >= ?
      GROUP BY pt.PackageID
      ORDER BY bookingCount DESC
    `, [startDate]);

    // Update the countryStats query
    const [countryStats] = await connection.query(`
      SELECT 
        c.Country as name,
        COUNT(*) as visitors
      FROM reservations r
      JOIN customers c ON r.CustomerID = c.CustomerID
      WHERE r.CreatedAt >= ?
      GROUP BY c.Country
      ORDER BY visitors DESC
      LIMIT 10
    `, [startDate]);

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
        popularItems: popularItems.map(item => ({
          name: item.name,
          count: Number(item.count)
        }))
      },
      occupancyRate: Number(occupancy[0]?.OccupancyRate || 0),
      roomAnalytics: {
        popularRoomTypes: roomTypeStats.map(rt => ({
          name: rt.roomType,
          bookings: Number(rt.bookingCount),
          averageRevenue: Number(rt.averageRevenue)
        })),
        popularPackages: packageStats.map(pkg => ({
          name: pkg.packageName,
          bookings: Number(pkg.bookingCount),
          averageRevenue: Number(pkg.averageRevenue)
        })),
        topCountries: countryStats.map(country => ({
          name: country.Country,
          visitors: Number(country.visitorCount)
        }))
      }
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