// backend/utils/notificationHelper.js

const createNotification = async (db, userId, title, message, type, link = null) => {
    try {
        await db.query(
            'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
            [userId, title, message, type, link]
        );
    } catch (error) {
        console.error('Notification creation failed:', error);
    }
};

const notifyNewScripture = async (db, scriptureTitle) => {
    try {
        // Notify all users (user_id = NULL)
        await db.query(
            'INSERT INTO notifications (user_id, title, message, type, link) VALUES (NULL, ?, ?, ?, ?)',
            ['New Scripture Added', `A new scripture "${scriptureTitle}" is now available in the library.`, 'scripture', '/scriptures']
        );
    } catch (error) {
        console.error('Scripture notification failed:', error);
    }
};

const notifyNewMedia = async (db, mediaTitle, mediaType) => {
    try {
        await db.query(
            'INSERT INTO notifications (user_id, title, message, type, link) VALUES (NULL, ?, ?, ?, ?)',
            ['New Media Added', `New ${mediaType} "${mediaTitle}" has been added.`, 'media', '/media']
        );
    } catch (error) {
        console.error('Media notification failed:', error);
    }
};

const notifyNewEvent = async (db, eventTitle) => {
    try {
        await db.query(
            'INSERT INTO notifications (user_id, title, message, type, link) VALUES (NULL, ?, ?, ?, ?)',
            ['New Event', `Upcoming event: "${eventTitle}". Check it out!`, 'event', '/events']
        );
    } catch (error) {
        console.error('Event notification failed:', error);
    }
};

module.exports = {
    createNotification,
    notifyNewScripture,
    notifyNewMedia,
    notifyNewEvent
};
