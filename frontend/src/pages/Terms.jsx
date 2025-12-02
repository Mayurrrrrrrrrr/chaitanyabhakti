import React from 'react';

const Terms = () => {
    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-xl">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-800 mb-6">Terms and Conditions</h1>

                <div className="prose prose-lg text-gray-600">
                    <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Agreement to Terms</h2>
                    <p>By accessing our application, you agree to be bound by these Terms and Conditions.</p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Use License</h2>
                    <p>Permission is granted to temporarily download one copy of the materials (information or software) on Chaitanya Bhakti's website for personal, non-commercial transitory viewing only.</p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Disclaimer</h2>
                    <p>The materials on Chaitanya Bhakti's website are provided on an 'as is' basis. Chaitanya Bhakti makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Limitations</h2>
                    <p>In no event shall Chaitanya Bhakti or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Chaitanya Bhakti's website.</p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Governing Law</h2>
                    <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
