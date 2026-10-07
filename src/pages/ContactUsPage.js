import React, { useState } from 'react';
import Banner from '../components/common/Banner';
import { contactAPI } from '../services/api';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await contactAPI.submitContact(formData);

      if (response.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you for your message! We have sent a confirmation email and will get back to you within 24 hours.'
        });

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          category: 'general'
        });

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitStatus({
          type: 'error',
          message: response.message || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred while sending your message. Please try again or contact us directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full fade-in">
      <Banner 
        title="Contact Us"
        subtitle="Get in Touch | We're Here to Help | Connect with Forte"
        imageSrc="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />
      
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 sm:space-y-12">

        {/* Success/Error Message */}
        {submitStatus.message && (
          <div className={`p-4 rounded-lg border ${
            submitStatus.type === 'success'
              ? 'bg-green-50 border-green-500 text-green-800'
              : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <i className={`fas ${submitStatus.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              <p className="font-semibold">{submitStatus.message}</p>
            </div>
          </div>
        )}

        {/* Contact Information Cards */}
        <section>
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-3 sm:mb-4">Get in Touch</h2>
            <p className="text-gray-500 text-sm">Reach out to us through any of the following channels or fill out the contact form below.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Main Office */}
            <div className="bg-white p-6 rounded-xl border border-border_gray text-center">
              <div className="w-14 h-14 bg-crimson rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-map-marker-alt text-white text-xl"></i>
              </div>
              <h3 className="font-bold text-base text-slate mb-3">Main Office</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Forte Institute of Technology<br/>
                Green Park Mawana Road,<br/>
                Meerut – 250001 (U.P.) INDIA.
              </p>
            </div>

            {/* Phone Numbers */}
            <div className="bg-white p-6 rounded-xl border border-border_gray text-center">
              <div className="w-14 h-14 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-phone text-white text-xl"></i>
              </div>
              <h3 className="font-bold text-base text-slate mb-3">Phone Numbers</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Main:</strong> +91 9760013136</p>
                <p><strong>Admission:</strong> +91 9058310460</p>
                <p><strong>Academic:</strong> +91 9997313043</p>
                <p><strong>Placement:</strong> +91 9927915577</p>
              </div>
            </div>

            {/* Email Addresses */}
            <div className="bg-white p-6 rounded-xl border border-border_gray text-center">
              <div className="w-14 h-14 bg-slate rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-envelope text-white text-xl"></i>
              </div>
              <h3 className="font-bold text-base text-slate mb-3">Email Addresses</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>General:</strong> info@forte.ac.in</p>
                <p><strong>Admission:</strong> admissions@forte.ac.in</p>
                <p><strong>Academic:</strong> academics@forte.ac.in</p>
                <p><strong>Placement:</strong> placements@forte.ac.in</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-xl border border-border_gray">
              <h3 className="text-lg font-bold text-crimson mb-6">Send us a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson outline-none"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson outline-none"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson outline-none"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Inquiry Category</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson outline-none"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="admission">Admission</option>
                      <option value="academic">Academic</option>
                      <option value="placement">Training & Placement</option>
                      <option value="research">Research & Development</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                  <input 
                    type="text" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson outline-none"
                    placeholder="Brief subject of your inquiry"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                  <textarea 
                    rows="5"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson outline-none"
                    placeholder="Please describe your inquiry in detail..."
                    required
                  ></textarea>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-crimson hover:bg-red-800 text-white font-bold py-3 px-8 rounded-lg transition flex items-center gap-2 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send Message
                      </>
                    )}
                  </button>
                  <button 
                    type="reset"
                    onClick={() => setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      subject: '',
                      message: '',
                      category: 'general'
                    })}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-lg transition"
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Contact & Office Hours */}
            <div className="space-y-6">
              {/* Office Hours */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="text-base font-bold text-slate mb-4 flex items-center">
                  <i className="fas fa-clock text-crimson mr-2"></i>
                  Office Hours
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-semibold">Monday - Friday:</span>
                    <span className="text-gray-600">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-semibold">Saturday:</span>
                    <span className="text-gray-600">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-semibold">Sunday:</span>
                    <span className="text-gray-600">Closed</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-4">
                    <p className="text-gray-700 text-xs">
                      <strong>Note:</strong> Emergency contact available 24/7 for current students through student portal.
                    </p>
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div className="bg-white p-6 rounded-xl border border-border_gray">
                <h3 className="text-base font-bold text-slate mb-4 flex items-center">
                  <i className="fas fa-map-marker-alt text-crimson mr-2"></i>
                  Find Us on Map
                </h3>
                <div className="rounded-lg overflow-hidden aspect-[16/9]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3488.123456789!2d77.7!3d29.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sGreen%20Park%20Mawana%20Road%2C%20Meerut%2C%20Uttar%20Pradesh%20250001!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Forte Institute of Technology Location"
                  ></iframe>
                </div>
                <div className="mt-4 flex items-center gap-2 text-gray-600">
                  <i className="fas fa-map-marker-alt text-crimson"></i>
                  <span className="text-sm">Green Park Mawana Road, Meerut – 250001 (U.P.) INDIA.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ContactUsPage;