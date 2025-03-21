import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trash2, AlertCircle } from 'lucide-react';
import { getUnavailableDates, addUnavailableDate, deleteUnavailableDate } from '../services/api';

interface UnavailablePeriod {
  _id: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface UnavailableDatesManagerProps {
  doctorId: string;
}

export default function UnavailableDatesManager({ doctorId }: UnavailableDatesManagerProps) {
  const [unavailableDates, setUnavailableDates] = useState<UnavailablePeriod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newRange, setNewRange] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [showForm, setShowForm] = useState(false);

  // Load unavailable dates
  const loadUnavailableDates = async () => {
    setIsLoading(true);
    try {
      const data = await getUnavailableDates(doctorId);
      setUnavailableDates(data);
    } catch (error) {
      console.error('Error loading unavailable dates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      loadUnavailableDates();
    }
  }, [doctorId]);

  // Handle input change for the new date range
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new unavailable date range
  const handleAddUnavailableDate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRange.startDate || !newRange.endDate) {
      alert('Start date and end date are required');
      return;
    }
    
    setIsAdding(true);
    try {
      await addUnavailableDate(doctorId, newRange);
      await loadUnavailableDates(); // Refresh the list
      setNewRange({ startDate: '', endDate: '', reason: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding unavailable date range:', error);
      alert('Failed to add unavailable date range');
    } finally {
      setIsAdding(false);
    }
  };

  // Delete an unavailable date range
  const handleDeleteUnavailableDate = async (id: string) => {
    setDeleteId(id);
    try {
      await deleteUnavailableDate(doctorId, id);
      await loadUnavailableDates(); // Refresh the list
    } catch (error) {
      console.error('Error deleting unavailable date range:', error);
      alert('Failed to delete unavailable date range');
    } finally {
      setDeleteId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar size={18} className="mr-2 text-blue-600" />
          Unavailable Dates
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
        >
          {showForm ? "Cancel" : "+ Add Date Range"}
        </button>
      </div>

      {/* Form for adding new date range */}
      {showForm && (
        <form onSubmit={handleAddUnavailableDate} className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={newRange.startDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]} // Min date is today
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={newRange.endDate}
                onChange={handleInputChange}
                min={newRange.startDate || new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason (optional)
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={2}
              value={newRange.reason}
              onChange={handleInputChange}
              placeholder="E.g., Vacation, Medical leave, etc."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isAdding}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              {isAdding ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></span>
                  Adding...
                </>
              ) : (
                'Add Unavailable Period'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Display unavailable date ranges */}
      {isLoading ? (
        <div className="text-center py-4">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading unavailable dates...</p>
        </div>
      ) : unavailableDates.length === 0 ? (
        <div className="text-center py-4 bg-gray-50 rounded-md">
          <Calendar size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No unavailable dates set</p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-2 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {unavailableDates.map((period) => (
                <tr key={period._id}>
                  <td className="py-3 pl-4 pr-3 text-sm">
                    <div className="flex items-center">
                      <Clock size={16} className="text-gray-400 mr-2" />
                      <span>
                        {formatDate(period.startDate)} - {formatDate(period.endDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">
                    {period.reason || 'Unavailable'}
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteUnavailableDate(period._id)}
                      disabled={deleteId === period._id}
                      className="text-red-600 hover:text-red-900 flex items-center ml-auto"
                    >
                      {deleteId === period._id ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-red-600 border-r-transparent mr-1"></span>
                      ) : (
                        <Trash2 size={16} className="mr-1" />
                      )}
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}