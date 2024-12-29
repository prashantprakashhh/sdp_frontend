import axios from 'axios';

const API_BASE_URL = 'http://localhost:8102/';

export interface ApiResponse {
  message: string;
  number: number;
}

// Function to fetch data from the API
export const fetchData = async (): Promise<ApiResponse> => {
  try {
    const response = await axios.get<ApiResponse>(`${API_BASE_URL}/data`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
