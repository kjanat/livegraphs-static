'use client';

import { useState, useEffect } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface DateRangePickerProps {
  minDate?: string;
  maxDate?: string;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

export function DateRangePicker({ minDate, maxDate, onDateRangeChange }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Set default to last month when dates are available
  useEffect(() => {
    if (minDate && maxDate && !startDate && !endDate) {
      const max = new Date(maxDate);
      const lastMonthStart = subMonths(max, 1);
      const defaultStart = lastMonthStart < new Date(minDate) ? new Date(minDate) : lastMonthStart;
      
      setStartDate(format(defaultStart, 'yyyy-MM-dd'));
      setEndDate(format(max, 'yyyy-MM-dd'));
      
      // Trigger initial load
      onDateRangeChange(defaultStart, max);
    }
  }, [minDate, maxDate]); // Remove startDate, endDate, and onDateRangeChange from deps to avoid infinite loop

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    
    // Ensure end date is not before start date
    if (endDate && newStart > endDate) {
      setEndDate(newStart);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handleApply = () => {
    if (startDate && endDate) {
      onDateRangeChange(new Date(startDate), new Date(endDate));
    }
  };

  const handlePresetRange = (preset: 'lastWeek' | 'lastMonth' | 'last3Months' | 'all') => {
    if (!maxDate) return;
    
    const max = new Date(maxDate);
    let start: Date;
    
    switch (preset) {
      case 'lastWeek':
        start = new Date(max);
        start.setDate(start.getDate() - 7);
        break;
      case 'lastMonth':
        start = subMonths(max, 1);
        break;
      case 'last3Months':
        start = subMonths(max, 3);
        break;
      case 'all':
        start = new Date(minDate || max);
        break;
    }
    
    // Ensure start is not before minDate
    if (minDate && start < new Date(minDate)) {
      start = new Date(minDate);
    }
    
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(max, 'yyyy-MM-dd'));
    onDateRangeChange(start, max);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Date Range</h2>
      
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handlePresetRange('lastWeek')}
          className="px-3 py-1 text-sm text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded"
        >
          Last Week
        </button>
        <button
          onClick={() => handlePresetRange('lastMonth')}
          className="px-3 py-1 text-sm text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded"
        >
          Last Month
        </button>
        <button
          onClick={() => handlePresetRange('last3Months')}
          className="px-3 py-1 text-sm text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded"
        >
          Last 3 Months
        </button>
        <button
          onClick={() => handlePresetRange('all')}
          className="px-3 py-1 text-sm text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded"
        >
          All Data
        </button>
      </div>
      
      {/* Date inputs */}
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm text-gray-700 font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            min={minDate}
            max={maxDate}
            className="px-3 py-2 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-700 font-medium mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            min={startDate || minDate}
            max={maxDate}
            className="px-3 py-2 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={handleApply}
          disabled={!startDate || !endDate}
          className="mt-6 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
      
      {startDate && endDate && (
        <p className="mt-4 text-sm text-gray-700">
          Showing data from {format(new Date(startDate), 'MMM d, yyyy')} to {format(new Date(endDate), 'MMM d, yyyy')}
        </p>
      )}
    </div>
  );
}