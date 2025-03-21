import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone } from 'lucide-react';
import { bookAppointment, getUnavailableDates } from '../services/api';

interface Schedule {
  monday?: { morning: boolean; morningHours: string; evening: boolean; eveningHours: string };
  tuesday?: { morning: boolean; morningHours: string; evening: boolean; eveningHours: string };
  wednesday?: { morning: boolean; morningHours: string; evening: boolean; eveningHours: string };
  thursday?: { morning: boolean; morningHours: string; evening: boolean; eveningHours: string };
  friday?: { morning: boolean; morningHours: string; evening: boolean; eveningHours: string };
  saturday?: { morning: boolean; morningHours: string; evening: boolean; eveningHours: string };
  sunday?: { morning: boolean; morningHours: string; evening: boolean; eveningHours: string };
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  doctorId: string;
  schedule: Schedule;
}

const DAY_NAMES: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export default function AppointmentModal({
  isOpen,
  onClose,
  doctorName,
  doctorId,
  schedule,
}: AppointmentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    shift: '',
  });
  const [availableDates, setAvailableDates] = useState<{ value: string; day: string; date: string }[]>([]);
  const [availableShifts, setAvailableShifts] = useState<{ value: string; label: string; hours: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [unavailableDateRanges, setUnavailableDateRanges] = useState<{startDate: string; endDate: string}[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(false);

  const normalizeScheduleKeys = (originalSchedule: any): Schedule => {
    if (!originalSchedule) return {} as Schedule;
    
    console.log("Normalizing schedule keys. Original:", originalSchedule);
    const normalized: Schedule = {};
    
    const keyMap: Record<string, keyof Schedule> = {
      'sunday': 'sunday',
      'Sunday': 'sunday',
      'SUNDAY': 'sunday',
      'monday': 'monday',
      'Monday': 'monday',
      'MONDAY': 'monday',
      'tuesday': 'tuesday',
      'Tuesday': 'tuesday',
      'TUESDAY': 'tuesday',
      'wednesday': 'wednesday',
      'Wednesday': 'wednesday',
      'WEDNESDAY': 'wednesday',
      'thursday': 'thursday',
      'Thursday': 'thursday',
      'THURSDAY': 'thursday',
      'friday': 'friday',
      'Friday': 'friday',
      'FRIDAY': 'friday',
      'saturday': 'saturday',
      'Saturday': 'saturday',
      'SATURDAY': 'saturday',
    };
    
    Object.keys(originalSchedule).forEach(key => {
      const normalizedKey = keyMap[key];
      if (normalizedKey) {
        normalized[normalizedKey] = originalSchedule[key];
      } else {
        console.warn(`Unknown schedule key: ${key}`);
      }
    });
    
    console.log("Normalized schedule:", normalized);
    return normalized;
  };

  const [normalizedSchedule, setNormalizedSchedule] = useState<Schedule>({});

  useEffect(() => {
    if (schedule) {
      const normalized = normalizeScheduleKeys(schedule);
      setNormalizedSchedule(normalized);
      console.log("Schedule normalized:", normalized);
    }
  }, [schedule]);

  useEffect(() => {
    if (isOpen && doctorId) {
      const fetchUnavailableDates = async () => {
        setIsLoadingDates(true);
        try {
          const data = await getUnavailableDates(doctorId);
          setUnavailableDateRanges(data);
        } catch (error) {
          console.error('Error loading unavailable dates:', error);
        } finally {
          setIsLoadingDates(false);
        }
      };
      fetchUnavailableDates();
    }
  }, [isOpen, doctorId]);

  useEffect(() => {
    if (!normalizedSchedule) return;

    const dates: { value: string; day: string; date: string }[] = [];
    const today = new Date();
    
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    const isDateUnavailable = (dateToCheck: Date) => {
      const dateStr = dateToCheck.toISOString().split('T')[0];
      return unavailableDateRanges.some(range => {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        dateToCheck.setHours(12, 0, 0, 0);
        return dateToCheck >= start && dateToCheck <= end;
      });
    };

    for (let i = 0; i < 180; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      const dayIndex = date.getDay();
      const dayKey = weekdays[dayIndex] as keyof Schedule;
      
      if (normalizedSchedule[dayKey] && 
          (normalizedSchedule[dayKey]?.morning || normalizedSchedule[dayKey]?.evening) && 
          !isDateUnavailable(date)) {
        dates.push({
          value: date.toISOString().split('T')[0],
          day: DAY_NAMES[dayKey],
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }
    }

    setAvailableDates(dates);
  }, [normalizedSchedule, unavailableDateRanges]);

  useEffect(() => {
    try {
      if (!formData.date || !normalizedSchedule) {
        return;
      }
      
      console.log("Selected date:", formData.date);
      
      const selectedDateEntry = availableDates.find(d => d.value === formData.date);
      console.log("Selected date entry:", selectedDateEntry);
      
      if (!selectedDateEntry) {
        console.error("Could not find date entry for:", formData.date);
        setAvailableShifts([]);
        return;
      }
      
      const dayKey = selectedDateEntry.day.toLowerCase() as keyof Schedule;
      console.log("Day key to look up:", dayKey);
      
      const daySchedule = normalizedSchedule[dayKey];
      console.log("Day schedule found:", daySchedule);
      
      if (!daySchedule) {
        setAvailableShifts([]);
        return;
      }
      
      const shifts: { value: string; label: string; hours: string }[] = [];
      
      if (daySchedule.morning) {
        shifts.push({ 
          value: 'morning', 
          label: 'Morning', 
          hours: daySchedule.morningHours 
        });
      }
      
      if (daySchedule.evening) {
        shifts.push({ 
          value: 'evening', 
          label: 'Evening', 
          hours: daySchedule.eveningHours 
        });
      }
      
      console.log("Available shifts:", shifts);
      setAvailableShifts(shifts);
      
      if (formData.shift && !shifts.some(s => s.value === formData.shift)) {
        setFormData(prev => ({ ...prev, shift: '' }));
      }
    } catch (error) {
      console.error("Error updating available shifts:", error);
    }
  }, [formData.date, normalizedSchedule, availableDates]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select an appointment date';
    }
    
    if (!formData.shift) {
      newErrors.shift = 'Please select an appointment time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const appointmentData = {
        doctorId,
        doctorName,
        patientName: formData.name,
        patientPhone: formData.phone,
        date: formData.date,
        shift: formData.shift
      };
      
      console.log('Booking appointment for:', appointmentData);
      
      await bookAppointment(appointmentData);
      
      setSuccessMessage('Your appointment has been booked successfully!');
      
      setTimeout(() => {
        setFormData({ name: '', phone: '', date: '', shift: '' });
        setSuccessMessage('');
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      setErrors({
        submit: 'Failed to book appointment. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Book Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {successMessage ? (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Success!</h3>
              <p className="mt-2 text-gray-600">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  Booking with <span className="font-semibold">{doctorName}</span>
                </p>
              </div>

              <div>
                <label htmlFor="name" className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  <User size={16} className="text-blue-600" />
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  <Phone size={16} className="text-blue-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="10-digit phone number"
                  disabled={isSubmitting}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="date" className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  <Calendar size={16} className="text-blue-600" />
                  Appointment Date
                </label>
                <select
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting || availableDates.length === 0}
                >
                  <option value="">Select date</option>
                  {availableDates.map((date) => (
                    <option key={date.value} value={date.value}>
                      {date.day}, {date.date}
                    </option>
                  ))}
                </select>
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                {availableDates.length === 0 && (
                  <p className="mt-1 text-sm text-amber-600">No available dates found for this doctor.</p>
                )}
              </div>

              <div>
                <label htmlFor="shift" className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  <Clock size={16} className="text-blue-600" />
                  Appointment Time
                </label>
                <select
                  id="shift"
                  name="shift"
                  value={formData.shift}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting || !formData.date || availableShifts.length === 0}
                >
                  <option value="">Select time</option>
                  {availableShifts.map((shift) => (
                    <option key={shift.value} value={shift.value}>
                      {shift.label} ({shift.hours})
                    </option>
                  ))}
                </select>
                {errors.shift && <p className="mt-1 text-sm text-red-600">{errors.shift}</p>}
              </div>

              {errors.submit && (
                <div className="p-2 text-sm text-red-800 bg-red-100 rounded-md">
                  {errors.submit}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Booking...
                    </>
                  ) : (
                    'Book Appointment'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}