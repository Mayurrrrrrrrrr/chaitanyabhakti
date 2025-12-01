import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './Satsang.css';

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

  if (loading) return <div className="p-8 text-center text-yellow-600">Loading Satsang...</div>;

  return (
    <div className="satsang-container w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-yellow-100">
        <div className="bg-yellow-500 p-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">📺</span> Daily Satsang
          </h2>
        </div>

        <div className="p-6">
          {video ? (
            <div className="space-y-4">
              <div className="aspect-w-16 aspect-h-9 w-full rounded-lg overflow-hidden bg-black shadow-inner">
                <iframe
                  src={getEmbedUrl(video.url)}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full min-h-[300px] md:min-h-[400px]"
                ></iframe>
              </div>
              <div className="info">
                <h3 className="text-xl font-semibold text-gray-800">{video.title}</h3>
                <p className="text-gray-600 mt-2">{video.description}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No satsang video available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Satsang;