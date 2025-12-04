import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiYoutube, FiMusic, FiPlay, FiPause, FiPlus, FiX, FiUpload, FiLink } from 'react-icons/fi';
import { uploadAudio, supabase } from '../supabase';
import { storeFile, getFile, deleteFile, getAllFiles } from '../indexedDB';
import { FiDownload, FiTrash2, FiCheck } from 'react-icons/fi';

const Satsang = () => {
  const [videos, setVideos] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const audioRef = React.useRef(new Audio());

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState('upload'); // 'upload' or 'url'
  const [uploading, setUploading] = useState(false);
  const [newMedia, setNewMedia] = useState({
    title: '',
    artist: '',
    category: 'bhajan',
    type: 'audio', // 'audio' or 'video'
    url: ''
  });
  const [downloadedFiles, setDownloadedFiles] = useState({});
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchMedia();
    checkDownloadedFiles();

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

  const checkDownloadedFiles = async () => {
    const files = await getAllFiles();
    const downloaded = {};
    files.forEach(f => {
      downloaded[f.id] = true;
    });
    setDownloadedFiles(downloaded);
  };

  const handleDownload = async (audio) => {
    try {
      setDownloadingId(audio.media_id);
      const response = await fetch(audio.file_url);
      const blob = await response.blob();

      await storeFile({
        id: audio.media_id,
        blob: blob,
        title: audio.title,
        artist: audio.artist,
        category: audio.category,
        file_url: audio.file_url // Store original URL as reference
      });

      setDownloadedFiles(prev => ({ ...prev, [audio.media_id]: true }));
      alert('Downloaded for offline listening!');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Remove from offline storage?')) {
      await deleteFile(id);
      setDownloadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[id];
        return newFiles;
      });
    }
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);

      // Fetch from Supabase (Bhajans)
      const { data: supabaseAudio, error: supabaseError } = await supabase
        .from('bhajans')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch from existing API (Videos)
      const videosRes = await api.get('/media/videos').catch(() => ({ data: [] }));

      // Fetch from existing API (Legacy Audio)
      const audioRes = await api.get('/media/audio').catch(() => ({ data: [] }));

      let combinedAudio = [];

      // Process Supabase Audio
      if (supabaseAudio && supabaseAudio.length > 0) {
        const sbAudio = supabaseAudio.map(a => ({
          media_id: a.id,
          title: a.title,
          artist: a.artist,
          file_url: a.audio_url,
          category: a.category
        }));
        combinedAudio = [...combinedAudio, ...sbAudio];
      }

      // Process Legacy API Audio
      if (audioRes.data && audioRes.data.length > 0) {
        const legacyAudio = audioRes.data.map(a => ({
          ...a,
          media_id: a.audio_id || `legacy-${a.id}`, // Ensure unique ID
          file_url: a.file_url || a.audio_url
        }));
        combinedAudio = [...combinedAudio, ...legacyAudio];
      }
      setAudioFiles(combinedAudio);

      if (videosRes.data && videosRes.data.length > 0) {
        const normalizedVideos = videosRes.data.map(v => ({
          ...v,
          media_id: v.video_id,
          youtube_url: v.youtube_url || v.video_url
        }));
        setVideos(normalizedVideos);
        if (!selectedVideo) setSelectedVideo(normalizedVideos[0]);
      }

      if (videosRes.data.length === 0 && combinedAudio.length === 0) {
        setError('No media available');
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
      setError('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadAudio(file, {
        title: newMedia.title,
        artist: newMedia.artist,
        category: newMedia.category
      });

      if (result.success) {
        alert('Audio uploaded successfully!');
        setShowAddModal(false);
        fetchMedia();
        setNewMedia({ title: '', artist: '', category: 'bhajan', type: 'audio', url: '' });
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    try {
      if (newMedia.type === 'video') {
        // Add video URL logic (e.g. to API or Supabase if table exists)
        // For MVP, we'll just alert as we focused on Audio upload in Supabase plan
        alert("Video addition via URL requires backend update. Please use Audio upload for now.");
      } else {
        // Add Audio URL to Supabase
        const { error } = await supabase.from('bhajans').insert({
          title: newMedia.title,
          artist: newMedia.artist,
          audio_url: newMedia.url,
          category: newMedia.category
        });

        if (error) throw error;
        alert('Audio added successfully!');
        setShowAddModal(false);
        fetchMedia();
      }
    } catch (error) {
      alert('Error adding media: ' + error.message);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      url = url.trim();
      let videoId = '';
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0].split('&')[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1].split('?')[0];
      } else {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        videoId = (match && match[7].length === 11) ? match[7] : null;
      }
      if (!videoId || videoId.length !== 11) return '';
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    } catch (error) {
      return '';
    }
  };

  const playAudio = async (audio) => {
    const audioElement = audioRef.current;

    if (currentAudio?.media_id === audio.media_id && isPlaying) {
      // Pause if same audio is playing
      audioElement.pause();
      setIsPlaying(false);
    } else {
      // Play new audio
      try {
        let src = audio.file_url;

        // Check if offline file exists
        const offlineFile = await getFile(audio.media_id);
        if (offlineFile) {
          console.log('Playing from offline storage');
          src = URL.createObjectURL(offlineFile.blob);
        }

        audioElement.src = src;
        audioElement.play().catch(err => {
          console.error('Audio play error:', err);
          alert('Failed to play audio. Please try again.');
        });
        setCurrentAudio(audio);
        setIsPlaying(true);
      } catch (error) {
        console.error('Play error:', error);
      }
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
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 mb-8 shadow-xl border border-white/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
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

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            <FiPlus size={20} /> Add Media
          </button>
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
                  className={`
                    flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all
                    ${currentAudio?.media_id === audio.media_id && isPlaying
                      ? 'bg-green-50 border-2 border-green-400'
                      : 'bg-white border border-gray-200 hover:border-green-300'
                    }
                  `}
                  onClick={() => playAudio(audio)}
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
                      {audio.category || 'Kirtan'} • {audio.artist || 'Unknown'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {downloadedFiles[audio.media_id] ? (
                      <button
                        onClick={(e) => handleDelete(audio.media_id, e)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                        title="Downloaded (Click to remove)"
                      >
                        <FiCheck size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(audio);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full"
                        disabled={downloadingId === audio.media_id}
                        title="Download for offline"
                      >
                        {downloadingId === audio.media_id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        ) : (
                          <FiDownload size={18} />
                        )}
                      </button>
                    )}
                  </div>
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

        {/* Add Media Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add New Media</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX size={24} />
                </button>
              </div>

              <div className="flex gap-4 mb-6 border-b border-gray-100">
                <button
                  className={`pb-2 px-1 ${addMode === 'upload' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setAddMode('upload')}
                >
                  Upload Audio
                </button>
                <button
                  className={`pb-2 px-1 ${addMode === 'url' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setAddMode('url')}
                >
                  Add Link
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newMedia.title}
                    onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Morning Bhajan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                  <input
                    type="text"
                    value={newMedia.artist}
                    onChange={(e) => setNewMedia({ ...newMedia, artist: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Artist Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newMedia.category}
                    onChange={(e) => setNewMedia({ ...newMedia, category: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="bhajan">Bhajan</option>
                    <option value="kirtan">Kirtan</option>
                    <option value="mantra">Mantra</option>
                  </select>
                </div>

                {addMode === 'upload' ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Click to upload MP3</p>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    {uploading && <p className="text-blue-500 mt-2">Uploading...</p>}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Audio URL</label>
                    <input
                      type="url"
                      value={newMedia.url}
                      onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="https://example.com/audio.mp3"
                    />
                    <button
                      onClick={handleUrlSubmit}
                      className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Audio
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Satsang;