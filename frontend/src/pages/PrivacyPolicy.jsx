import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-xl">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-800 mb-6">Privacy Policy</h1>

                <div className="prose prose-lg text-gray-600">
                    <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Introduction</h2>
                    <p>Welcome to Chaitanya Bhakti. We respect your privacy and are committed to protecting your personal data.</p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Data We Collect</h2>
                    <p>We may collect the following types of information:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Personal identification information (Name, email address, phone number, etc.)</li>
                        <li>Spiritual practice data (Japa rounds, meditation sessions)</li>
                        <li>Usage data and preferences</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. How We Use Your Data</h2>
                    <p>We use your data to:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Provide and maintain our service</li>
                        <li>Track your spiritual progress</li>
                        <li>Manage your account</li>
                        <li>Communicate with you</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Data Security</h2>
                    <p>We implement appropriate security measures to protect your personal information.</p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us.</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
