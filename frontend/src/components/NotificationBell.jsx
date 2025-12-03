// frontend/src/components/NotificationBell.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiX } from 'react-icons/fi';
import api from '../utils/api';

const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUnreadCount();
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/notifications/unread-count');
            setUnreadCount(res.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            fetchUnreadCount();
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleNotificationClick = (notif) => {
        markAsRead(notif.notification_id);
        setShowMenu(false);
        if (notif.link) {
            navigate(notif.link);
        }
    };

    const handleBellClick = () => {
        setShowMenu(!showMenu);
        if (!showMenu) {
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            fetchUnreadCount();
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (notificationId, e) => {
        e.stopPropagation();
        try {
            await api.delete(`/notifications/${notificationId}`);
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'scripture': return '📚';
            case 'event': return '🎉';
            case 'media': return '🎵';
            case 'task': return '✅';
            case 'reminder': return '⏰';
            default: return '📬';
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="relative">
            {/* Bell Icon with Badge */}
            <button
                onClick={handleBellClick}
                className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Notifications"
            >
                <FiBell size={22} className="text-white" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                    />

                    {/* Notification Panel */}
                    <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-saffron-500 to-orange-500 text-white">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg">Notifications</h3>
                                <button
                                    onClick={() => setShowMenu(false)}
                                    className="p-1 hover:bg-white/20 rounded transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            {unreadCount > 0 && (
                                <p className="text-xs text-white/80 mt-1">
                                    {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                                </p>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron-500 mx-auto"></div>
                                    <p className="text-sm text-gray-500 mt-2">Loading...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="text-4xl mb-2">🔔</div>
                                    <p className="text-gray-500">No notifications yet</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        You'll see updates here when there's new content
                                    </p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.notification_id}
                                        className={`
                      p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors relative group
                      ${!notif.is_read ? 'bg-saffron-50/50' : ''}
                    `}
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className="text-2xl flex-shrink-0">
                                                {getNotificationIcon(notif.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="font-semibold text-sm text-gray-800 leading-tight">
                                                        {notif.title}
                                                    </div>
                                                    {!notif.is_read && (
                                                        <div className="w-2 h-2 bg-saffron-500 rounded-full flex-shrink-0 mt-1"></div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-400">
                                                        {getTimeAgo(notif.created_at)}
                                                    </span>
                                                    <button
                                                        onClick={(e) => deleteNotification(notif.notification_id, e)}
                                                        className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-600 transition-opacity"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-saffron-600 hover:text-saffron-700 font-medium transition-colors"
                                >
                                    Mark all as read
                                </button>
                                <span className="text-xs text-gray-500">
                                    {notifications.length} total
                                </span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;