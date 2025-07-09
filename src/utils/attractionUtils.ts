import { Attraction, DistanceSummary } from '@/types/attractions';

// Parse attraction text into structured data
export const parseAttractionText = (text: string): Attraction[] => {
  if (!text || typeof text !== 'string') return [];

  // Remove the header text
  const cleanText = text.replace(/^Distances are displayed to the nearest 0\.1 mile and kilometer\.\s*/, '');
  
  // Split by common patterns and extract attractions
  const attractionPattern = /([^-]+?)\s*-\s*([0-9.]+)\s*km\s*\/\s*([0-9.]+)\s*mi/g;
  const attractions: Attraction[] = [];
  let match;

  while ((match = attractionPattern.exec(cleanText)) !== null) {
    const name = match[1].trim();
    const km = parseFloat(match[2]);
    const miles = parseFloat(match[3]);

    if (name && !isNaN(km) && !isNaN(miles)) {
      attractions.push({
        id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        name,
        distance: { km, miles },
        category: categorizeAttraction(name),
        type: name.includes('Museum') ? 'Museum' : 
              name.includes('Lake') ? 'Lake' : 
              name.includes('Park') ? 'Park' : 
              name.includes('Fort') ? 'Fort' : 
              name.includes('Mosque') ? 'Mosque' : 
              name.includes('Relief') || name.includes('Ruins') ? 'Archaeological Site' : 
              'Attraction'
      });
    }
  }

  return attractions;
};

// Categorize attraction based on name
export const categorizeAttraction = (name: string): Attraction['category'] => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('museum')) return 'museum';
  if (lowerName.includes('fort') || lowerName.includes('relief') || lowerName.includes('ruins')) return 'historical';
  if (lowerName.includes('lake') || lowerName.includes('national')) return 'natural';
  if (lowerName.includes('park')) return 'park';
  if (lowerName.includes('mosque') || lowerName.includes('temple') || lowerName.includes('church')) return 'religious';
  if (lowerName.includes('buddha') || lowerName.includes('cultural')) return 'cultural';
  if (lowerName.includes('beach')) return 'beach';
  if (lowerName.includes('mall') || lowerName.includes('market') || lowerName.includes('shopping')) return 'shopping';
  if (lowerName.includes('hospital') || lowerName.includes('clinic')) return 'healthcare';
  if (lowerName.includes('university') || lowerName.includes('school') || lowerName.includes('college')) return 'education';
  if (lowerName.includes('stadium') || lowerName.includes('sports') || lowerName.includes('gym')) return 'recreation';
  if (lowerName.includes('station') || lowerName.includes('airport') || lowerName.includes('terminal')) return 'transportation';
  if (lowerName.includes('cinema') || lowerName.includes('theater') || lowerName.includes('entertainment')) return 'entertainment';
  if (lowerName.includes('monument') || lowerName.includes('landmark')) return 'landmark';
  
  return 'other';
};

// Convert distance units
export const convertDistance = (km: number): { km: number; miles: number } => {
  return {
    km: Math.round(km * 10) / 10,
    miles: Math.round(km * 0.621371 * 10) / 10
  };
};

// Sort attractions by distance
export const sortAttractionsByDistance = (attractions: Attraction[]): Attraction[] => {
  return [...attractions].sort((a, b) => a.distance.km - b.distance.km);
};

// Sort attractions by name
export const sortAttractionsByName = (attractions: Attraction[]): Attraction[] => {
  return [...attractions].sort((a, b) => a.name.localeCompare(b.name));
};

// Filter attractions by category
export const filterAttractionsByCategory = (
  attractions: Attraction[],
  category: string
): Attraction[] => {
  if (category === 'all') return attractions;
  return attractions.filter(attraction => attraction.category === category);
};

// Group attractions by category
export const groupAttractionsByCategory = (attractions: Attraction[]): Record<string, Attraction[]> => {
  return attractions.reduce((acc, attraction) => {
    const category = attraction.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(attraction);
    return acc;
  }, {} as Record<string, Attraction[]>);
};

// Calculate distance summary
export const calculateDistanceSummary = (attractions: Attraction[]): DistanceSummary => {
  return {
    within1km: attractions.filter(a => a.distance.km <= 1).length,
    within1to5km: attractions.filter(a => a.distance.km > 1 && a.distance.km <= 5).length,
    beyond5km: attractions.filter(a => a.distance.km > 5).length
  };
};

// Get category configuration for display
export const getCategoryConfig = (category: string) => {
  const configs = {
    'historical': { icon: 'fas fa-monument', color: 'text-warning', bgColor: 'bg-warning-subtle', label: 'Historical' },
    'natural': { icon: 'fas fa-tree', color: 'text-success', bgColor: 'bg-success-subtle', label: 'Natural' },
    'cultural': { icon: 'fas fa-palette', color: 'text-purple', bgColor: 'bg-purple-subtle', label: 'Cultural' },
    'religious': { icon: 'fas fa-pray', color: 'text-primary', bgColor: 'bg-primary-subtle', label: 'Religious' },
    'museum': { icon: 'fas fa-building-columns', color: 'text-danger', bgColor: 'bg-danger-subtle', label: 'Museum' },
    'transportation': { icon: 'fas fa-bus', color: 'text-secondary', bgColor: 'bg-secondary-subtle', label: 'Transportation' },
    'entertainment': { icon: 'fas fa-music', color: 'text-info', bgColor: 'bg-info-subtle', label: 'Entertainment' },
    'shopping': { icon: 'fas fa-shopping-bag', color: 'text-warning', bgColor: 'bg-warning-subtle', label: 'Shopping' },
    'healthcare': { icon: 'fas fa-hospital', color: 'text-danger', bgColor: 'bg-danger-subtle', label: 'Healthcare' },
    'education': { icon: 'fas fa-graduation-cap', color: 'text-primary', bgColor: 'bg-primary-subtle', label: 'Education' },
    'recreation': { icon: 'fas fa-gamepad', color: 'text-success', bgColor: 'bg-success-subtle', label: 'Recreation' },
    'landmark': { icon: 'fas fa-landmark', color: 'text-dark', bgColor: 'bg-dark-subtle', label: 'Landmark' },
    'beach': { icon: 'fas fa-umbrella-beach', color: 'text-info', bgColor: 'bg-info-subtle', label: 'Beach' },
    'park': { icon: 'fas fa-leaf', color: 'text-success', bgColor: 'bg-success-subtle', label: 'Park' },
    'other': { icon: 'fas fa-map-pin', color: 'text-muted', bgColor: 'bg-light', label: 'Other' }
  };
  
  return configs[category as keyof typeof configs] || configs.other;
}; 