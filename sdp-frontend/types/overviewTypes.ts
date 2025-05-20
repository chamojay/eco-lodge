export interface OverviewData {
  timeRange: 'daily' | 'weekly' | 'monthly';
  revenue: {
    rooms: number;
    activities: number;
    restaurant: number;
    extraCharges: number;
    total: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  activities: {
    popular: Array<{ name: string; count: number }>;
    revenue: number;
    upcoming: number;
  };
  restaurant: {
    orders: number;
    revenue: number;
    popularItems: Array<{ name: string; count: number }>;
  };
  occupancyRate: number;
  roomAnalytics: {
    popularRoomTypes: Array<{
      name: string;
      bookings: number;
      averageRevenue: number;
    }>;
    popularPackages: Array<{
      name: string;
      bookings: number;
      averageRevenue: number;
    }>;
    topCountries: Array<{
      name: string;
      visitors: number;
    }>;
  };
}