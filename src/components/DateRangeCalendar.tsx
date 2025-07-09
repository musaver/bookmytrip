'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DateRangeCalendarProps {
    startDate: Date | null;
    endDate: Date | null;
    onDateChange: (startDate: Date | null, endDate: Date | null) => void;
    onClose?: () => void;
    isOpen: boolean;
    minDate?: Date;
    maxDate?: Date;
    className?: string;
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isInRange: boolean;
    isStartDate: boolean;
    isEndDate: boolean;
    isDisabled: boolean;
}

const DateRangeCalendar: React.FC<DateRangeCalendarProps> = ({
    startDate,
    endDate,
    onDateChange,
    onClose,
    isOpen,
    minDate = new Date(),
    maxDate,
    className = ''
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [nextMonth, setNextMonth] = useState(() => {
        const next = new Date(currentMonth);
        next.setMonth(next.getMonth() + 1);
        return next;
    });
    const [selectingStartDate, setSelectingStartDate] = useState(true);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    const calendarRef = useRef<HTMLDivElement>(null);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    useEffect(() => {
        const next = new Date(currentMonth);
        next.setMonth(next.getMonth() + 1);
        setNextMonth(next);
    }, [currentMonth]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                onClose?.();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const isSameDay = (date1: Date, date2: Date): boolean => {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    };

    const isDateInRange = (date: Date, start: Date | null, end: Date | null): boolean => {
        if (!start || !end) return false;
        return date >= start && date <= end;
    };

    const isDateDisabled = (date: Date): boolean => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
    };

    const generateCalendarDays = (month: Date): CalendarDay[] => {
        const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
        const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const startCalendarDate = new Date(firstDay);
        startCalendarDate.setDate(startCalendarDate.getDate() - firstDay.getDay());

        const days: CalendarDay[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 42; i++) {
            const date = new Date(startCalendarDate);
            date.setDate(startCalendarDate.getDate() + i);
            date.setHours(0, 0, 0, 0);

            const isCurrentMonth = date.getMonth() === month.getMonth();
            const isToday = isSameDay(date, today);
            const isStartSelected = startDate && isSameDay(date, startDate);
            const isEndSelected = endDate && isSameDay(date, endDate);
            const isSelected = isStartSelected || isEndSelected;
            
            let isInRange = false;
            if (startDate && endDate) {
                isInRange = isDateInRange(date, startDate, endDate) && !isSelected;
            } else if (startDate && hoveredDate && !selectingStartDate) {
                const rangeStart = startDate < hoveredDate ? startDate : hoveredDate;
                const rangeEnd = startDate < hoveredDate ? hoveredDate : startDate;
                isInRange = isDateInRange(date, rangeStart, rangeEnd) && !isSameDay(date, rangeStart) && !isSameDay(date, rangeEnd);
            }

            days.push({
                date,
                isCurrentMonth,
                isToday,
                isSelected: isSelected || false,
                isInRange,
                isStartDate: isStartSelected || false,
                isEndDate: isEndSelected || false,
                isDisabled: isDateDisabled(date)
            });
        }

        return days;
    };

    const handleDateClick = (date: Date) => {
        if (isDateDisabled(date)) return;

        if (selectingStartDate || !startDate) {
            onDateChange(date, null);
            setSelectingStartDate(false);
        } else {
            if (date < startDate) {
                onDateChange(date, startDate);
            } else {
                onDateChange(startDate, date);
            }
            setSelectingStartDate(true);
        }
    };

    const handleDateHover = (date: Date) => {
        if (!isDateDisabled(date)) {
            setHoveredDate(date);
        }
    };

    const handleMouseLeave = () => {
        setHoveredDate(null);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(currentMonth);
        if (direction === 'prev') {
            newMonth.setMonth(newMonth.getMonth() - 1);
        } else {
            newMonth.setMonth(newMonth.getMonth() + 1);
        }
        setCurrentMonth(newMonth);
    };

    const clearDates = () => {
        onDateChange(null, null);
        setSelectingStartDate(true);
    };

    const formatDate = (date: Date | null): string => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (!isOpen) return null;

    const currentMonthDays = generateCalendarDays(currentMonth);
    const nextMonthDays = generateCalendarDays(nextMonth);

    return (
        <div 
            ref={calendarRef}
            className={`date-range-calendar position-absolute ${className}`}
            style={{ 
                zIndex: 1050, 
                minWidth: '650px',
                top: '100%',
                left: '0'
            }}
        >
            {/* Header */}
            <div className="daterange-calendar-header">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="mb-1 fw-semibold text-dark">Select dates</h6>
                        <p className="mb-0 text-muted small">
                            {startDate && endDate 
                                ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                                : startDate 
                                    ? `${formatDate(startDate)} - Add checkout date`
                                    : 'Add your travel dates for exact pricing'
                            }
                        </p>
                    </div>
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={onClose}
                        aria-label="Close"
                    ></button>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="d-flex justify-content-between align-items-center mb-3 px-4 py-3">
                <button 
                    type="button" 
                    className="calendar-nav-btn"
                    onClick={() => navigateMonth('prev')}
                >
                    <i className="isax isax-arrow-left-2"></i>
                </button>
                <div className="d-flex gap-5">
                    <h6 className="mb-0 calendar-month-header">
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h6>
                    <h6 className="mb-0 calendar-month-header">
                        {monthNames[nextMonth.getMonth()]} {nextMonth.getFullYear()}
                    </h6>
                </div>
                <button 
                    type="button" 
                    className="calendar-nav-btn"
                    onClick={() => navigateMonth('next')}
                >
                    <i className="isax isax-arrow-right-3"></i>
                </button>
            </div>

            {/* Calendars */}
            <div className="d-flex gap-4 px-4" onMouseLeave={handleMouseLeave}>
                {/* Current Month */}
                <div className="flex-fill">
                    <div className="row g-0 mb-2">
                        {dayNames.map(day => (
                            <div key={day} className="col text-center">
                                <small className="calendar-day-header">{day}</small>
                            </div>
                        ))}
                    </div>
                    <div className="calendar-grid">
                        {Array.from({ length: 6 }, (_, weekIndex) => (
                            <div key={weekIndex} className="row g-0">
                                {currentMonthDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                                    <div key={dayIndex} className="col">
                                        <button
                                            type="button"
                                            className={`
                                                calendar-day w-100 border-0 p-2 position-relative
                                                ${day.isCurrentMonth ? 'is-current-month' : ''}
                                                ${day.isToday ? 'today' : ''}
                                                ${day.isStartDate ? 'start-date' : ''}
                                                ${day.isEndDate ? 'end-date' : ''}
                                                ${day.isInRange ? 'in-range' : ''}
                                                ${day.isDisabled ? 'disabled' : 'available'}
                                                ${day.date.getDay() === 0 || day.date.getDay() === 6 ? 'weekend' : ''}
                                            `.trim()}
                                            onClick={() => handleDateClick(day.date)}
                                            onMouseEnter={() => handleDateHover(day.date)}
                                            disabled={day.isDisabled}
                                        >
                                            <span className="day-number">{day.date.getDate()}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next Month */}
                <div className="flex-fill">
                    <div className="row g-0 mb-2">
                        {dayNames.map(day => (
                            <div key={day} className="col text-center">
                                <small className="calendar-day-header">{day}</small>
                            </div>
                        ))}
                    </div>
                    <div className="calendar-grid">
                        {Array.from({ length: 6 }, (_, weekIndex) => (
                            <div key={weekIndex} className="row g-0">
                                {nextMonthDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                                    <div key={dayIndex} className="col">
                                        <button
                                            type="button"
                                            className={`
                                                calendar-day w-100 border-0 p-2 position-relative
                                                ${day.isCurrentMonth ? 'is-current-month' : ''}
                                                ${day.isToday ? 'today' : ''}
                                                ${day.isStartDate ? 'start-date' : ''}
                                                ${day.isEndDate ? 'end-date' : ''}
                                                ${day.isInRange ? 'in-range' : ''}
                                                ${day.isDisabled ? 'disabled' : 'available'}
                                                ${day.date.getDay() === 0 || day.date.getDay() === 6 ? 'weekend' : ''}
                                            `.trim()}
                                            onClick={() => handleDateClick(day.date)}
                                            onMouseEnter={() => handleDateHover(day.date)}
                                            disabled={day.isDisabled}
                                        >
                                            <span className="day-number">{day.date.getDate()}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="calendar-footer">
                <div className="d-flex justify-content-between align-items-center">
                    <button 
                        type="button" 
                        className="btn btn-link btn-clear-dates p-0"
                        onClick={clearDates}
                    >
                        Clear dates
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-primary btn-apply-dates"
                        onClick={onClose}
                        disabled={!startDate || !endDate}
                    >
                        Apply dates
                    </button>
                </div>
            </div>


        </div>
    );
};

export default DateRangeCalendar; 