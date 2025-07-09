'use client';

import React, { useState } from 'react';

interface ExportStats {
    hotels: number;
    cities: number;
    locations: number;
    totalRecords: number;
}

export default function DataExportPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportStats, setExportStats] = useState<ExportStats | null>(null);
    const [exportType, setExportType] = useState<'hotels' | 'cities' | 'all'>('all');
    const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

    // Function to export hotels data
    const exportHotelsData = async () => {
        try {
            const response = await fetch('/api/export/hotels', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to export hotels data');
            }

            const data = await response.json();
            return data.hotels || [];
        } catch (error) {
            console.error('Error exporting hotels:', error);
            return [];
        }
    };

    // Function to export cities data
    const exportCitiesData = async () => {
        try {
            const response = await fetch('/api/export/cities', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to export cities data');
            }

            const data = await response.json();
            return data.cities || [];
        } catch (error) {
            console.error('Error exporting cities:', error);
            return [];
        }
    };

    // Function to convert JSON to CSV
    const jsonToCSV = (jsonData: any[], filename: string) => {
        if (jsonData.length === 0) return '';

        const headers = Object.keys(jsonData[0]);
        const csvContent = [
            headers.join(','),
            ...jsonData.map(row => 
                headers.map(header => {
                    const value = row[header];
                    // Handle nested objects and arrays
                    if (typeof value === 'object' && value !== null) {
                        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                    }
                    // Escape commas and quotes in strings
                    if (typeof value === 'string') {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value || '';
                }).join(',')
            )
        ].join('\n');

        return csvContent;
    };

    // Function to download data as file
    const downloadFile = (data: string, filename: string, mimeType: string) => {
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Main export function
    const handleExport = async () => {
        setIsExporting(true);
        setExportProgress(0);
        setExportStats(null);

        try {
            let allData: any = {};
            let totalRecords = 0;

            if (exportType === 'hotels' || exportType === 'all') {
                setExportProgress(20);
                const hotels = await exportHotelsData();
                allData.hotels = hotels;
                totalRecords += hotels.length;
            }

            if (exportType === 'cities' || exportType === 'all') {
                setExportProgress(60);
                const cities = await exportCitiesData();
                allData.cities = cities;
                totalRecords += cities.length;
            }

            setExportProgress(80);

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const baseFilename = `tripjack_${exportType}_data_${timestamp}`;

            if (exportFormat === 'json') {
                const jsonData = JSON.stringify(allData, null, 2);
                downloadFile(jsonData, `${baseFilename}.json`, 'application/json');
            } else {
                // For CSV, export each data type separately
                if (allData.hotels) {
                    const hotelsCSV = jsonToCSV(allData.hotels, 'hotels');
                    downloadFile(hotelsCSV, `${baseFilename}_hotels.csv`, 'text/csv');
                }
                if (allData.cities) {
                    const citiesCSV = jsonToCSV(allData.cities, 'cities');
                    downloadFile(citiesCSV, `${baseFilename}_cities.csv`, 'text/csv');
                }
            }

            setExportStats({
                hotels: allData.hotels?.length || 0,
                cities: allData.cities?.length || 0,
                locations: 0, // Will be implemented when locations API is available
                totalRecords
            });

            setExportProgress(100);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title mb-0">
                                <i className="fas fa-download me-2"></i>
                                TripJack Data Export
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h5>Export Type</h5>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="exportType"
                                            id="exportAll"
                                            checked={exportType === 'all'}
                                            onChange={() => setExportType('all')}
                                        />
                                        <label className="form-check-label" htmlFor="exportAll">
                                            All Data (Hotels + Cities)
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="exportType"
                                            id="exportHotels"
                                            checked={exportType === 'hotels'}
                                            onChange={() => setExportType('hotels')}
                                        />
                                        <label className="form-check-label" htmlFor="exportHotels">
                                            Hotels Only
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="exportType"
                                            id="exportCities"
                                            checked={exportType === 'cities'}
                                            onChange={() => setExportType('cities')}
                                        />
                                        <label className="form-check-label" htmlFor="exportCities">
                                            Cities Only
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <h5>Export Format</h5>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="exportFormat"
                                            id="formatJSON"
                                            checked={exportFormat === 'json'}
                                            onChange={() => setExportFormat('json')}
                                        />
                                        <label className="form-check-label" htmlFor="formatJSON">
                                            JSON Format
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="exportFormat"
                                            id="formatCSV"
                                            checked={exportFormat === 'csv'}
                                            onChange={() => setExportFormat('csv')}
                                        />
                                        <label className="form-check-label" htmlFor="formatCSV">
                                            CSV Format
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {isExporting && (
                                <div className="mb-4">
                                    <h6>Export Progress</h6>
                                    <div className="progress">
                                        <div
                                            className="progress-bar progress-bar-striped progress-bar-animated"
                                            role="progressbar"
                                            style={{ width: `${exportProgress}%` }}
                                            aria-valuenow={exportProgress}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        >
                                            {exportProgress}%
                                        </div>
                                    </div>
                                </div>
                            )}

                            {exportStats && (
                                <div className="alert alert-success mb-4">
                                    <h6 className="alert-heading">Export Completed Successfully!</h6>
                                    <hr />
                                    <div className="row">
                                        <div className="col-md-3">
                                            <strong>Hotels:</strong> {exportStats.hotels.toLocaleString()}
                                        </div>
                                        <div className="col-md-3">
                                            <strong>Cities:</strong> {exportStats.cities.toLocaleString()}
                                        </div>
                                        <div className="col-md-3">
                                            <strong>Locations:</strong> {exportStats.locations.toLocaleString()}
                                        </div>
                                        <div className="col-md-3">
                                            <strong>Total:</strong> {exportStats.totalRecords.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="d-grid">
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleExport}
                                    disabled={isExporting}
                                >
                                    {isExporting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-download me-2"></i>
                                            Start Export
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="mt-4">
                                <h6>Export Information</h6>
                                <ul className="list-unstyled">
                                    <li><i className="fas fa-info-circle text-info me-2"></i>Hotels data includes all static hotel information from TripJack API</li>
                                    <li><i className="fas fa-info-circle text-info me-2"></i>Cities data includes all available cities for hotel searches</li>
                                    <li><i className="fas fa-info-circle text-info me-2"></i>JSON format preserves all data structure and nested objects</li>
                                    <li><i className="fas fa-info-circle text-info me-2"></i>CSV format flattens data for spreadsheet compatibility</li>
                                    <li><i className="fas fa-info-circle text-info me-2"></i>Large datasets may take several minutes to export</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 