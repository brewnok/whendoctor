import React, { useState, useEffect } from 'react';
import { Search, MapPin, Stethoscope } from 'lucide-react';
import { SearchFilters } from '../types';
import { fetchCities, fetchSpecialties } from '../services/api';

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [selectedCity, setSelectedCity] = useState('Agartala');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [searchName, setSearchName] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFormOptions = async () => {
      setIsLoading(true);
      try {
        const [citiesData, specialtiesData] = await Promise.all([
          fetchCities(),
          fetchSpecialties()
        ]);
        setCities(citiesData);
        setSpecialties(specialtiesData);
      } catch (error) {
        console.error('Error loading form options:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormOptions();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      city: selectedCity,
      specialty: selectedSpecialty
    });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-center items-center h-24">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
          <p className="ml-3 text-gray-600">Loading search options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 text-white">
        <h2 className="text-2xl font-bold">Find Your Doctor</h2>
        <p className="mt-1 text-blue-100">Search for specialists in your city</p>
      </div>
      
      <form onSubmit={handleSearch} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Stethoscope size={18} className="text-blue-600" />
              <span>Specialty</span>
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          
            >
              <option value="">All specialties</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin size={18} className="text-blue-600" />
              <span>City</span>
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-[300px] flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Search size={20} />
            <span>Search Doctors</span>
          </button>
        </div>
      </form>
    </div>
  );
}