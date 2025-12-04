// frontend/src/components/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiUser, FiPhone, FiMail, FiAward, FiLogOut, FiCamera, FiEdit, FiSettings, FiBell, FiType, FiVolume2 } from 'react-icons/fi';
import './Profile.css';
import { saveUserPreferences, getUserPreferences } from '../supabase';
import { requestNotificationPermission } from '../onesignal';

const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef();

    const [stats, setStats] = useState({ totalMalas: 0, streak: 0 });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // Preferences State
    const [preferences, setPreferences] = useState({
        seniorMode: false,
        notifications: true,
        morningTime: '06:00',
        eveningTime: '18:00',
        language: 'english'
    });
    const [prefLoading, setPrefLoading] = useState(false);

    useEffect(() => {
        fetchStats();
        fetchPreferences();
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

    const fetchPreferences = async () => {
        if (!user?.id) return;
        try {
            const { success, data } = await getUserPreferences(user.id);
            if (success && data) {
                setPreferences({
                    seniorMode: data.text_size === 'large',
                    notifications: data.notifications_enabled ?? true,
                    morningTime: data.notification_morning || '06:00',
                    eveningTime: data.notification_evening || '18:00',
                    language: data.breathe_voice_language || 'english'
                });
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
        }
    };

    const handlePreferenceChange = async (key, value) => {
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);

        // If enabling notifications, request permission
        if (key === 'notifications' && value === true) {
            await requestNotificationPermission();
        }

        // Debounce save or save immediately
        savePreferencesToDb(newPrefs);
    };

    const savePreferencesToDb = async (prefs) => {
        if (!user?.id) return;
        setPrefLoading(true);
        try {
            await saveUserPreferences(user.id, {
                text_size: prefs.seniorMode ? 'large' : 'normal',
                notifications_enabled: prefs.notifications,
                notification_morning: prefs.morningTime,
                notification_evening: prefs.eveningTime,
                breathe_voice_language: prefs.language
            });
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setPrefLoading(false);
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

        if (!file.type.startsWith('image/')) {
            setUploadError('Please select an image file');
            return;
        }

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
                headers: { 'Content-Type': 'multipart/form-data' },
            });

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
        <div className={`page-container profile-page ${preferences.seniorMode ? 'text-lg' : ''}`}>

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

            {/* Preferences Section */}
            <div className="card details-card mb-6">
                <div className="card-header-row">
                    <h3><FiSettings className="inline mr-2" /> Preferences</h3>
                    {prefLoading && <span className="text-xs text-gray-400">Saving...</span>}
                </div>

                <div className="detail-list">
                    {/* Senior Mode */}
                    <div className="detail-item justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="detail-icon"><FiType /></div>
                            <div className="detail-content">
                                <label>Senior Citizen Mode</label>
                                <p className="text-xs text-gray-500">Larger text & simplified view</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={preferences.seniorMode}
                                onChange={(e) => handlePreferenceChange('seniorMode', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-saffron-500"></div>
                        </label>
                    </div>

                    {/* Notifications */}
                    <div className="detail-item justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="detail-icon"><FiBell /></div>
                            <div className="detail-content">
                                <label>Daily Reminders</label>
                                <p className="text-xs text-gray-500">Practice notifications</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={preferences.notifications}
                                onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-saffron-500"></div>
                        </label>
                    </div>

                    {preferences.notifications && (
                        <div className="pl-12 pr-4 pb-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Morning</label>
                                <input
                                    type="time"
                                    value={preferences.morningTime}
                                    onChange={(e) => handlePreferenceChange('morningTime', e.target.value)}
                                    className="border rounded p-1 text-sm w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Evening</label>
                                <input
                                    type="time"
                                    value={preferences.eveningTime}
                                    onChange={(e) => handlePreferenceChange('eveningTime', e.target.value)}
                                    className="border rounded p-1 text-sm w-full"
                                />
                            </div>
                        </div>
                    )}
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