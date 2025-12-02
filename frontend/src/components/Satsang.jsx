import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiYoutube, FiMusic, FiPlay, FiPause } from 'react-icons/fi';

const Satsang = () => {
  const [videos, setVideos] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const audioRef = React.useRef(new Audio());

  useEffect(() => {
    fetchMedia();

    // Audio event listeners
    const audio = audioRef.current;
    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.removeEventListener('ended', () => { });
      audio.removeEventListener('play', () => { });
      audio.removeEventListener('pause', () => { });
    };
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);

      // Fetch both videos and audio
      const [videosRes, audioRes] = await Promise.all([
        api.get('/media/videos').catch(() => ({ data: [] })),
        api.get('/media/audio').catch(() => ({ data: [] }))
      ]);

      console.log('Videos:', videosRes.data);
      console.log('Audio:', audioRes.data);

      if (videosRes.data && videosRes.data.length > 0) {
        // Normalize video data
        const normalizedVideos = videosRes.data.map(v => ({
          ...v,
          media_id: v.video_id, // Map video_id to media_id
          youtube_url: v.youtube_url || v.video_url // Handle potential column name mismatch
        }));
        setVideos(normalizedVideos);
        setSelectedVideo(normalizedVideos[0]);
      }

      if (audioRes.data && audioRes.data.length > 0) {
        // Normalize audio data
        const normalizedAudio = audioRes.data.map(a => ({
          ...a,
          media_id: a.audio_id, // Map audio_id to media_id
          file_url: a.file_url || a.audio_url // Handle potential column name mismatch
        }));
        setAudioFiles(normalizedAudio);
      }

      if (videosRes.data.length === 0 && audioRes.data.length === 0) {
        setError('No media available');
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
      setError('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';

    try {
      // Clean the URL first
      url = url.trim();

      let videoId = '';

      // Format: https://www.youtube.com/watch?v=VIDEO_ID
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      }
      // Format: https://youtu.be/VIDEO_ID
      else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0].split('&')[0];
      }
      // Format: https://www.youtube.com/embed/VIDEO_ID
      else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1].split('?')[0];
      }
      // Try regex fallback
      else {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        videoId = (match && match[7].length === 11) ? match[7] : null;
      }

      if (!videoId || videoId.length !== 11) {
        console.error('Invalid YouTube URL:', url);
        return '';
      }

      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    } catch (error) {
      console.error('Error parsing YouTube URL:', error, url);
      return '';
    }
  };

  const playAudio = (audio) => {
    const audioElement = audioRef.current;

    if (currentAudio?.media_id === audio.media_id && isPlaying) {
      // Pause if same audio is playing
      audioElement.pause();
      setIsPlaying(false);
    } else {
      // Play new audio
      audioElement.src = audio.file_url;
      audioElement.play().catch(err => {
        console.error('Audio play error:', err);
        alert('Failed to play audio. Please try again.');
      });
      setCurrentAudio(audio);
      setIsPlaying(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 mb-8 shadow-xl border border-white/50">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg">
              <FiYoutube className="text-white text-3xl" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-800">
              Daily Satsang
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Watch spiritual videos and listen to devotional kirtans
          </p>
        </div>

        {/* Videos Section */}
        {videos.length > 0 && (
          <>
            <h2 className="font-heading text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiYoutube className="text-red-500" />
              Satsang Videos
            </h2>

            {/* Main Video Player */}
            {selectedVideo && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 mb-8">
                <div className="relative aspect-video bg-black">
                  {getEmbedUrl(selectedVideo.youtube_url) ? (
                    <iframe
                      src={getEmbedUrl(selectedVideo.youtube_url)}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    ></iframe>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <div className="text-center">
                        <FiYoutube className="text-6xl mb-4 mx-auto" />
                        <p>Invalid YouTube URL</p>
                        <p className="text-sm text-gray-400 mt-2">{selectedVideo.youtube_url}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent p-8">
                  <div className="flex items-start gap-2 mb-3">
                    <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <FiPlay size={12} />
                      NOW PLAYING
                    </div>
                  </div>

                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
                    {selectedVideo.title}
                  </h2>

                  {selectedVideo.description && (
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-3">
                      {selectedVideo.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* More Videos */}
            {videos.length > 1 && (
              <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50 mb-8">
                <h3 className="font-heading text-xl font-bold text-gray-800 mb-4">
                  More Videos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.filter(v => v.media_id !== selectedVideo?.media_id).map((video) => {
                    const embedUrl = getEmbedUrl(video.youtube_url);
                    const videoId = embedUrl.split('/embed/')[1]?.split('?')[0];

                    return (
                      <div
                        key={video.media_id}
                        onClick={() => setSelectedVideo(video)}
                        className="flex gap-4 p-4 bg-white rounded-xl hover:bg-gray-50 cursor-pointer transition-all border border-gray-200 hover:border-blue-300 hover:shadow-md"
                      >
                        <div className="w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {videoId ? (
                            <img
                              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiPlay className="text-gray-400 text-2xl" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">
                            {video.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {video.category || 'Satsang'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Kirtan Audio Section */}
        {audioFiles.length > 0 && (
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50">
            <h2 className="font-heading text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiMusic className="text-green-500" />
              Devotional Kirtans
            </h2>

            <div className="space-y-3">
              {audioFiles.map((audio) => (
                <div
                  key={audio.media_id}
                  onClick={() => playAudio(audio)}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all
                    ${currentAudio?.media_id === audio.media_id && isPlaying
                      ? 'bg-green-50 border-2 border-green-400'
                      : 'bg-white border border-gray-200 hover:border-green-300'
                    }
                  `}
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                    ${currentAudio?.media_id === audio.media_id && isPlaying
                      ? 'bg-green-500'
                      : 'bg-green-100'
                    }
                  `}>
                    {currentAudio?.media_id === audio.media_id && isPlaying ? (
                      <FiPause className="text-white text-xl" />
                    ) : (
                      <FiPlay className="text-green-600 text-xl" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800">
                      {audio.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {audio.category || 'Kirtan'}
                    </p>
                  </div>

                  {currentAudio?.media_id === audio.media_id && isPlaying && (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-4 bg-green-500 animate-pulse"></div>
                      <div className="w-1 h-6 bg-green-500 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-4 bg-green-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {videos.length === 0 && audioFiles.length === 0 && (
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-16 text-center shadow-xl border border-white/50">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FiYoutube className="text-white text-5xl" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-gray-800 mb-3">
              No Media Available
            </h3>
            <p className="text-gray-600 text-lg mb-4">
              {error || 'No videos or audio files have been uploaded yet'}
            </p>
            <button
              onClick={fetchMedia}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Satsang;