import React, { useState } from 'react';
import { addDoctor } from '../services/api';

// Hardcoded lists for dropdown options
const CITIES = [
  "Agartala",
  "Dharmanagar",
  "Udaipur",
  "Kumarghat",
  "Kanchanpur",
  "Khowai",
  "Bishalgarh",
  "Bishramganj",
];

const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Obstetrics & Gynecology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Urology"
];

const WEEKDAYS = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

interface AddDoctorFormProps {
  onDoctorAdded: () => void;
  onCancel: () => void;
}

export default function AddDoctorForm({ onDoctorAdded, onCancel }: AddDoctorFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    qualification: '',
    designation: '',
    specialty: '',
    image_path: '',
    city: '',
    qlink: '',
    username: '',
    password: ''
  });
  
  // State for schedule
  const [schedule, setSchedule] = useState({
    monday: { morning: false, morningHours: '8:00 AM - 12:00 PM', evening: false, eveningHours: '5:00 PM - 9:00 PM' },
    tuesday: { morning: false, morningHours: '8:00 AM - 12:00 PM', evening: false, eveningHours: '5:00 PM - 9:00 PM' },
    wednesday: { morning: false, morningHours: '8:00 AM - 12:00 PM', evening: false, eveningHours: '5:00 PM - 9:00 PM' },
    thursday: { morning: false, morningHours: '8:00 AM - 12:00 PM', evening: false, eveningHours: '5:00 PM - 9:00 PM' },
    friday: { morning: false, morningHours: '8:00 AM - 12:00 PM', evening: false, eveningHours: '5:00 PM - 9:00 PM' },
    saturday: { morning: false, morningHours: '8:00 AM - 12:00 PM', evening: false, eveningHours: '5:00 PM - 9:00 PM' },
    sunday: { morning: false, morningHours: '8:00 AM - 12:00 PM', evening: false, eveningHours: '5:00 PM - 9:00 PM' },
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'schedule'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Handle schedule toggle checkboxes
  const handleScheduleToggle = (day: string, shift: 'morning' | 'evening') => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [shift]: !prev[day as keyof typeof prev][shift]
      }
    }));
  };

  // Handle schedule hours input
  const handleScheduleHours = (e: React.ChangeEvent<HTMLInputElement>, day: string, shift: 'morningHours' | 'eveningHours') => {
    const { value } = e.target;
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [shift]: value
      }
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const fields = Object.entries(formData);
    
    for (const [key, value] of fields) {
      if (!value.trim()) {
        errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone must be a 10-digit number';
    }

    // Check if at least one schedule slot is selected
    let hasSchedule = false;
    Object.values(schedule).forEach((day) => {
      if (day.morning || day.evening) {
        hasSchedule = true;
      }
    });
    
    if (!hasSchedule) {
      alert('Please select at least one schedule slot');
      return false;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Add console logging for diagnostic purposes
      console.log('Form data being submitted:', formData);
      console.log('Schedule being submitted:', schedule);
      
      const doctorData = {
        personalDetails: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          qualification: formData.qualification,
          designation: formData.designation
        },
        practice_details: {
          specialty: formData.specialty,
          image_path: formData.image_path || 'https://via.placeholder.com/150',
          city: formData.city,
          google_map: {
            qlink: formData.qlink || ''
          },
          schedule: schedule,
          isOnline: true
        },
        credentials: {
          username: formData.username,
          password: formData.password
        }
      };
      
      console.log('Doctor data to be sent:', doctorData);
      await addDoctor(doctorData);
      onDoctorAdded();
    } catch (error) {
      console.error('Error adding doctor:', error);
      alert('Failed to add doctor. Check the console for details.');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Doctor</h2>
      
      <div className="mb-4 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('basic')} 
              className={`inline-block py-2 px-4 text-sm font-medium ${activeTab === 'basic' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Basic Information
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`inline-block py-2 px-4 text-sm font-medium ${activeTab === 'schedule' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Schedule
            </button>
          </li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Personal Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="10-digit number"
              />
              {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification*</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="MBBS, MD, etc."
              />
              {formErrors.qualification && <p className="mt-1 text-sm text-red-600">{formErrors.qualification}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation*</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Senior Consultant, etc."
              />
              {formErrors.designation && <p className="mt-1 text-sm text-red-600">{formErrors.designation}</p>}
            </div>
            
            {/* Practice Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty*</label>
              <select
                name="specialty"
                value={formData.specialty}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a specialty</option>
                {SPECIALTIES.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              {formErrors.specialty && <p className="mt-1 text-sm text-red-600">{formErrors.specialty}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a city</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {formErrors.city && <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {formErrors.address && <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link*</label>
              <input
                type="text"
                name="qlink"
                value={formData.qlink}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.google.com/maps?q=..."
              />
              {formErrors.qlink && <p className="mt-1 text-sm text-red-600">{formErrors.qlink}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                name="image_path"
                value={formData.image_path}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use a placeholder image</p>
              {formErrors.image_path && <p className="mt-1 text-sm text-red-600">{formErrors.image_path}</p>}
            </div>

            <div className="col-span-2 border-t pt-4 mt-2">
              <h3 className="font-medium text-gray-900 mb-2">Login Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username*</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.username && <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">Specify when the doctor is available for appointments.</p>
            
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Morning
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Morning Hours
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evening
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evening Hours
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {WEEKDAYS.map(day => (
                    <tr key={day.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {day.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input 
                          type="checkbox" 
                          checked={schedule[day.id as keyof typeof schedule].morning}
                          onChange={() => handleScheduleToggle(day.id, 'morning')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="text"
                          value={schedule[day.id as keyof typeof schedule].morningHours}
                          onChange={(e) => handleScheduleHours(e, day.id, 'morningHours')}
                          disabled={!schedule[day.id as keyof typeof schedule].morning}
                          className="w-full p-1 border border-gray-300 rounded-md focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input 
                          type="checkbox" 
                          checked={schedule[day.id as keyof typeof schedule].evening}
                          onChange={() => handleScheduleToggle(day.id, 'evening')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="text"
                          value={schedule[day.id as keyof typeof schedule].eveningHours}
                          onChange={(e) => handleScheduleHours(e, day.id, 'eveningHours')}
                          disabled={!schedule[day.id as keyof typeof schedule].evening}
                          className="w-full p-1 border border-gray-300 rounded-md focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Doctor
          </button>
        </div>
      </form>
    </div>
  );
}

// In your addDoctor function in api.ts
