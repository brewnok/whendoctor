import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Doctor from './models/Doctor.js';
import { seedDatabase } from './seedData.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Appointment from './models/Appointment.js';

// Configure dotenv with the proper path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB with better error handling
console.log(`Attempting to connect to MongoDB at: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/doctorDhundoDb'}`);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctorDhundoDb')
  .then(() => {
    console.log('Connected to MongoDB');
    // Check if database needs seeding
    seedDatabase();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    console.error('Check if MongoDB is running and the connection string is correct');
  });

// Debug route to check if the server is responding
app.get('/', (req, res) => {
  res.json({ message: 'Doctor Dhundo API is running!' });
});

// Routes
app.get('/api/doctors/cities', async (req, res) => {
  try {
    const cities = await Doctor.distinct('practice_details.city');
    console.log('Cities fetched:', cities);
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/doctors/specialties', async (req, res) => {
  try {
    const specialties = await Doctor.distinct('practice_details.specialty');
    console.log('Specialties fetched:', specialties);
    res.json(specialties);
  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update the /api/doctors route to include offline doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const { city, specialty, name } = req.query;
    
    const query = {};
    
    if (city) query['practice_details.city'] = city;
    if (specialty) query['practice_details.specialty'] = specialty;
    
    // Add regex search for name if provided - case insensitive
    if (name) {
      query['personalDetails.name'] = { $regex: name, $options: 'i' };
    }
    
    // Do NOT filter by isOnline status - we want all doctors to appear
    // Removed: query['practice_details.isOnline'] = true;
    
    console.log('Search query:', query);
    const doctors = await Doctor.find(query);
    console.log(`Found ${doctors.length} doctors`);
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin routes
app.post('/api/doctors', async (req, res) => {
  try {
    console.log('Creating new doctor:', req.body);
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(400).json({ message: error.message });
  }
});

// Add this update route after the POST route for doctors
app.put('/api/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating doctor with ID:', id, req.body);
    
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(updatedDoctor);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting doctor with ID:', id);
    
    const result = await Doctor.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add this route for booking appointments
app.post('/api/appointments', async (req, res) => {
  try {
    const { doctorId, doctorName, patientName, patientPhone, date, shift } = req.body;
    
    // Validate required fields
    if (!doctorId || !doctorName || !patientName || !patientPhone || !date || !shift) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Create and save the appointment
    const appointment = new Appointment({
      doctorId,
      doctorName,
      patientName,
      patientPhone,
      date,
      shift
    });
    
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get appointments for a specific doctor (for future admin functionality)
app.get('/api/appointments/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctorId }).sort({ date: 1, shift: 1 });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add these routes to handle doctor authentication and appointment retrieval

// Doctor login
app.post('/api/doctors/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log(`Doctor login attempt for username: ${username}`);
    
    // Simple string comparison for password - in a production app, you should use proper password hashing
    const doctor = await Doctor.findOne({ 'credentials.username': username });
    
    if (!doctor) {
      console.log('Doctor not found with username:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Simple password check
    if (doctor.credentials.password !== password) {
      console.log('Invalid password for doctor:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Return doctor info (excluding password)
    const doctorInfo = {
      id: doctor._id.toString(), // Explicitly convert ObjectId to string
      name: doctor.personalDetails.name,
      specialty: doctor.practice_details.specialty
    };
    
    console.log('Doctor login successful:', doctorInfo);
    res.json({ doctor: doctorInfo });
  } catch (error) {
    console.error('Error during doctor login:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update the doctor appointments route with better logging and error handling

// Get appointments for the logged-in doctor
app.get('/api/doctors/:doctorId/appointments', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // Optional date filter
    
    
    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }
    
    // Validate that doctorId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
    let query = { doctorId };
    
    // Add date filter if provided
    if (date) {
      query.date = date;
    }
    
    
    // Get appointments sorted by date and shift
    const appointments = await Appointment.find(query).sort({ date: 1, shift: 1 });
    
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add this route handler after your other appointment routes
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId } = req.body;
    
    console.log(`Attempting to delete appointment ${id} by doctor ${doctorId}`);
    
    // Find the appointment first
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Verify that the doctor has permission to delete this appointment
    if (appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({ message: 'Unauthorized to delete this appointment' });
    }
    
    // Delete the appointment
    await Appointment.findByIdAndDelete(id);
    
    console.log(`Successfully deleted appointment ${id}`);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add this route handler after your existing doctor routes

// Get doctor by ID
app.get('/api/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add a route for doctors to toggle their online status
app.post('/api/doctors/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
    // Find the doctor first to get current status
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Toggle the status
    const currentStatus = doctor.practice_details.isOnline;
    const newStatus = !currentStatus;
    
    // Update the doctor's status
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { 'practice_details.isOnline': newStatus },
      { new: true }
    );
    
    res.json({ 
      message: `Doctor is now ${newStatus ? 'online' : 'offline'}`,
      isOnline: newStatus
    });
  } catch (error) {
    console.error('Error toggling doctor status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add these routes after your existing doctor routes

// Add unavailable date range
app.post('/api/doctors/:id/unavailable-dates', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, reason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }
    
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Initialize unavailableDates array if it doesn't exist
    if (!doctor.practice_details.unavailableDates) {
      doctor.practice_details.unavailableDates = [];
    }
    
    // Add new unavailable date range
    doctor.practice_details.unavailableDates.push({
      startDate,
      endDate,
      reason: reason || 'Unavailable'
    });
    
    await doctor.save();
    
    res.status(201).json({
      message: 'Unavailable dates added successfully',
      unavailableDates: doctor.practice_details.unavailableDates
    });
  } catch (error) {
    console.error('Error adding unavailable dates:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all unavailable dates for a doctor
app.get('/api/doctors/:id/unavailable-dates', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor.practice_details.unavailableDates || []);
  } catch (error) {
    console.error('Error fetching unavailable dates:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete an unavailable date range
app.delete('/api/doctors/:id/unavailable-dates/:dateId', async (req, res) => {
  try {
    const { id, dateId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    if (!doctor.practice_details.unavailableDates) {
      return res.status(404).json({ message: 'No unavailable dates found' });
    }
    
    // Filter out the date range to delete
    doctor.practice_details.unavailableDates = doctor.practice_details.unavailableDates.filter(
      date => date._id.toString() !== dateId
    );
    
    await doctor.save();
    
    res.json({
      message: 'Unavailable date range deleted successfully',
      unavailableDates: doctor.practice_details.unavailableDates
    });
  } catch (error) {
    console.error('Error deleting unavailable date range:', error);
    res.status(500).json({ message: error.message });
  }
});

// Server startup
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to verify the API is working`);
});

// For your server.js
app.get('/api/doctors/:doctorId/appointments', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    if (!doctorId || !date) {
      return res.status(400).json({ message: 'Doctor ID and date are required' });
    }
    
    const appointments = await Appointment.find({
      doctorId,
      date
    }).sort({ shift: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: error.message });
  }
});