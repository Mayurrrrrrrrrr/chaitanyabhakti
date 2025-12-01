import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { FiYoutube, FiClock } from 'react-icons/fi';

const Satsang = () => {
  const { t } = useLanguage();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestSatsang();
  }, []);

  const fetchLatestSatsang = async () => {
    try {
      // Add timestamp to prevent caching of old video data
      const res = await api.get(`/media/latest?t=${new Date().getTime()}`);
      // Backend returns array, we find the youtube type
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

  const getEmbedUrl = (url) => {
    if (!url) return '';
    // Regex to handle standard watch URLs, shortened youtu.be, and embed URLs
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!videoId) return '';
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <FiYoutube size={24} />
            </div>
            <h2 className="font-heading text-2xl font-bold">Daily Satsang</h2>
          </div>
          <p className="text-pink-100 max-w-xl">
            Connect with divine wisdom through our daily spiritual discourses.
          </p>
        </div>
        {/* Decor */}
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Video Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {video ? (
          <div className="flex flex-col md:flex-row">
            {/* Video Player */}
            <div className="w-full md:w-2/3 bg-black aspect-video relative group">
              <iframe
                src={getEmbedUrl(video.url)}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>

            {/* Info Side */}
            <div className="w-full md:w-1/3 p-6 flex flex-col justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-pink-600 uppercase tracking-wider mb-3">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                  Latest Upload
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-800 mb-3 line-clamp-3">
                  {video.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-4">
                  {video.description || "No description available."}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 flex items-center gap-2 text-slate-400 text-xs">
                <FiClock />
                <span>Posted recently</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FiYoutube size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No Satsang Available</h3>
            <p className="text-slate-500 mt-2">Check back later for new spiritual content.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Satsang;