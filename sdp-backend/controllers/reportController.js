const pool = require('../config/db');
const PDFDocument = require('pdfkit');

class ReportController {
  async getReservationReport(req, res) {
    const { startDate, endDate, type, includeCustomer } = req.query;
    const connection = await pool.getConnection();
    
    try {
      let query = `
        SELECT 
          r.ReservationID,
          r.CheckInDate,
          r.CheckOutDate,
          r.TotalAmount,
          r.Room_Status,
          r.Adults,
          r.Children,
          rm.RoomNumber,
          rt.Name as RoomType,
          pt.Name as PackageType
          ${includeCustomer === 'true' ? `
          ,c.Title,
          c.FirstName,
          c.LastName,
          c.Email,
          c.Phone,
          c.Country,
          c.NIC,
          c.PassportNumber
          ` : ''}
        FROM reservations r
        JOIN rooms rm ON r.RoomID = rm.RoomID
        JOIN room_types rt ON rm.TypeID = rt.TypeID
        LEFT JOIN package_types pt ON r.PackageID = pt.PackageID
        ${includeCustomer === 'true' ? 'JOIN customers c ON r.CustomerID = c.CustomerID' : ''}
        WHERE 1=1
      `;

      const params = [];
      
      if (startDate && endDate) {
        query += ` AND r.CheckInDate BETWEEN ? AND ?`;
        params.push(startDate, endDate);
      }

      switch (type) {
        case 'upcoming':
          query += ` AND r.CheckInDate > CURRENT_DATE()`;
          break;
        case 'active':
          query += ` AND CURRENT_DATE() BETWEEN r.CheckInDate AND r.CheckOutDate`;
          break;
        case 'past':
          query += ` AND r.CheckOutDate < CURRENT_DATE()`;
          break;
        // 'all' doesn't need additional conditions
      }

      query += ` ORDER BY r.CheckInDate DESC`;

      const [results] = await connection.query(query, params);
      res.json(results);
    } catch (error) {
      console.error('Error fetching reservation report:', error);
      res.status(500).json({ error: error.message });
    } finally {
      connection.release();
    }
  }

  async getActivitiesReport(req, res) {
    const { startDate, endDate } = req.query;
    const connection = await pool.getConnection();
    
    try {
      const query = `
        SELECT 
          ra.ReservationActivityID,
          ra.ReservationID,
          a.Name as ActivityName,
          ra.ScheduledDate,
          ra.Amount,
          ra.Participants,
          c.FirstName,
          c.LastName,
          c.Email,
          c.Phone
        FROM reservation_activities ra
        JOIN activities a ON ra.ActivityID = a.ActivityID
        JOIN reservations r ON ra.ReservationID = r.ReservationID
        JOIN customers c ON r.CustomerID = c.CustomerID
        WHERE ra.ScheduledDate >= CURRENT_DATE()
        ${startDate && endDate ? 'AND ra.ScheduledDate BETWEEN ? AND ?' : ''}
        ORDER BY ra.ScheduledDate ASC
      `;

      const params = startDate && endDate ? [startDate, endDate] : [];
      const [results] = await connection.query(query, params);

      // Calculate total revenue
      const totalRevenue = results.reduce((sum, item) => sum + Number(item.Amount), 0);

      res.json({
        activities: results,
        totalRevenue: totalRevenue
      });
    } catch (error) {
      console.error('Error fetching activities report:', error);
      res.status(500).json({ error: error.message });
    } finally {
      connection.release();
    }
  }

  async getPaymentsReport(req, res) {
    const { startDate, endDate, type } = req.query;
    const connection = await pool.getConnection();
    
    try {
      let query = '';
      
      if (type === 'restaurant') {
        query = `
          SELECT 
            p.PaymentID,
            p.Amount,
            p.PaymentDate,
            p.PaymentMethod,
            p.Source,
            ro.OrderID,
            ro.TotalAmount as OrderTotal,
            GROUP_CONCAT(
              CONCAT(mi.Name, ' (', roi.Quantity, ')')
              SEPARATOR ', '
            ) as OrderItems
          FROM payments p
          JOIN restaurant_orders ro ON p.OrderID = ro.OrderID
          JOIN restaurant_order_items roi ON ro.OrderID = roi.OrderID
          JOIN menu_items mi ON roi.ItemID = mi.ItemID
          WHERE p.Source = 'Restaurant'
          ${startDate && endDate ? 'AND p.PaymentDate BETWEEN ? AND ?' : ''}
          GROUP BY p.PaymentID
          ORDER BY p.PaymentDate DESC
        `;
      } else {
        query = `
          SELECT 
            p.*,
            r.ReservationID,
            CONCAT(c.FirstName, ' ', c.LastName) as CustomerName,
            c.Email,
            rm.RoomNumber
          FROM payments p
          LEFT JOIN reservations r ON p.ReservationID = r.ReservationID
          LEFT JOIN customers c ON r.CustomerID = c.CustomerID
          LEFT JOIN rooms rm ON r.RoomID = rm.RoomID
          WHERE 1=1
          ${startDate && endDate ? 'AND p.PaymentDate BETWEEN ? AND ?' : ''}
          ORDER BY p.PaymentDate DESC
        `;
      }

      const params = startDate && endDate ? [startDate, endDate] : [];
      const [results] = await connection.query(query, params);

      // Calculate total
      const total = results.reduce((sum, item) => sum + Number(item.Amount), 0);

      res.json({
        payments: results,
        total: total
      });
    } catch (error) {
      console.error('Error fetching payments report:', error);
      res.status(500).json({ error: error.message });
    } finally {
      connection.release();
    }
  }

  async getExtraChargesReport(req, res) {
    const { startDate, endDate } = req.query;
    const connection = await pool.getConnection();
    
    try {
      const query = `
        SELECT 
          ec.ChargeID,
          ec.ReservationID,
          ec.Amount,
          ec.Description,
          ec.CreatedAt,
          ect.Name as ChargeType,
          r.CheckInDate,
          r.CheckOutDate,
          CONCAT(c.FirstName, ' ', c.LastName) as CustomerName,
          rm.RoomNumber
        FROM extra_charges ec
        JOIN reservations r ON ec.ReservationID = r.ReservationID
        LEFT JOIN extra_charge_types ect ON ec.TypeID = ect.TypeID
        JOIN customers c ON r.CustomerID = c.CustomerID
        JOIN rooms rm ON r.RoomID = rm.RoomID
        WHERE 1=1
        ${startDate && endDate ? 'AND ec.CreatedAt BETWEEN ? AND ?' : ''}
        ORDER BY ec.CreatedAt DESC
      `;

      const params = startDate && endDate ? [startDate, endDate] : [];
      const [results] = await connection.query(query, params);

      const total = results.reduce((sum, item) => sum + Number(item.Amount), 0);

      res.json({
        charges: results,
        total: total
      });
    } catch (error) {
      console.error('Error fetching extra charges report:', error);
      res.status(500).json({ error: error.message });
    } finally {
      connection.release();
    }
  }

  async getCustomersReport(req, res) {
    const { customerType } = req.query;
    const connection = await pool.getConnection();
    
    try {
      const query = `
        SELECT 
          c.*,
          COUNT(r.ReservationID) as TotalReservations,
          SUM(r.TotalAmount) as TotalSpent
        FROM customers c
        LEFT JOIN reservations r ON c.CustomerID = r.CustomerID
        WHERE 1=1
        ${customerType === 'local' ? 'AND c.NIC IS NOT NULL' : 
          customerType === 'foreign' ? 'AND c.PassportNumber IS NOT NULL' : ''}
        GROUP BY c.CustomerID
        ORDER BY c.CreatedAt DESC
      `;

      const [results] = await connection.query(query);
      res.json(results);
    } catch (error) {
      console.error('Error fetching customers report:', error);
      res.status(500).json({ error: error.message });
    } finally {
      connection.release();
    }
  }

  async generatePDF(req, res) {
    const { data, reportType, title } = req.body;
    
    try {
      // Create a new PDF document
      const doc = new PDFDocument();
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Pipe the PDF to the response
      doc.pipe(res);
      
      // Add title
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();
      
      // Add generation date
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown();

      // Add data
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          doc.fontSize(12);
          Object.entries(item).forEach(([key, value]) => {
            if (key !== 'selected' && value !== null) {
              doc.text(`${key}: ${value}`);
            }
          });
          if (index < data.length - 1) {
            doc.moveDown();
            doc.text('------------------------');
            doc.moveDown();
          }
        });
      }

      // Add total if available
      if (data.length > 0 && data[0].Amount) {
        const total = data.reduce((sum, item) => sum + Number(item.Amount), 0);
        doc.moveDown();
        doc.fontSize(14).text(`Total Amount: LKR ${total.toLocaleString()}`, { align: 'right' });
      }

      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }
}

module.exports = new ReportController();