import React, { useState } from 'react';
import { MapPin, Phone, Clock, ChevronDown, ChevronUp, Calendar, XCircle } from 'lucide-react';
import AppointmentModal from './AppointmentModal';

interface ScheduleDay {
  morning: boolean;
  morningHours: string;
  evening: boolean;
  eveningHours: string;
}

interface Schedule {
  monday: ScheduleDay;
  tuesday: ScheduleDay;
  wednesday: ScheduleDay;
  thursday: ScheduleDay;
  friday: ScheduleDay;
  saturday: ScheduleDay;
  sunday: ScheduleDay;
}

interface DoctorCardProps {
  doctor: {
    _id: string; 
    personalDetails: {
      name: string;
      phone: string;
      address: string;
      qualification: string;
      designation: string;
    };
    practice_details: {
      specialty: string;
      image_path: string;
      city: string;
      google_map: {
        qlink: string;
      };
      schedule?: Schedule;
      isOnline?: boolean;
    };
  };
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  // Check if doctor has any schedule
  const hasSchedule = doctor.practice_details.schedule && 
    Object.values(doctor.practice_details.schedule).some(
      day => day.morning || day.evening
    );

  // Check if doctor is online/available
  const isOnline = doctor.practice_details.isOnline !== false;

  const handleOpenAppointmentModal = () => {
    if (!isOnline) {
      return; // Prevent opening modal if doctor is offline
    }
    console.log("Schedule data being passed to modal:", doctor.practice_details.schedule);
    setShowAppointmentModal(true);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col ${!isOnline ? 'opacity-70' : ''}`}>
      {/* Offline status banner if doctor is offline */}
      {!isOnline && (
        <div className="bg-gray-600 text-white py-1 px-2 text-center text-sm flex items-center justify-center">
          <XCircle size={16} className="mr-1" />
          Currently Unavailable
        </div>
      )}
      
      <div className="p-4 flex">
        {/* Doctor image - left side with specific dimensions */}
        <div className="w-28 h-36 flex-shrink-0 mr-4">
          <img
            className={`w-full h-full object-cover rounded-lg ${!isOnline ? 'filter grayscale' : ''}`}
            src={doctor.practice_details.image_path}
            alt={doctor.personalDetails.name}
          />
        </div>
        
        {/* Doctor details - right side */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {doctor.personalDetails.name}
              </h3>
              <p className="text-sm text-gray-600">{doctor.personalDetails.qualification}</p>
              <p className="text-sm text-gray-500">{doctor.personalDetails.designation}</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {doctor.practice_details.specialty}
            </span>
          </div>
          
          <div className="mt-3 flex items-center text-sm text-gray-600">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span className="truncate">{doctor.practice_details.city}</span>
          </div>
          
          <div className="mt-1 flex items-center text-sm text-gray-600">
            <Phone size={14} className="mr-1 flex-shrink-0" />
            <span>{doctor.personalDetails.phone}</span>
          </div>
        </div>
      </div>
      
      {/* Doctor schedule */}
      {hasSchedule && (
        <div className="px-4 pb-2">
          <button 
            onClick={() => setShowSchedule(!showSchedule)}
            className={`flex items-center text-sm font-medium ${isOnline ? 'text-blue-600' : 'text-gray-400'}`}
            disabled={!isOnline}
          >
            <Clock size={14} className="mr-1" />
            {showSchedule ? 'Hide Schedule' : 'Show Schedule'}
            {showSchedule ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
          </button>
          
          {showSchedule && doctor.practice_details.schedule && (
            <div className="mt-2 text-xs">
              <div className="border rounded overflow-hidden">
                <div className="bg-gray-50 px-2 py-1 font-medium">
                  <div className="grid grid-cols-3">
                    <span>Day</span>
                    <span>Morning</span>
                    <span>Evening</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {Object.entries(doctor.practice_details.schedule).map(([day, schedule]) => {
                    // Skip days when doctor is not available
                    if (!schedule.morning && !schedule.evening) return null;
                    
                    return (
                      <div key={day} className="px-2 py-1">
                        <div className="grid grid-cols-3">
                          <span className="font-medium">
                            {dayNames[day as keyof typeof dayNames]}
                          </span>
                          <span>
                            {schedule.morning ? schedule.morningHours : '-'}
                          </span>
                          <span>
                            {schedule.evening ? schedule.eveningHours : '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Action buttons */}
      <div className="px-4 pb-2 pt-3 border-t flex gap-2 mt-auto">
        <a
          href={doctor.practice_details.google_map.qlink}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
            isOnline 
              ? "text-white bg-blue-600 hover:bg-blue-700" 
              : "text-white bg-gray-400"
          }`}
        >
          <MapPin size={16} className="mr-1" />
          Location
        </a>
        <a
          href={`tel:${doctor.personalDetails.phone}`}
          className={`flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
            isOnline 
              ? "text-white bg-green-600 hover:bg-green-700" 
              : "text-white bg-gray-400"
          }`}
        >
          <Phone size={16} className="mr-1" />
          Call
        </a>
      </div>
      <div className="px-4 pb-4">
        <button
          onClick={handleOpenAppointmentModal}
          disabled={!isOnline}
          className={`w-full inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
            isOnline 
              ? "text-white bg-purple-600 hover:bg-purple-700" 
              : "text-white bg-gray-400 cursor-not-allowed"
          }`}
          title={!isOnline ? "Doctor is currently unavailable" : "Book an appointment"}
        >
          <Calendar size={16} className="mr-1" />
          {isOnline ? "Get Appointment" : "Currently Unavailable"}
        </button>
      </div>

      {/* Appointment Modal */}
      {isOnline && doctor.practice_details.schedule && (
        <AppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          doctorName={doctor.personalDetails.name}
          doctorId={doctor._id}
          schedule={doctor.practice_details.schedule}
        />
      )}
    </div>
  );
}