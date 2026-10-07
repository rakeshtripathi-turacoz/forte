import React, { useState, useEffect } from 'react';
import Banner from '../components/common/Banner';
import { galleryAPI } from '../services/api';
import API_CONFIG from '../config/api.config';

const GalleryPage = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [stats, setStats] = useState([]);
  const [pageHeader, setPageHeader] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, imagesRes, statsRes, headerRes] = await Promise.all([
        galleryAPI.getCategories(),
        galleryAPI.getImages(),
        galleryAPI.getStats(),
        galleryAPI.getHeader()
      ]);

      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }

      if (imagesRes.success) {
        setImages(imagesRes.data);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      if (headerRes.success && headerRes.data) {
        setPageHeader(headerRes.data);
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter images by selected category
  const filteredImages = selectedCategory === 'all'
    ? images
    : images.filter(img => img.category_slug === selectedCategory);

  const openLightbox = (image) => {
    setLightboxImage(image);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const navigateLightbox = (direction) => {
    const currentIndex = filteredImages.findIndex(img => img.id === lightboxImage.id);
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredImages.length;
    } else {
      newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    }
    setLightboxImage(filteredImages[newIndex]);
  };

  // Get image URL
  const getImageUrl = (imagePath) => {
    return API_CONFIG.getFileUrl(imagePath);
  };

  return (
    <div className="h-full w-full fade-in">
      <Banner
        title="Gallery"
        subtitle="Campus Life | Events | Memories"
        imageSrc="https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8">

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate mb-3 sm:mb-4">
            {pageHeader?.page_title || 'Photo Gallery'}
          </h2>
          <p className="text-gray-500">
            {pageHeader?.page_description || 'Explore the vibrant life at Forte Institute of Technology through our collection of photographs.'}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-crimson text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.category_slug)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === category.category_slug
                  ? 'bg-crimson text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.category_name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
            <p className="text-gray-500">Loading gallery...</p>
          </div>
        ) : filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                onClick={() => openLightbox(image)}
                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-card transition-all duration-300"
              >
                <img
                  src={getImageUrl(image.image_path)}
                  alt={image.title}
                  className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="text-white font-semibold">{image.title}</h4>
                    <p className="text-white/70 text-sm">{image.category_name}</p>
                    {image.photographer && (
                      <p className="text-white/60 text-xs mt-1">
                        <i className="fas fa-camera mr-1"></i>{image.photographer}
                      </p>
                    )}
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 p-2 rounded-full">
                    <i className="fas fa-expand text-slate"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-images text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No images found in this category.</p>
          </div>
        )}

        {/* Gallery Stats */}
        {stats.length > 0 && (
          <div className="bg-slate text-white p-6 sm:p-8 rounded-xl mt-8">
            <h3 className="text-xl sm:text-2xl font-serif font-bold mb-6 text-center">Campus Highlights</h3>
            <div className={`grid grid-cols-2 md:grid-cols-${Math.min(stats.length, 4)} gap-4 text-center`}>
              {stats.map((stat) => (
                <div key={stat.id}>
                  <div className="text-3xl font-bold text-gold mb-1">{stat.stat_value}</div>
                  <p className="text-white/70 text-sm">{stat.stat_description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10"
          >
            <i className="fas fa-times text-2xl"></i>
          </button>

          {filteredImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                className="absolute left-4 text-white hover:text-gray-300 transition z-10 p-2"
              >
                <i className="fas fa-chevron-left text-2xl"></i>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                className="absolute right-4 text-white hover:text-gray-300 transition z-10 p-2"
              >
                <i className="fas fa-chevron-right text-2xl"></i>
              </button>
            </>
          )}

          <div
            className="max-w-4xl max-h-[80vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(lightboxImage.image_path)}
              alt={lightboxImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <h4 className="text-white font-semibold text-lg">{lightboxImage.title}</h4>
              <p className="text-white/70 text-sm">{lightboxImage.category_name}</p>
              {lightboxImage.description && (
                <p className="text-white/60 text-sm mt-1">{lightboxImage.description}</p>
              )}
              {lightboxImage.photographer && (
                <p className="text-white/50 text-xs mt-1">
                  <i className="fas fa-camera mr-1"></i>Photo by {lightboxImage.photographer}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
