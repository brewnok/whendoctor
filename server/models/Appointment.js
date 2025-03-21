import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor',
    required: true
  },
  doctorName: {
    type: String, 
    required: true
  },
  patientName: { 
    type: String, 
    required: true 
  },
  patientPhone: { 
    type: String, 
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  shift: { 
    type: String, 
    required: true,
    enum: ['morning', 'evening'] 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;