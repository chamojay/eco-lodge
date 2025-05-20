import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reports';

interface ReservationReportParams {
  startDate: string;
  endDate: string;
  type: string;
  includeCustomer: boolean;
}

interface PDFGenerationParams {
  data: any[];
  reportType: 'reservations' | 'activities' | 'payments' | 'extraCharges' | 'customers';
  title?: string;
}

export const reportService = {
  getReservationReport: async (params: ReservationReportParams) => {
    try {
      const response = await axios.get(`${API_URL}/reservations`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reservation report:', error);
      throw error;
    }
  },

  getActivitiesReport: async (startDate: string, endDate: string) => {
    try {
      const response = await axios.get(`${API_URL}/activities`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching activities report:', error);
      throw error;
    }
  },

  getPaymentsReport: async (startDate: string, endDate: string) => {
    try {
      const response = await axios.get(`${API_URL}/payments`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payments report:', error);
      throw error;
    }
  },

  getExtraChargesReport: async (startDate: string, endDate: string) => {
    try {
      const response = await axios.get(`${API_URL}/extra-charges`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching extra charges report:', error);
      throw error;
    }
  },

  getCustomersReport: async (customerType: string) => {
    try {
      const response = await axios.get(`${API_URL}/customers`, {
        params: { customerType }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching customers report:', error);
      throw error;
    }
  },

  generatePDF: async ({ data, reportType, title }: PDFGenerationParams): Promise<Blob> => {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No data selected for PDF generation');
      }

      if (!reportType) {
        throw new Error('Report type is required');
      }

      const reportTitle = title || `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
      const currentDate = new Date().toLocaleDateString();
      
      const response = await axios.post(
        `${API_URL}/generate-pdf`,
        {
          data,
          reportType,
          title: `${reportTitle} - Generated on ${currentDate}`,
          totalAmount: data.reduce((sum: number, item: any) => 
            sum + (Number(item.Amount) || Number(item.TotalAmount) || 0), 0
          )
        },
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error instanceof Error ? error : new Error('Failed to generate PDF');
    }
  }
};