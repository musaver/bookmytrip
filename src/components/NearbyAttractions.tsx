import React, { useState, useMemo } from 'react';
import { Attraction, DistanceSummary } from '@/types/attractions';
import { 
  filterAttractionsByCategory, 
  sortAttractionsByDistance, 
  sortAttractionsByName,
  groupAttractionsByCategory,
  calculateDistanceSummary,
  getCategoryConfig
} from '@/utils/attractionUtils';

interface NearbyAttractionsProps {
  attractions: Attraction[];
  showCategories?: boolean;
  distanceUnit?: 'km' | 'miles';
  className?: string;
}

const NearbyAttractions: React.FC<NearbyAttractionsProps> = ({
  attractions,
  showCategories = true,
  distanceUnit = 'km',
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');

  // Get unique categories from attractions
  const categories = useMemo(() => {
    const uniqueCategories = ['all', ...new Set(attractions.map(a => a.category).filter(Boolean))];
    return uniqueCategories.filter((cat): cat is string => cat != null);
  }, [attractions]);

  // Filter and sort attractions
  const processedAttractions = useMemo(() => {
    let filtered = filterAttractionsByCategory(attractions, selectedCategory);
    
    if (sortBy === 'distance') {
      filtered = sortAttractionsByDistance(filtered);
    } else {
      filtered = sortAttractionsByName(filtered);
    }
    
    return filtered;
  }, [attractions, selectedCategory, sortBy]);

  // Group attractions by category for display
  const groupedAttractions = useMemo(() => {
    if (selectedCategory === 'all') {
      return groupAttractionsByCategory(processedAttractions);
    }
    return { [selectedCategory]: processedAttractions };
  }, [processedAttractions, selectedCategory]);

  // Calculate distance summary
  const distanceSummary = useMemo(() => {
    return calculateDistanceSummary(attractions);
  }, [attractions]);

  const formatDistance = (distance: Attraction['distance']) => {
    if (distanceUnit === 'miles') {
      return `${distance.miles} mi`;
    }
    return `${distance.km} km`;
  };

  const formatCategoryName = (category: string) => {
    if (category === 'all') return 'All Categories';
    return getCategoryConfig(category).label;
  };

  if (attractions.length === 0) {
    return (
      <div className={`text-center py-4 text-muted ${className}`}>
        <i className="fas fa-map-marker-alt display-4 mb-3 text-muted"></i>
        <p>No nearby attractions information available</p>
      </div>
    );
  }

  return (
    <div className={`nearby-attractions ${className}`}>
      <style jsx>{`
        .text-purple { color: #6f42c1; }
        .bg-purple-subtle { background-color: rgba(111, 66, 193, 0.1); }
        .bg-warning-subtle { background-color: rgba(255, 193, 7, 0.1); }
        .bg-success-subtle { background-color: rgba(25, 135, 84, 0.1); }
        .bg-primary-subtle { background-color: rgba(13, 110, 253, 0.1); }
        .bg-danger-subtle { background-color: rgba(220, 53, 69, 0.1); }
        .bg-secondary-subtle { background-color: rgba(108, 117, 125, 0.1); }
        .bg-info-subtle { background-color: rgba(13, 202, 240, 0.1); }
        .bg-dark-subtle { background-color: rgba(33, 37, 41, 0.1); }
      `}</style>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="text-primary mb-0">
          <i className="fas fa-map-marker-alt me-2"></i>
          Nearby Attractions ({attractions.length})
        </h6>
        
        <div className="d-flex gap-2">
          {showCategories && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {formatCategoryName(category)}
                </option>
              ))}
            </select>
          )}
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'distance' | 'name')}
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
          >
            <option value="distance">Sort by Distance</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Distance Summary */}
      <div className="row mb-4 d-none">
        <div className="col-md-4">
          <div className="text-center p-3 bg-success bg-opacity-10 rounded">
            <div className="h5 text-success mb-1">{distanceSummary.within1km}</div>
            <small className="text-muted">Within 1km</small>
            <div className="mt-1">
              <i className="fas fa-walking text-success"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
            <div className="h5 text-warning mb-1">{distanceSummary.within1to5km}</div>
            <small className="text-muted">1-5km away</small>
            <div className="mt-1">
              <i className="fas fa-bicycle text-warning"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="text-center p-3 bg-info bg-opacity-10 rounded">
            <div className="h5 text-info mb-1">{distanceSummary.beyond5km}</div>
            <small className="text-muted">5km+ away</small>
            <div className="mt-1">
              <i className="fas fa-car text-info"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Attractions List */}
      <div className="attractions-list">
        {Object.entries(groupedAttractions).map(([category, categoryAttractions]) => {
          const config = getCategoryConfig(category);
          
          return (
            <div key={category} className="mb-4">
              {selectedCategory === 'all' && (
                <div className="mb-3">
                  <h6 className={`d-flex align-items-center mb-2 ${config.color}`}>
                    <i className={`${config.icon} me-2`}></i>
                    {config.label}
                    <span className="badge bg-secondary ms-2">{categoryAttractions.length}</span>
                  </h6>
                  <hr className="mt-1 mb-3" />
                </div>
              )}
              
              <div className="row">
                {categoryAttractions.map((attraction) => (
                  <div key={attraction.id} className="col-md-6 mb-3">
                    <div className={`card h-100 border-0 shadow-sm ${config.bgColor}`}>
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-1 fw-semibold text-dark">
                            {attraction.name}
                          </h6>
                          <span className={`badge bg-primary text-white`}>
                            {formatDistance(attraction.distance)}
                          </span>
                        </div>
                        
                        {attraction.description && (
                          <p className="card-text text-muted small mb-2">
                            {attraction.description}
                          </p>
                        )}
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge bg-light text-dark border">
                            <i className="fas fa-tag me-1"></i>
                            {attraction.type}
                          </span>
                          <small className="text-muted">
                            <i className="fas fa-walking me-1"></i>
                            {distanceUnit === 'km' ? 
                              `${attraction.distance.miles} mi` : 
                              `${attraction.distance.km} km`
                            }
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {processedAttractions.length === 0 && (
        <div className="text-center py-4 text-muted">
          <i className="fas fa-filter display-6 mb-2"></i>
          <p>No attractions found in this category.</p>
        </div>
      )}

      
    </div>
  );
};

export default NearbyAttractions;
