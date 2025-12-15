import React from 'react'

const Skaliton = () => {
  return (
    <>
   <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto px-4">
        {/* Stories Skeleton */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
                <div className="w-12 h-2 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
              </div>
            ))}
          </div>
        </div>

        {/* Post Skeletons */}
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg mb-4 border border-gray-200">
            {/* Header */}
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
              <div className="flex-1">
                <div className="w-32 h-3 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] mb-2" />
                <div className="w-24 h-2 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
              </div>
              <div className="w-6 h-6 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
            </div>

            {/* Image */}
            <div className="w-full aspect-square bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />

            {/* Actions */}
            <div className="p-4">
              <div className="flex gap-4 mb-3">
                <div className="w-6 h-6 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
                <div className="w-6 h-6 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
                <div className="w-6 h-6 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
                <div className="ml-auto w-6 h-6 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
              </div>

              {/* Likes */}
              <div className="w-28 h-3 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] mb-2" />

              {/* Caption */}
              <div className="space-y-2">
                <div className="w-full h-3 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
                <div className="w-4/5 h-3 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
              </div>

              {/* Comments */}
              <div className="w-36 h-2 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] mt-3" />
              <div className="w-20 h-2 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] mt-2" />
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>


    </>
  )
}

export default Skaliton