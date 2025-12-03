// frontend/src/components/admin/MediaManagement.jsx
import React, { useState, useEffect } from 'react';
import { FiMusic, FiVideo, FiTrash2, FiUpload, FiLink, FiPlay, FiExternalLink } from 'react-icons/fi';
import api from '../../utils/api';

const MediaManagement = () => {
  const [activeTab, setActiveTab] = useState('audio');
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('kirtan');
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    fetchMedia();
  }, [activeTab]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'audio' ? '/media/audio' : '/media/videos';
      const res = await api.get(endpoint);
      setMediaList(res.data);
    } catch (error) {
      console.error('Fetch media error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    const formData = new FormData();
    formData.append('audio_file', file);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('is_public', isPublic ? '1' : '0');

    try {
      setUploading(true);
      await api.post('/media/audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Audio uploaded successfully!');
      setTitle('');
      setFile(null);
      fetchMedia();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Check console.');
    } finally {
      setUploading(false);
    }
  };

  const handleVideoAdd = async (e) => {
    e.preventDefault();
    if (!videoUrl || !title) return;

    try {
      setUploading(true);
      await api.post('/media/video', {
        title,
        video_url: videoUrl,
        category,
        is_public: isPublic
      });
      alert('Video added successfully!');
      setTitle('');
      setVideoUrl('');
      fetchMedia();
    } catch (error) {
      console.error('Add video failed:', error);
      alert('Failed to add video.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const endpoint = activeTab === 'audio' ? `/media/audio/${id}` : `/media/video/${id}`;
      await api.delete(endpoint);
      fetchMedia();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Media Management</h2>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'audio' ? 'bg-white text-saffron-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Audio Library
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'video' ? 'bg-white text-saffron-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Video Gallery
          </button>
        </div>
      </div>

      {/* Upload/Add Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {activeTab === 'audio' ? <FiUpload /> : <FiLink />}
          {activeTab === 'audio' ? 'Upload New Audio' : 'Add New Video Link'}
        </h3>

        <form onSubmit={activeTab === 'audio' ? handleAudioUpload : handleVideoAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none"
                placeholder="e.g., Morning Kirtan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none"
              >
                <option value="kirtan">Kirtan</option>
                <option value="lecture">Lecture</option>
                <option value="bhajan">Bhajan</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {activeTab === 'audio' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audio File (MP3)</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-saffron-50 file:text-saffron-700 hover:file:bg-saffron-100"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none"
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-8">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-saffron-600 rounded focus:ring-saffron-500"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">Make Publicly Available</label>
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-saffron-500 text-white rounded-xl font-medium hover:bg-saffron-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  {activeTab === 'audio' ? <FiUpload /> : <FiLink />}
                  {activeTab === 'audio' ? 'Upload Audio' : 'Add Video'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">
            {activeTab === 'audio' ? 'Audio Library' : 'Video Gallery'}
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron-500 mx-auto"></div>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No items found. Add some above!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {mediaList.map((item) => (
              <div key={item.audio_id || item.video_id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-saffron-50 flex items-center justify-center text-saffron-600">
                    {activeTab === 'audio' ? <FiMusic /> : <FiVideo />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="capitalize">{item.category}</span>
                      <span>•</span>
                      <span>{new Date(item.uploaded_at || item.added_at).toLocaleDateString()}</span>
                      {item.is_public ? (
                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Public</span>
                      ) : (
                        <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">Private</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeTab === 'audio' ? (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-saffron-600 hover:bg-saffron-50 rounded-lg transition-colors"
                      title="Play/Download"
                    >
                      <FiPlay size={18} />
                    </a>
                  ) : (
                    <a
                      href={item.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-saffron-600 hover:bg-saffron-50 rounded-lg transition-colors"
                      title="Watch on YouTube"
                    >
                      <FiExternalLink size={18} />
                    </a>
                  )}

                  <button
                    onClick={() => handleDelete(item.audio_id || item.video_id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaManagement;