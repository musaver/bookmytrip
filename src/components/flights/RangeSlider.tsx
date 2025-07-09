'use client';

import React, { useState, useEffect, useRef } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatValue?: (value: number) => string;
  label?: string;
  prefix?: string;
  suffix?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  formatValue,
  label,
  prefix = '',
  suffix = ''
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const formatDisplayValue = (val: number) => {
    if (formatValue) return formatValue(val);
    return `${prefix}${val.toLocaleString()}${suffix}`;
  };

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100;
  };

  const getValueFromPercentage = (percentage: number) => {
    const value = min + (percentage / 100) * (max - min);
    return Math.round(value / step) * step;
  };

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const newValue = getValueFromPercentage(percentage);

    if (isDragging === 'min') {
      const newMin = Math.min(newValue, value[1]);
      if (newMin !== value[0]) {
        onChange([newMin, value[1]]);
      }
    } else {
      const newMax = Math.max(newValue, value[0]);
      if (newMax !== value[1]) {
        onChange([value[0], newMax]);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, value]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div className="range-slider-container" style={{ width: '100%', overflow: 'hidden' }}>
      {label && <label className="form-label mb-2">{label}</label>}
      
      <div className="range-slider-wrapper" style={{ padding: '20px 10px', width: '100%', boxSizing: 'border-box' }}>
        <div
          ref={sliderRef}
          className="range-slider-track"
          style={{
            position: 'relative',
            height: '6px',
            backgroundColor: '#e9ecef',
            borderRadius: '3px',
            cursor: 'pointer',
            width: '100%',
            margin: '0 10px'
          }}
        >
          {/* Active range */}
          <div
            className="range-slider-range"
            style={{
              position: 'absolute',
              height: '100%',
              backgroundColor: '#0d6efd',
              borderRadius: '3px',
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />
          
          {/* Min handle */}
          <div
            className="range-slider-handle"
            style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              backgroundColor: '#0d6efd',
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              cursor: 'grab',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              left: `${minPercentage}%`,
              zIndex: isDragging === 'min' ? 3 : 2
            }}
            onMouseDown={handleMouseDown('min')}
          />
          
          {/* Max handle */}
          <div
            className="range-slider-handle"
            style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              backgroundColor: '#0d6efd',
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              cursor: 'grab',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              left: `${maxPercentage}%`,
              zIndex: isDragging === 'max' ? 3 : 2
            }}
            onMouseDown={handleMouseDown('max')}
          />
        </div>
        
        {/* Value display */}
        <div className="range-slider-values d-flex justify-content-between mt-2">
          <span className="text-muted small">
            {formatDisplayValue(value[0])}
          </span>
          <span className="text-muted small">
            {formatDisplayValue(value[1])}
          </span>
        </div>
      </div>
    </div>
  );
}; 