// frontend/src/onesignal.js

const OneSignal = window.OneSignal || [];

export const initOneSignal = () => {
    return new Promise((resolve) => {
        OneSignal.push(() => {
            OneSignal.init({
                appId: process.env.REACT_APP_ONESIGNAL_APP_ID || "YOUR_ONESIGNAL_APP_ID", // Replace with env var
                allowLocalhostAsSecureOrigin: true,
                notifyButton: {
                    enable: false, // We will use our own UI in Profile
                },
            });
            resolve();
        });
    });
};

export const requestNotificationPermission = async () => {
    return new Promise((resolve) => {
        OneSignal.push(() => {
            OneSignal.showSlidedownPrompt({ force: true });
            OneSignal.on('subscriptionChange', function (isSubscribed) {
                resolve(isSubscribed);
            });
        });
    });
};

export const isPushNotificationsEnabled = async () => {
    return new Promise((resolve) => {
        OneSignal.push(async () => {
            const state = await OneSignal.getNotificationPermission();
            resolve(state === 'granted');
        });
    });
};
