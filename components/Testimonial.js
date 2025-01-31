import React from 'react';

const Testimonial = ({ testimonial }) => {
  if (!testimonial) return null;

  const { name, review, rating } = testimonial;

  return (
    <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 max-w-md mx-4 transform hover:-translate-y-1">
      {/* Decorative Quote Icon */}
      <div className="absolute top-6 left-6 text-gray-100 text-7xl -z-10 font-serif">“</div>
      
      <div className="flex flex-col h-full justify-between">
        {/* Review Text */}
        <p className="text-gray-700 text-lg mb-6 leading-relaxed font-medium line-clamp-4">
          {review}
        </p>

        <div className="space-y-4">
          {/* Rating Stars */}
          <div className="flex items-center justify-center space-x-1 bg-gray-50 px-4 py-2 rounded-full w-max mx-auto">
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                className={`w-6 h-6 ${index < rating ? 'text-yellow-500' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>

          {/* Client Name */}
          <div className="text-center">
            <div className="w-12 h-1 bg-gray-200 mx-auto mb-3 rounded-full"/>
            <p className="text-gray-900 font-bold text-lg tracking-wide">{name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;