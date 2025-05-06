import axios from 'axios';

const API_URL = 'http://localhost:5000/api/extracharges';

// Types
export interface ExtraCharge {
  ChargeID: number;
  ReservationID: number;
  TypeID: number | null;
  Description: string;
  Amount: number;  // Ensure this is typed as number
  TypeName?: string;
}

export interface ExtraChargeType {
  TypeID: number;
  Name: string;
  DefaultAmount: number;
}

export type ExtraChargeCreate = Omit<ExtraCharge, 'ChargeID' | 'TypeName'>;
export type ExtraChargeTypeCreate = Omit<ExtraChargeType, 'TypeID'>;

export const extraChargesService = {
  // ===== Extra Charges CRUD =====
  getAllCharges: async (): Promise<ExtraCharge[]> => {
    try {
      const response = await axios.get<ExtraCharge[]>(`${API_URL}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch charges: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getChargesByReservation: async (reservationID: number): Promise<ExtraCharge[]> => {
    try {
      const response = await axios.get<ExtraCharge[]>(`${API_URL}/${reservationID}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch charges for reservation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  addCharge: async (chargeData: ExtraChargeCreate): Promise<{ id: number }> => {
    try {
      const response = await axios.post<{ id: number }>(`${API_URL}`, chargeData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add charge: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  updateCharge: async (id: number, updatedData: Partial<ExtraChargeCreate>): Promise<{ success: boolean }> => {
    try {
      const response = await axios.put<{ success: boolean }>(`${API_URL}/${id}`, updatedData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update charge: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  deleteCharge: async (id: number): Promise<{ success: boolean }> => {
    try {
      const response = await axios.delete<{ success: boolean }>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete charge: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // ===== Extra Charge Types CRUD =====
  getAllTypes: async (): Promise<ExtraChargeType[]> => {
    try {
      const response = await axios.get<ExtraChargeType[]>(`${API_URL}/types`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch charge types: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  addType: async (typeData: ExtraChargeTypeCreate): Promise<{ id: number }> => {
    try {
      const response = await axios.post<{ id: number }>(`${API_URL}/types`, typeData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add charge type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  updateType: async (id: number, updatedData: Partial<ExtraChargeTypeCreate>): Promise<{ success: boolean }> => {
    try {
      const response = await axios.put<{ success: boolean }>(`${API_URL}/types/${id}`, updatedData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update charge type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  deleteType: async (id: number): Promise<{ success: boolean }> => {
    try {
      const response = await axios.delete<{ success: boolean }>(`${API_URL}/types/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete charge type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
