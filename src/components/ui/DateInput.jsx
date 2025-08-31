import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

const DateInput = ({ label, value, onChange, className, readOnly, minDate, ...props }) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Safely handle date value changes
  useEffect(() => {
    // Only update if value is a valid date
    if (value) {
      // Handle DD-MM-YYYY format
      if (typeof value === 'string' && /^\d{1,2}-\d{1,2}-\d{4}/.test(value)) {
        const [day, month, year] = value.split('-');
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
          return;
        }
      }
      
      // Standard date parsing
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        return;
      }
    }
    
    setSelectedDate(null);
  }, [value]);
  
  // Safe date change handler
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (onChange) {
      onChange(date);
    }
    setOpen(false);
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          onInputClick={() => !readOnly && setOpen(true)}
          onClickOutside={() => setOpen(false)}
          open={open && !readOnly}
          dateFormat="yyyy-MM-dd"
          className={cn(
            "w-full px-3 py-2 text-sm border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10",
            readOnly ? "bg-gray-50 cursor-not-allowed" : "bg-white"
          )}
          readOnly={readOnly}
          disabled={readOnly}
          minDate={minDate}
          {...props}
        />
        {!readOnly && (
          <CalendarIcon
            className="absolute w-5 h-5 text-gray-500 cursor-pointer right-3 top-1/2 transform -translate-y-1/2"
            onClick={() => !readOnly && setOpen(!open)}
          />
        )}
      </div>
    </div>
  );
};

export default DateInput;
