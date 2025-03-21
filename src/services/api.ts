import axios from 'axios';



const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchDoctors = async (filters: { city?: string; specialty?: string; name?: string }) => {
  try {
    console.log('Fetching doctors with filters:', filters);
    const response = await apiClient.get('/doctors', { params: filters });
    console.log('Doctors response:', response.data);
    
    // Sort the doctors alphabetically by name
    const sortedDoctors = [...response.data].sort((a, b) => 
      a.personalDetails.name.localeCompare(b.personalDetails.name)
    );
    
    return sortedDoctors;
  } catch (error) {
    console.error('Error in fetchDoctors:', error);
    throw error;
  }
};

export const fetchCities = async () => {
  try {
    console.log('Fetching cities');
    const response = await apiClient.get('/doctors/cities');
    console.log('Cities response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in fetchCities:', error);
    throw error;
  }
};

export const fetchSpecialties = async () => {
  try {
    console.log('Fetching specialties');
    const response = await apiClient.get('/doctors/specialties');
    console.log('Specialties response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in fetchSpecialties:', error);
    throw error;
  }
};

// Admin API functions
export const addDoctor = async (doctorData: any) => {
  try {
    console.log('Adding doctor (stringified):', JSON.stringify(doctorData, null, 2));
    const response = await apiClient.post('/doctors', doctorData);
    console.log('Add doctor response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in addDoctor:', error);
    // Add this to see more details about the error
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error details:', error.response.data);
    }
    throw error;
  }
};

export const updateDoctor = async (id: string, doctorData: any) => {
  try {
    console.log('Updating doctor with ID:', id, doctorData);
    const response = await apiClient.put(`/doctors/${id}`, doctorData);
    console.log('Update doctor response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateDoctor:', error);
    throw error;
  }
};

export const deleteDoctor = async (id: string) => {
  try {
    console.log('Deleting doctor with ID:', id);
    const response = await apiClient.delete(`/doctors/${id}`);
    console.log('Delete doctor response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in deleteDoctor:', error);
    throw error;
  }
};

export const toggleDoctorOnlineStatus = async (doctorId: string) => {
  try {
    console.log('Toggling online status for doctor:', doctorId);
    const response = await apiClient.post(`/doctors/${doctorId}/toggle-status`);
    console.log('Toggle status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in toggleDoctorOnlineStatus:', error);
    throw error;
  }
};

interface AppointmentData {
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientPhone: string;
  date: string;
  shift: string;
}

export const bookAppointment = async (appointmentData: AppointmentData) => {
  try {
    console.log('Booking appointment:', appointmentData);
    const response = await apiClient.post('/appointments', appointmentData);
    console.log('Appointment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in bookAppointment:', error);
    throw error;
  }
};

// Get unavailable dates for a doctor
export const getUnavailableDates = async (doctorId: string) => {
  try {
    const response = await apiClient.get(`/doctors/${doctorId}/unavailable-dates`);
    return response.data;
  } catch (error) {
    console.error('Error getting unavailable dates:', error);
    throw error;
  }
};

// Add a new unavailable date range
export const addUnavailableDate = async (doctorId: string, dateRange: { startDate: string; endDate: string; reason?: string }) => {
  try {
    const response = await apiClient.post(`/doctors/${doctorId}/unavailable-dates`, dateRange);
    return response.data;
  } catch (error) {
    console.error('Error adding unavailable date range:', error);
    throw error;
  }
};

// Delete an unavailable date range
export const deleteUnavailableDate = async (doctorId: string, dateId: string) => {
  try {
    const response = await apiClient.delete(`/doctors/${doctorId}/unavailable-dates/${dateId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting unavailable date range:', error);
    throw error;
  }
};