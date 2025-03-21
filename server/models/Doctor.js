import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  personalDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    qualification: { type: String, required: true },
    designation: { type: String, required: true }
  },
  practice_details: {
    specialty: { type: String, required: true },
    image_path: { type: String, required: true },
    city: { type: String, required: true },
    google_map: {
      qlink: { type: String, required: true }
    },
    schedule: {
      monday: {
        morning: { type: Boolean, default: false },
        morningHours: { type: String, default: '' },
        evening: { type: Boolean, default: false },
        eveningHours: { type: String, default: '' }
      },
      tuesday: {
        morning: { type: Boolean, default: false },
        morningHours: { type: String, default: '' },
        evening: { type: Boolean, default: false },
        eveningHours: { type: String, default: '' }
      },
      wednesday: {
        morning: { type: Boolean, default: false },
        morningHours: { type: String, default: '' },
        evening: { type: Boolean, default: false },
        eveningHours: { type: String, default: '' }
      },
      thursday: {
        morning: { type: Boolean, default: false },
        morningHours: { type: String, default: '' },
        evening: { type: Boolean, default: false },
        eveningHours: { type: String, default: '' }
      },
      friday: {
        morning: { type: Boolean, default: false },
        morningHours: { type: String, default: '' },
        evening: { type: Boolean, default: false },
        eveningHours: { type: String, default: '' }
      },
      saturday: {
        morning: { type: Boolean, default: false },
        morningHours: { type: String, default: '' },
        evening: { type: Boolean, default: false },
        eveningHours: { type: String, default: '' }
      },
      sunday: {
        morning: { type: Boolean, default: false },
        morningHours: { type: String, default: '' },
        evening: { type: Boolean, default: false },
        eveningHours: { type: String, default: '' }
      }
    },
    isOnline: { type: Boolean, default: true }, // New field to track doctor's availability
    unavailableDates: [{ // New field for storing unavailable dates
      startDate: { type: String, required: true },
      endDate: { type: String, required: true },
      reason: { type: String, default: 'Unavailable' }
    }]
  },
  // Add login credentials
  credentials: {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  }
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;