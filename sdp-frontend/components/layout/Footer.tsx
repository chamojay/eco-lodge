import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black text-white py-4">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} SDP Hotel. All rights reserved.</p>
                <div className="mt-2">
                    <a href="/privacy-policy" className="text-green-500 hover:underline">Privacy Policy</a>
                    <span className="mx-2">|</span>
                    <a href="/terms-of-service" className="text-green-500 hover:underline">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;