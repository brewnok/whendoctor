import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, Phone, Clock, Filter, Trash2, AlertCircle, Globe, XCircle, RefreshCw } from 'lucide-react';
import logo from '../images/LOGO_MYTUTOR.png';
import UnavailableDatesManager from './UnavailableDatesManager';

interface Appointment {
  _id: string;
  patientName: string;
  patientPhone: string;
  date: string;
  shift: string;
  createdAt: string;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShift, setSelectedShift] = useState('all');
  const [dateOptions, setDateOptions] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  
  // Get doctor info from session storage
  const doctorInfoString = sessionStorage.getItem('doctorInfo');
  const doctorInfo = doctorInfoString ? JSON.parse(doctorInfoString) : null;

  // Fetch doctor's schedule
  const [doctorSchedule, setDoctorSchedule] = useState<any>(null);
  
  // Fetch doctor's complete data to get schedule and online status
  useEffect(() => {
    const fetchDoctorData = async () => {
      if (doctorInfo?.id) {
        try {
          const response = await axios.get(`http://localhost:5000/api/doctors/${doctorInfo.id}`);
          if (response.data && response.data.practice_details) {
            if (response.data.practice_details.schedule) {
              setDoctorSchedule(response.data.practice_details.schedule);
            }
            // Set initial online status from doctor data
            setIsOnline(response.data.practice_details.isOnline !== false);
          }
        } catch (error) {
          console.error('Error fetching doctor data:', error);
        }
      }
    };
    
    fetchDoctorData();
  }, [doctorInfo?.id]);

  // Handle toggling online status
  const toggleOnlineStatus = async () => {
    if (!doctorInfo?.id) return;
    
    setIsTogglingStatus(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/doctors/${doctorInfo.id}/toggle-status`
      );
      setIsOnline(response.data.isOnline);
    } catch (error) {
      console.error('Error toggling online status:', error);
      alert('Failed to update availability status. Please try again.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Create date options for only scheduled days - memoized to prevent recreation
  useEffect(() => {
    if (!doctorSchedule) {
      return;
    }
    
    const dates = [];
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Change from 30 days to 180 days (approximately 6 months)
    for (let i = 0; i < 180; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      const dayName = dayNames[date.getDay()];
      const daySchedule = doctorSchedule[dayName];
      
      // Only add dates when doctor has morning or evening shifts scheduled
      if (daySchedule && (daySchedule.morning || daySchedule.evening)) {
        const formattedDate = date.toISOString().split('T')[0];
        dates.push(formattedDate);
      }
    }
    
    if (dates.length > 0) {
      setDateOptions(dates);
      // Set first available date as default
      setSelectedDate(dates[0]);
    } else {
      // If no available dates in schedule, fallback to today
      const todayFormatted = today.toISOString().split('T')[0];
      setDateOptions([todayFormatted]);
      setSelectedDate(todayFormatted);
    }
  }, [doctorSchedule]);

  // Memoized loadAppointments function to avoid recreating on every render
  const loadAppointments = useCallback(async (doctorId: string, date: string) => {
    setIsLoading(true);
    try {
      console.log(`Loading appointments for doctor ${doctorId} on ${date}`);
      
      const response = await axios.get(`http://localhost:5000/api/doctors/${doctorId}/appointments`, {
        params: { date }
      });
      
      console.log('Appointments response:', response.data);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      // Set appointments to empty array to prevent infinite loading
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a separate refresh function
  const refreshAppointments = useCallback(async () => {
    if (!doctorInfo?.id || !selectedDate) return;
    
    setIsRefreshing(true);
    try {
      console.log(`Refreshing appointments for doctor ${doctorInfo.id} on ${selectedDate}`);
      
      const response = await axios.get(`http://localhost:5000/api/doctors/${doctorInfo.id}/appointments`, {
        params: { date: selectedDate }
      });
      
      console.log('Appointments refreshed:', response.data);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error refreshing appointments:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [doctorInfo?.id, selectedDate]);

  // Delete appointment function
  const deleteAppointment = async (appointmentId: string) => {
    if (!doctorInfo?.id) return;
    
    setIsDeletingId(appointmentId);
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${appointmentId}`, {
        data: { doctorId: doctorInfo.id }
      });
      
      // Update appointments list after successful deletion
      setAppointments(prevAppointments => 
        prevAppointments.filter(apt => apt._id !== appointmentId)
      );
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment. Please try again.');
    } finally {
      setIsDeletingId(null);
      setShowConfirmModal(false);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setShowConfirmModal(true);
  };

  // Check authentication and load initial data
  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('doctorAuthenticated') === 'true';
    if (!isAuthenticated || !doctorInfo) {
      navigate('/doctor');
      return;
    }
  }, [navigate, doctorInfo]);

  // Only load appointments when selectedDate changes or on first render
  useEffect(() => {
    if (selectedDate && doctorInfo?.id) {
      loadAppointments(doctorInfo.id, selectedDate);
    }
  }, [selectedDate, doctorInfo?.id, loadAppointments]);

  // Apply shift filter whenever appointments or selected shift changes
  useEffect(() => {
    if (selectedShift === 'all') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter(apt => apt.shift === selectedShift));
    }
  }, [appointments, selectedShift]);

  const handleLogout = () => {
    sessionStorage.removeItem('doctorAuthenticated');
    sessionStorage.removeItem('doctorInfo');
    navigate('/doctor');
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!doctorInfo) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Confirmation Modal */}
      {showConfirmModal && appointmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertCircle className="text-red-500 mr-2" size={24} />
              <h3 className="text-lg font-medium">Confirm Deletion</h3>
            </div>
            <p className="mb-4">
              Are you sure you want to delete the appointment for <strong>{appointmentToDelete.patientName}</strong> on {formatDate(appointmentToDelete.date)} ({appointmentToDelete.shift} shift)?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={isDeletingId !== null}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteAppointment(appointmentToDelete._id)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                disabled={isDeletingId !== null}
              >
                {isDeletingId === appointmentToDelete._id ? (
                  <span className="flex items-center">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></span>
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src={logo} alt="Doctor Dhundo Logo" className="h-10 mr-4" />
              {/* <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1> */}
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-600">
                Welcome, <span className="font-medium">{doctorInfo.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* New availability toggle section */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isOnline ? (
                <Globe size={20} className="text-green-500 mr-2" />
              ) : (
                <XCircle size={20} className="text-red-500 mr-2" />
              )}
              <span className="font-medium">
                Status: <span className={isOnline ? "text-green-500" : "text-red-500"}>
                  {isOnline ? "Online (Visible in search)" : "Offline (Hidden from search)"}
                </span>
              </span>
            </div>
            <button
              onClick={toggleOnlineStatus}
              disabled={isTogglingStatus}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isOnline 
                  ? "bg-red-100 text-red-700 hover:bg-red-200" 
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {isTogglingStatus ? (
                <span className="flex items-center">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></span>
                  Updating...
                </span>
              ) : isOnline ? (
                <>Go Offline</>
              ) : (
                <>Go Online</>
              )}
            </button>
          </div>
        </div>

        {/* Add the UnavailableDatesManager component here */}
        {doctorInfo?.id && (
          <UnavailableDatesManager doctorId={doctorInfo.id} />
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Appointments</h2>
              <p className="text-gray-600 text-sm">{doctorInfo.specialty}</p>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Date selector */}
              <div className="flex items-center space-x-2">
                <Calendar size={18} className="text-blue-600" />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading || dateOptions.length === 0}
                >
                  {dateOptions.map((date) => {
                    const dateObj = new Date(date);
                    const formattedDate = dateObj.toLocaleDateString(undefined, { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                      year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    });
                    return (
                      <option key={date} value={date}>
                        {formattedDate}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              {/* Shift filter */}
              <div className="flex items-center space-x-2">
                <Filter size={18} className="text-blue-600" />
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="all">All Shifts</option>
                  <option value="morning">Morning Shift</option>
                  <option value="evening">Evening Shift</option>
                </select>
              </div>
              
              {/* Add refresh button */}
              <button
                onClick={refreshAppointments}
                disabled={isLoading || isRefreshing}
                className="flex items-center space-x-1 p-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                title="Refresh appointments"
              >
                <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Patient</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Time</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Booked On</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-gray-400" />
                          <div className="font-medium text-gray-900">{appointment.patientName}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Phone size={16} className="mr-2 text-gray-400" />
                          <span>{appointment.patientPhone}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2 text-gray-400" />
                          <span className="capitalize">{appointment.shift}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(appointment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteClick(appointment)}
                          className="text-red-600 hover:text-red-900 flex items-center transition-colors"
                          disabled={isDeletingId === appointment._id}
                          title="Mark as completed & delete"
                        >
                          {isDeletingId === appointment._id ? (
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-red-600 border-r-transparent mr-1"></span>
                          ) : (
                            <Trash2 size={16} className="mr-1" />
                          )}
                          Complete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <Calendar size={32} className="mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">
                {selectedShift !== 'all' ? `No ${selectedShift} Appointments` : 'No Appointments'}
              </h3>
              <p className="text-gray-500 mt-1">
                {selectedShift !== 'all' 
                  ? `There are no ${selectedShift} shift appointments scheduled for this date.`
                  : 'There are no appointments scheduled for this date.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}