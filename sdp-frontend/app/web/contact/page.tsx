import React from 'react';

const ContactPage = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
            <p className="mb-4">For inquiries, please fill out the form below:</p>
            <form className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium">Name</label>
                    <input type="text" id="name" className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium">Email</label>
                    <input type="email" id="email" className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium">Message</label>
                    <textarea id="message" className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows="4" required></textarea>
                </div>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md">Send Message</button>
            </form>
        </div>
    );
};

export default ContactPage;