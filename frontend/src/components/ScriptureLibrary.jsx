// frontend/src/components/ScriptureLibrary.jsx
import React, { useState, useEffect } from 'react';
import { FiBook, FiSearch, FiFilter, FiDownload, FiPlay, FiX, FiMaximize, FiMinimize } from 'react-icons/fi';
import { Document, Page, pdfjs } from 'react-pdf';
import api from '../utils/api';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ScriptureLibrary = () => {
  const [scriptures, setScriptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedScripture, setSelectedScripture] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchScriptures();
  }, []);

  const fetchScriptures = async () => {
    try {
      const res = await api.get('/scriptures');
      setScriptures(res.data);
    } catch (error) {
      console.error('Failed to fetch scriptures:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const filteredScriptures = scriptures.filter(scripture => {
    const matchesSearch = scripture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scripture.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || scripture.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(scriptures.map(s => s.category).filter(Boolean))];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-heading">Scripture Library</h1>
          <p className="text-gray-500 mt-1">Access sacred texts and wisdom</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search scriptures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none w-full sm:w-64"
            />
          </div>

          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none appearance-none bg-white w-full sm:w-48"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScriptures.map((scripture) => (
            <div
              key={scripture.scripture_id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 bg-gradient-to-br from-saffron-100 to-orange-50 overflow-hidden">
                {scripture.cover_url ? (
                  <img
                    src={scripture.cover_url}
                    alt={scripture.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-saffron-300">
                    <FiBook size={64} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-1 bg-saffron-50 text-saffron-600 text-xs font-medium rounded-lg">
                    {scripture.category || 'General'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1" title={scripture.title}>
                  {scripture.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{scripture.author || 'Unknown Author'}</p>

                <div className="mt-auto flex items-center gap-2 pt-4 border-t border-gray-50">
                  {scripture.content_url && (
                    <button
                      onClick={() => setSelectedScripture(scripture)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-saffron-500 text-white rounded-xl hover:bg-saffron-600 transition-colors text-sm font-medium"
                    >
                      <FiBook /> Read
                    </button>
                  )}
                  {scripture.audio_url && (
                    <a
                      href={scripture.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-saffron-600 hover:bg-saffron-50 rounded-xl transition-colors"
                      title="Listen Audio"
                    >
                      <FiPlay size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Reader Modal */}
      {selectedScripture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden transition-all duration-300 ${isFullscreen ? 'h-full' : 'max-w-4xl h-[85vh]'}`}>

            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
              <h3 className="font-bold text-lg text-gray-800 truncate pr-4">
                {selectedScripture.title}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors hidden md:block"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
                </button>
                <button
                  onClick={() => setSelectedScripture(null)}
                  className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-auto bg-gray-50 flex justify-center p-4">
              <Document
                file={selectedScripture.content_url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron-500 mb-4"></div>
                    <p className="text-gray-500">Loading PDF...</p>
                  </div>
                }
                error={
                  <div className="flex flex-col items-center justify-center h-64 text-red-500">
                    <p>Failed to load PDF.</p>
                    <a
                      href={selectedScripture.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Download to View
                    </a>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-lg"
                  width={Math.min(window.innerWidth * 0.9, 800)}
                />
              </Document>
            </div>

            {/* Modal Footer (Controls) */}
            <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
              <button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber(prev => prev - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <span className="text-sm font-medium text-gray-600">
                Page {pageNumber} of {numPages || '--'}
              </span>

              <button
                disabled={pageNumber >= numPages}
                onClick={() => setPageNumber(prev => prev + 1)}
                className="px-4 py-2 text-sm font-medium text-white bg-saffron-500 rounded-lg hover:bg-saffron-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptureLibrary;