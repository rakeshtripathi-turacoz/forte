import React, { useState } from 'react';

const AdmissionEnquiryModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    dateOfBirth: '',
    category: '',
    address: '',
    email: '',
    mobileNumber: '',
    programInterested: ''
  });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());

  function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
  }

  const programs = [
    { value: 'bcom', label: 'B.Com' },
    { value: 'bba', label: 'BBA' },
    { value: 'bca', label: 'BCA' },
    { value: 'ba', label: 'BA' },
    { value: 'bsc-cs', label: 'B.Sc. (CS)' },
    { value: 'bsc-pcm', label: 'B.Sc. (PCM)' },
    { value: 'bsc-hs', label: 'B.Sc. (Home Science)' },
    { value: 'bed', label: 'B.Ed' },
    { value: 'bped', label: 'B.P.Ed' },
    { value: 'mba', label: 'MBA' },
    { value: 'mca', label: 'MCA' },
    { value: 'med', label: 'M.Ed' }
  ];

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'obc', label: 'OBC' },
    { value: 'sc', label: 'SC' },
    { value: 'st', label: 'ST' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCaptchaChange = (e) => {
    const value = e.target.value;
    setCaptchaInput(value);
    setCaptchaVerified(value === captchaCode);
  };

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
    setCaptchaVerified(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!captchaVerified) {
      alert('Please enter the correct captcha code.');
      return;
    }
    console.log('Admission Enquiry Submitted:', formData);
    alert('Thank you for your enquiry! We will contact you soon.');
    onClose();
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      name: '',
      fatherName: '',
      dateOfBirth: '',
      category: '',
      address: '',
      email: '',
      mobileNumber: '',
      programInterested: ''
    });
    setCaptchaInput('');
    setCaptchaVerified(false);
    refreshCaptcha();
  };

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal Content - centered */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="sticky top-0 bg-crimson text-white p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold">Admission Enquiry</h2>
            <p className="text-white/80 text-sm">Fill the form below to enquire about admission</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition p-2"
            aria-label="Close modal"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name <span className="text-crimson">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
              />
            </div>

            {/* Father's Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Father's Name <span className="text-crimson">*</span>
              </label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                required
                placeholder="Enter father's name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth <span className="text-crimson">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-crimson">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-crimson">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number <span className="text-crimson">*</span>
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                placeholder="Enter 10-digit mobile number"
                pattern="[0-9]{10}"
                maxLength="10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
              />
            </div>

            {/* Address - Full Width */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address <span className="text-crimson">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Enter your complete address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition resize-none"
              ></textarea>
            </div>

            {/* Program Interested In - Full Width */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Program Interested In <span className="text-crimson">*</span>
              </label>
              <select
                name="programInterested"
                value={formData.programInterested}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
              >
                <option value="">Select Program</option>
                {programs.map((prog) => (
                  <option key={prog.value} value={prog.value}>
                    {prog.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Captcha - Full Width */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Security Code <span className="text-crimson">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 px-4 py-3 rounded-lg border border-gray-300 font-mono text-lg tracking-widest select-none"
                       style={{
                         background: 'linear-gradient(135deg, #f3f4f6 25%, #e5e7eb 25%, #e5e7eb 50%, #f3f4f6 50%, #f3f4f6 75%, #e5e7eb 75%)',
                         backgroundSize: '20px 20px',
                         textDecoration: 'line-through',
                         textDecorationColor: 'rgba(0,0,0,0.1)'
                       }}>
                    {captchaCode}
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-3 text-crimson hover:text-red-800 transition"
                    title="Refresh Captcha"
                  >
                    <i className="fas fa-sync-alt"></i>
                  </button>
                </div>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={handleCaptchaChange}
                  required
                  placeholder="Enter code shown above"
                  className={`flex-1 w-full sm:w-auto px-4 py-3 border rounded-lg focus:ring-1 outline-none transition ${
                    captchaInput
                      ? captchaVerified
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                        : 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-crimson focus:ring-crimson'
                  }`}
                />
                {captchaInput && (
                  <span className={`text-sm ${captchaVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {captchaVerified ? <i className="fas fa-check-circle"></i> : <i className="fas fa-times-circle"></i>}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={!captchaVerified}
              className={`flex-1 font-bold py-3 px-8 rounded-lg transition flex items-center justify-center gap-2 ${
                captchaVerified
                  ? 'bg-crimson hover:bg-red-800 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-paper-plane"></i>
              Submit Enquiry
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-lg transition flex items-center justify-center gap-2"
            >
              <i className="fas fa-redo"></i>
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdmissionEnquiryModal;
