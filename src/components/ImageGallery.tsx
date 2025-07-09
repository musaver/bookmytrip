'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface ImageData {
  url: string;
  caption: string;
}

interface ImageGalleryProps {
  images: ImageData[];
  title?: string;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number = 0) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  const lightboxSlides = images.map(image => ({
    src: image.url,
    alt: image.caption,
    title: image.caption
  }));

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={`image-gallery ${className}`}>
      <style jsx>{`
        .image-gallery-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 8px;
          height: 400px;
        }
        
        .main-image {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        
        .main-image:hover {
          transform: scale(1.02);
        }
        
        .thumbnail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        
        .thumbnail {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.3s ease;
          height: 195px;
        }
        
        .thumbnail:hover {
          transform: scale(1.05);
        }
        
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
          font-weight: bold;
        }
        
        .view-all-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        
        .view-all-btn:hover {
          background: rgba(0, 0, 0, 0.9);
        }
        
        @media (max-width: 768px) {
          .image-gallery-grid {
            grid-template-columns: 1fr;
            height: auto;
          }
          
          .thumbnail-grid {
            grid-template-columns: repeat(4, 1fr);
            height: 120px;
          }
          
          .thumbnail {
            height: 120px;
          }
        }
      `}</style>
      
      <div className="image-gallery-grid">
        {/* Main Image */}
        <div className="main-image" onClick={() => openLightbox(0)}>
          <Image
            src={images[0].url}
            alt={images[0].caption}
            fill
            className="object-cover"
          />
          <button className="view-all-btn" onClick={(e) => { e.stopPropagation(); openLightbox(0); }}>
            <i className="fas fa-images me-1"></i>
            View All {images.length} Photos
          </button>
        </div>
        
        {/* Thumbnail Grid */}
        <div className="thumbnail-grid">
          {images.slice(1, 5).map((image, index) => (
            <div 
              key={index} 
              className="thumbnail" 
              onClick={() => openLightbox(index + 1)}
            >
              <Image
                src={image.url}
                alt={image.caption}
                fill
                className="object-cover"
              />
              {/* Show overlay on last thumbnail if there are more images */}
              {index === 3 && images.length > 5 && (
                <div className="overlay">
                  <div>
                    <i className="fas fa-plus fa-2x mb-2"></i>
                    <div>+{images.length - 5}</div>
                    <small>More</small>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={isOpen}
        close={closeLightbox}
        slides={lightboxSlides}
        index={currentIndex}
        on={{
          view: ({ index }) => setCurrentIndex(index)
        }}
        carousel={{
          finite: true,
          preload: 2
        }}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
          slide: { 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px'
          }
        }}
      />
    </div>
  );
};

export default ImageGallery; 