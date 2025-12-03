// backend/utils/notificationHelper.js

/**
 * Helper functions to create notifications for various events
 */

// Send notification to all users
async function notifyAllUsers(db, title, message, type = 'info', link = null) {
    try {
        const [users] = await db.query('SELECT user_id FROM users WHERE is_active = 1');

        const values = users.map(user => [
            user.user_id,
            title,
            message,
            type,
            link
        ]);

        if (values.length > 0) {
            await db.query(
                'INSERT INTO notifications (user_id, title, message, type, link) VALUES ?',
                [values]
            );
        }

        console.log(`✅ Sent notification to ${users.length} users: ${title}`);
        return true;
    } catch (error) {
        console.error('Error sending notification to all users:', error);
        return false;
    }
}

// Send notification to specific user
async function notifyUser(db, userId, title, message, type = 'info', link = null) {
    try {
        await db.query(
            'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
            [userId, title, message, type, link]
        );

        console.log(`✅ Sent notification to user ${userId}: ${title}`);
        return true;
    } catch (error) {
        console.error('Error sending notification to user:', error);
        return false;
    }
}

// Notify on new scripture
async function notifyNewScripture(db, scriptureTitle) {
    return await notifyAllUsers(
        db,
        '📚 New Scripture Added',
        `"${scriptureTitle}" is now available in the Scripture Library.`,
        'scripture',
        '/library'
    );
}

// Notify on new event
async function notifyNewEvent(db, eventTitle, eventDate) {
    return await notifyAllUsers(
        db,
        '🎉 New Event Added',
        `${eventTitle} on ${new Date(eventDate).toLocaleDateString()}. Check the calendar for details.`,
        'event',
        '/calendar'
    );
}

// Notify on new media
async function notifyNewMedia(db, mediaTitle, mediaType) {
    const icon = mediaType === 'video' ? '📺' : '🎵';
    return await notifyAllUsers(
        db,
        `${icon} New ${mediaType === 'video' ? 'Video' : 'Audio'} Added`,
        `"${mediaTitle}" is now available in Satsang.`,
        'media',
        '/satsang'
    );
}

// Notify on task assignment
async function notifyTaskAssignment(db, userId, taskTitle) {
    return await notifyUser(
        db,
        userId,
        '✅ New Task Assigned',
        `You have been assigned: "${taskTitle}"`,
        'task',
        '/tasks'
    );
}

// Notify on upcoming event (can be run daily via cron)
async function notifyUpcomingEvent(db, eventTitle, daysUntil) {
    return await notifyAllUsers(
        db,
        '⏰ Upcoming Event Reminder',
        `${eventTitle} is ${daysUntil} day${daysUntil > 1 ? 's' : ''} away!`,
        'reminder',
        '/calendar'
    );
}

module.exports = {
    notifyAllUsers,
    notifyUser,
    notifyNewScripture,
    notifyNewEvent,
    notifyNewMedia,
    notifyTaskAssignment,
    notifyUpcomingEvent
};