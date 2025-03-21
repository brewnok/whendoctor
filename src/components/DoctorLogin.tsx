import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Stethoscope } from 'lucide-react';
import logo from '../images/LOGO_MYTUTOR.png';
import doctorbg from '../images/doctor_login_bg.jpg'

export default function DoctorLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/doctors/login', {
        username,
        password
      });
      
      // Store doctor info in session storage
      sessionStorage.setItem('doctorAuthenticated', 'true');
      sessionStorage.setItem('doctorInfo', JSON.stringify(response.data.doctor));
      
      // Redirect to doctor dashboard
      navigate('/doctor/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center bg-cover bg-center" 
      style={{ backgroundImage: `url(${doctorbg})` }}
    >
      <div className="w-full max-w-md p-8 space-y-8 bg-white bg-opacity-95 rounded-xl shadow-xl backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <img src={logo} alt="Doctor Dhundo Logo" className="h-12 mb-2" />
          <h2 className="mt-2 text-center text-3xl font-bold text-gray-900 flex items-center">
            <Stethoscope className="mr-2 text-blue-600" />
            Doctor Login
          </h2>
          
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}