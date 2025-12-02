import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import CommunityPost from './CommunityPost';
import CommunityPostForm from './CommunityPostForm';
import { FiUser, FiPhone, FiMail, FiMessageCircle, FiUsers } from 'react-icons/fi';
import './FamilyDetail.css';

const FamilyDetail = () => {
  const { family_id } = useParams();
  const [family, setFamily] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'contacts'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [famRes, postRes] = await Promise.all([
        api.get(`/families/${family_id}`),
        api.get(`/community/family/${family_id}`)
      ]);
      setFamily(famRes.data);
      setPosts(postRes.data || []);
      setError('');
    } catch (e) {
      console.error('Load family error:', e);
      setError('Failed to load family details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [family_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 text-red-600">
            {error}
          </div>
        )}

        {family && (
          <>
            {/* Family Header Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 mb-6 shadow-xl border border-white/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                    {family.family_name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="font-heading text-3xl font-bold text-gray-800">
                      {family.family_name}
                    </h1>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <FiUsers size={16} />
                      {family.members?.length || 0} members
                    </p>
                  </div>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl font-bold text-sm">
                  Code: {family.family_code}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-2 mb-6 shadow-lg border border-white/50 flex gap-2">
              <button
                onClick={() => setActiveTab('posts')}
                className={`
                  flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                  ${activeTab === 'posts'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <FiMessageCircle />
                Posts
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`
                  flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                  ${activeTab === 'contacts'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <FiPhone />
                Contacts
              </button>
            </div>

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <>
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-lg border border-white/50">
                  <h3 className="font-heading text-xl font-bold text-gray-800 mb-4">Share with Family</h3>
                  <CommunityPostForm family_id={family_id} onPostCreated={loadData} />
                </div>

                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/50">
                      <FiMessageCircle className="text-5xl text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No posts yet. Be the first to share!</p>
                    </div>
                  ) : (
                    posts.map(p => <CommunityPost key={p.post_id} post={p} />)
                  )}
                </div>
              </>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                {family.members && family.members.length > 0 ? (
                  family.members.map(member => (
                    <div
                      key={member.user_id}
                      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                          {member.profile_photo ? (
                            <img
                              src={member.profile_photo}
                              alt={member.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span>{member.name?.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>

                        {/* Member Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-gray-800">
                              {member.name}
                            </h3>
                            {member.is_admin && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                Admin
                              </span>
                            )}
                          </div>

                          {member.spiritual_name && (
                            <p className="text-sm text-gray-600 italic mb-3">
                              {member.spiritual_name}
                            </p>
                          )}

                          {/* Contact Details */}
                          <div className="space-y-2">
                            {member.mobile_number && (
                              <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                  <FiPhone className="text-green-600" size={14} />
                                </div>
                                <a
                                  href={`tel:${member.mobile_number}`}
                                  className="text-gray-700 hover:text-green-600 font-medium"
                                >
                                  {member.mobile_number}
                                </a>
                              </div>
                            )}

                            {member.email && (
                              <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <FiMail className="text-blue-600" size={14} />
                                </div>
                                <a
                                  href={`mailto:${member.email}`}
                                  className="text-gray-700 hover:text-blue-600 font-medium truncate"
                                >
                                  {member.email}
                                </a>
                              </div>
                            )}

                            {!member.mobile_number && !member.email && (
                              <p className="text-sm text-gray-500 italic">
                                No contact information available
                              </p>
                            )}
                          </div>

                          {/* Relation */}
                          {member.relation && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600">
                                <FiUser className="inline mr-1" size={12} />
                                {member.relation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/50">
                    <FiUsers className="text-5xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No family members yet</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FamilyDetail;