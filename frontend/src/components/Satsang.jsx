import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiYoutube, FiClock, FiPlay } from 'react-icons/fi';

const Satsang = () => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestSatsang();
  }, []);

  const fetchLatestSatsang = async () => {
    try {
      const res = await api.get(`/media/latest?t=${new Date().getTime()}`);
      const youtubeVideo = res.data.find(m => m.type === 'youtube');
      if (youtubeVideo) {
        setVideo(youtubeVideo);
      }
    } catch (error) {
      console.error("Failed to fetch satsang", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert YouTube URL to embed format
  const getEmbedUrl = (url) => {
    if (!url) return '';

    // Handle various YouTube URL formats
    let videoId = '';

    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('watch?v=')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v');
    }
    // Format: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    // Format: https://www.youtube.com/embed/VIDEO_ID (already embed)
    else if (url.includes('/embed/')) {
      return url;
    }
    // Try regex as fallback
    else {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      videoId = (match && match[2].length === 11) ? match[2] : null;
    }

    if (!videoId) return '';
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lotus-50 via-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-lotus-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lotus-50 via-pink-50 to-purple-50 p-4 md:p-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-lotus bg-cover bg-center opacity-5"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-lotus-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 mb-8 shadow-xl border border-white/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-lotus-400/20 to-pink-500/20 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-gradient-to-br from-lotus-500 to-pink-500 rounded-2xl shadow-lg">
                <FiYoutube className="text-white text-3xl" />
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-800">
                Daily Satsang
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Connect with divine wisdom through our daily spiritual discourses
            </p>
          </div>
        </div>

        {/* Video Section */}
        {video ? (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
            {/* Cinema-style backdrop */}
            <div className="relative">
              {/* Video Container */}
              <div className="relative aspect-video bg-black">
                <iframe
                  src={getEmbedUrl(video.url)}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>

              {/* Video Info Overlay */}
              <div className="bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent p-8">
                <div className="flex items-start gap-2 mb-3">
                  <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-1">
                    <FiPlay size={12} />
                    LIVE
                  </div>
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                    Latest Upload
                  </div>
                </div>

                <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                  {video.title}
                </h2>

                {video.description && (
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-3 mb-4">
                    {video.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <FiClock />
                    <span>Posted recently</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiYoutube />
                    <span>YouTube</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-16 text-center shadow-xl border border-white/50">
            <div className="w-24 h-24 bg-gradient-to-br from-lotus-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FiYoutube className="text-white text-5xl" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-gray-800 mb-3">
              No Satsang Available
            </h3>
            <p className="text-gray-600 text-lg">
              Check back later for new spiritual content
            </p>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg border border-white/50">
            <div className="text-4xl mb-3">🎵</div>
            <h3 className="font-bold text-gray-800 mb-2">Kirtan</h3>
            <p className="text-sm text-gray-600">Devotional songs and chanting</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg border border-white/50">
            <div className="text-4xl mb-3">📖</div>
            <h3 className="font-bold text-gray-800 mb-2">Bhagavad Gita</h3>
            <p className="text-sm text-gray-600">Scriptural wisdom and teachings</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg border border-white/50">
            <div className="text-4xl mb-3">🙏</div>
            <h3 className="font-bold text-gray-800 mb-2">Q&A</h3>
            <p className="text-sm text-gray-600">Spiritual guidance and answers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Satsang;