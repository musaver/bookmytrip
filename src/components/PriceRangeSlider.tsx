'use client';

import React from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import styles from './PriceRangeSlider.module.css';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 100,
  formatValue = (val) => `₹${val.toLocaleString()}`,
  className = ''
}) => {
  const handleChange = (values: number[]) => {
    onChange([values[0], values[1]]);
  };

  return (
    <div className={`${styles.priceRangeSlider} ${className}`}>
      <div style={{ padding: '0px 0' }}>
        <RangeSlider
          min={min}
          max={max}
          step={step}
          value={value}
          onInput={handleChange}
        />
        
        {/* Value display */}
        <div className="d-flex justify-content-between mt-2">
          <span className="text-muted small">
            {formatValue(value[0])}
          </span>
          <span className="text-muted small">
            {formatValue(value[1])}
          </span>
        </div>
      </div>
    </div>
  );
}; 