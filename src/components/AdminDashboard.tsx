import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash, Edit2, Search, Filter } from 'lucide-react';
import AddDoctorForm from './AddDoctorForm';
import EditDoctorForm from './EditDoctorForm';
import { fetchDoctors, fetchCities, deleteDoctor } from '../services/api';

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }

    loadDoctors();
    loadCities();
  }, [navigate]);

  const loadCities = async () => {
    try {
      const citiesData = await fetchCities();
      setCities(citiesData);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const loadDoctors = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDoctors({});
      setDoctors(data);
      setFilteredDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters whenever searchTerm or selectedCity changes
  useEffect(() => {
    let result = [...doctors];
    
    // Apply name search filter
    if (searchTerm) {
      result = result.filter(doctor => 
        doctor.personalDetails.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply city filter
    if (selectedCity) {
      result = result.filter(doctor => 
        doctor.practice_details.city === selectedCity
      );
    }
    
    setFilteredDoctors(result);
  }, [searchTerm, selectedCity, doctors]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    navigate('/admin');
  };

  const handleDeleteDoctor = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await deleteDoctor(id);
        // Refresh the doctors list
        await loadDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const handleEditDoctor = (doctor: any) => {
    setEditingDoctor(doctor);
    setShowAddForm(false);
  };

  const handleDoctorAdded = () => {
    setShowAddForm(false);
    loadDoctors(); // Refresh the doctor list
  };

  const handleDoctorUpdated = () => {
    setEditingDoctor(null);
    loadDoctors(); // Refresh the doctor list
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div>
            {!editingDoctor && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="mr-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {showAddForm ? 'Cancel' : 'Add New Doctor'}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        {editingDoctor ? (
          <EditDoctorForm 
            doctor={editingDoctor} 
            onDoctorUpdated={handleDoctorUpdated} 
            onCancel={() => setEditingDoctor(null)} 
          />
        ) : showAddForm ? (
          <AddDoctorForm 
            onDoctorAdded={handleDoctorAdded} 
            onCancel={() => setShowAddForm(false)} 
          />
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Manage Doctors</h2>
            
            {/* Search and filter section */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Name search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by doctor name..."
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* City filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={18} className="text-gray-400" />
                </div>
                <select
                  value={selectedCity}
                  onChange={handleCityChange}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Clear filters button */}
              <div className="flex items-center">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 underline flex items-center"
                  disabled={!searchTerm && !selectedCity}
                >
                  Clear filters
                </button>
                {(searchTerm || selectedCity) && (
                  <span className="ml-2 text-sm text-gray-600">
                    Showing {filteredDoctors.length} of {doctors.length} doctors
                  </span>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="ml-2">Loading doctors...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {filteredDoctors.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Specialty
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          City
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDoctors.map((doctor) => (
                        <tr key={doctor._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {doctor.personalDetails.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {doctor.practice_details.specialty}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {doctor.practice_details.city}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {doctor.personalDetails.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleEditDoctor(doctor)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteDoctor(doctor._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No doctors match your search criteria</p>
                    <button 
                      onClick={clearFilters}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear filters and show all doctors
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}