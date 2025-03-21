export interface FormOptions {
  city: string[];
  specialty: string[];
}

export interface ScheduleDay {
  morning: boolean;
  morningHours: string;
  evening: boolean;
  eveningHours: string;
}

export interface Schedule {
  monday: ScheduleDay;
  tuesday: ScheduleDay;
  wednesday: ScheduleDay;
  thursday: ScheduleDay;
  friday: ScheduleDay;
  saturday: ScheduleDay;
  sunday: ScheduleDay;
}

export interface DoctorDetails {
  doctor_details: {
    [key: string]: {
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
      };
    };
  };
}

export interface SearchFilters {
  city: string;
  specialty: string;
}