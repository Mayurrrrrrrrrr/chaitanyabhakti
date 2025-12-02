import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiUser, FiPhone, FiMail, FiAward, FiLogOut, FiCamera, FiEdit } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef();

    const [stats, setStats] = useState({ totalMalas: 0, streak: 0 });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/japa/summary');
            if (res.data) {
                setStats({
                    totalMalas: res.data.total_rounds || res.data.total_malas || 0,
                    streak: res.data.current_streak || res.data.streak || 0
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            logout();
            navigate('/login');
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image size must be less than 5MB');
            return;
        }

        setUploading(true);
        setUploadError('');

        const formData = new FormData();
        formData.append('profile_photo', file);

        try {
            const response = await api.post('/user/profile/photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Photo upload response:', response.data);

            // Update user context with new photo URL
            if (response.data.profile_photo) {
                updateUser({
                    ...user,
                    profile_photo: response.data.profile_photo
                });
            }

            setUploadError('');
        } catch (error) {
            console.error('Photo upload error:', error);
            setUploadError(error.response?.data?.error || 'Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500"></div>
            </div>
        );
    }

    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'VB';

    return (
        <div className="page-container profile-page">

            {/* Header Card */}
            <div className="card profile-header-card">
                <div className="profile-cover-bg"></div>
                <div className="profile-main-info">
                    {/* Avatar with Photo Upload */}
                    <div className="relative inline-block">
                        <div className="avatar-large">
                            {user.profile_photo ? (
                                <img
                                    src={user.profile_photo}
                                    alt={user.name}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>

                        {/* Camera Button */}
                        <button
                            onClick={handlePhotoClick}
                            disabled={uploading}
                            className="absolute bottom-0 right-0 w-10 h-10 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                            title="Upload Photo"
                        >
                            {uploading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            ) : (
                                <FiCamera size={18} />
                            )}
                        </button>

                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                    </div>

                    {uploadError && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                            {uploadError}
                        </div>
                    )}

                    <h1 className="user-name">{user.name}</h1>
                    <p className="user-spiritual-name">{user.spiritual_name || 'Aspiring Devotee'}</p>
                    <span className="role-badge">{user.is_super_admin ? 'Administrator' : 'Member'}</span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="profile-stats-row">
                <div className="card stat-card">
                    <span className="stat-number">{stats.totalMalas}</span>
                    <span className="stat-desc">Total Rounds</span>
                </div>
                <div className="card stat-card">
                    <span className="stat-number">{stats.streak}</span>
                    <span className="stat-desc">Day Streak</span>
                </div>
                <div className="card stat-card">
                    <span className="stat-number">4</span>
                    <span className="stat-desc">Groups</span>
                </div>
            </div>

            {/* Details Section */}
            <div className="card details-card">
                <div className="card-header-row">
                    <h3>Personal Details</h3>
                    <button className="icon-btn-text" disabled title="Edit Profile (Coming Soon)">
                        <FiEdit /> Edit
                    </button>
                </div>

                <div className="detail-list">
                    <div className="detail-item">
                        <div className="detail-icon"><FiPhone /></div>
                        <div className="detail-content">
                            <label>Mobile Number</label>
                            <p>{user.mobile_number}</p>
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-icon"><FiMail /></div>
                        <div className="detail-content">
                            <label>Email</label>
                            <p>{user.email || 'Not provided'}</p>
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-icon"><FiAward /></div>
                        <div className="detail-content">
                            <label>Initiation Status</label>
                            <p>{user.initiation_status || 'Aspiring'}</p>
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-icon"><FiUser /></div>
                        <div className="detail-content">
                            <label>Yatra / Center</label>
                            <p>{user.center || 'Local Temple'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="profile-actions">
                <button className="btn-logout-large" onClick={handleLogout}>
                    <FiLogOut /> Logout
                </button>
            </div>

        </div>
    );
};

export default Profile;