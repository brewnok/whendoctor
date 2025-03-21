import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchForm from './components/SearchForm';
import DoctorCard from './components/DoctorCard';
import { SearchFilters } from './types';
import { fetchDoctors } from './services/api';
import Admin from './pages/Admin';
import Doctor from './pages/Doctor';

// Import the logo image
import logo from './images/LOGO_MYTUTOR.png';
import { User, Search } from 'lucide-react';

function HomePage() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [displayedResults, setDisplayedResults] = useState<any[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true);
    try {
      // Create a clean filters object that only includes non-empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const doctors = await fetchDoctors(cleanFilters);
      setSearchResults(doctors);
      setDisplayedResults(doctors); // Initialize displayed results with all search results
      setNameFilter(''); // Reset name filter
      setHasSearched(true);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setSearchResults([]);
      setDisplayedResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameFilter(value);
    
    if (!value.trim()) {
      // If empty, show all results
      setDisplayedResults(searchResults);
    } else {
      // Filter the existing search results by name
      const filtered = searchResults.filter(doctor => 
        doctor.personalDetails.name.toLowerCase().includes(value.toLowerCase())
      );
      setDisplayedResults(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <img src={logo} alt="Doctor Dhundo Logo" className="h-16" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <SearchForm onSearch={handleSearch} />

          {hasSearched && (
            <div className="mt-8">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
                  <p className="mt-2 text-gray-600">Finding doctors for you...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Found {searchResults.length} matching doctors
                  </h2>
                  
                  {/* Name filter input */}
                  <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <div className="max-w mx-auto">
                      {/* <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User size={16} className="text-blue-600" />
                        <span>Filter results by doctor name</span>
                      </label> */}
                      <div className="relative">
                        <input
                          type="text"
                          value={nameFilter}
                          onChange={handleNameFilterChange}
                          placeholder="Type doctor name to filter results..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Showing {displayedResults.length} of {searchResults.length} doctors
                      </p>
                    </div>
                  </div>
                  
                  {displayedResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {displayedResults.map((doctor, index) => (
                        <DoctorCard key={index} doctor={doctor} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 rounded-lg bg-white shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors match your name filter</h3>
                      <p className="text-gray-600">
                        Try a different name or clear the filter to see all results.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 px-4 rounded-lg bg-white shadow">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No Doctors Found</h2>
                  <p className="text-gray-600">
                    No doctors match your search criteria. Try adjusting your filters.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/doctor/*" element={<Doctor />} />
      </Routes>
    </Router>
  );
}

export default App;