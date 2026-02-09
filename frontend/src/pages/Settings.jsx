import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Wallet,
  Save,
  ArrowLeft,
  Camera,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

const Settings = () => {
  const { user, loading: authLoading, updateProfile } = useAuth();
  const lastUserIdRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
    year: '1st',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    language: 'English',
    incomeFrequency: 'Monthly',
    incomeSources: '',
    priorities: 'Saving',
    riskTolerance: 'Moderate'
  });

  // Sync User Data
  useEffect(() => {
    if (!user) {
      lastUserIdRef.current = null;
      return;
    }
    // Prevent overwrite if user is editing
    if (lastUserIdRef.current === user._id) return;

    setFormData((prev) => ({
      ...prev,
      ...user, // Spread user properties to catch all matches
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      department: user.department || '',
      year: user.year || '1st',
      // Ensure financial defaults are preserved if not in user obj
      currency: user.currency || prev.currency,
      incomeFrequency: user.incomeFrequency || prev.incomeFrequency,
      priorities: user.priorities || prev.priorities,
      riskTolerance: user.riskTolerance || prev.riskTolerance,
    }));
    lastUserIdRef.current = user._id;
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear status when user starts typing
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || isSaving) return;

    setIsSaving(true);
    setStatus({ type: '', message: '' });

    try {
      // Construct payload specifically
      const payload = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        year: formData.year,
        currency: formData.currency,
        dateFormat: formData.dateFormat,
        language: formData.language,
        incomeFrequency: formData.incomeFrequency,
        incomeSources: formData.incomeSources,
        priorities: formData.priorities,
        riskTolerance: formData.riskTolerance
      };

      const data = await updateProfile(payload);

      if (data?.success) {
        setStatus({ type: 'success', message: 'Settings saved successfully.' });
        // Optional: Update ref to prevent re-sync overwriting latest changes
        lastUserIdRef.current = user._id;
      } else {
        setStatus({ type: 'error', message: data?.message || 'Failed to save changes.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error?.response?.data?.message || 'An unexpected error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  const userInitials = formData.fullName
    ? formData.fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'U';

  // --- Sub-Components for Cleanliness ---

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-all rounded-lg group ${activeTab === id
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${activeTab === id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
      {label}
    </button>
  );

  const InputGroup = ({ label, name, type = "text", value, disabled = false, options = null }) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {options ? (
          <select
            name={name}
            value={value}
            onChange={handleChange}
            className="block w-full py-2.5 px-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
          >
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={`block w-full py-2.5 px-3 border rounded-lg sm:text-sm shadow-sm transition-all ${disabled
                ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed'
                : 'text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
          />
        )}
        {disabled && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your account settings and preferences.</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              <TabButton id="profile" label="My Profile" icon={User} />
              <TabButton id="financial" label="Financial Profile" icon={Wallet} />
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <form onSubmit={handleSave} className="space-y-6">

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                    <p className="text-sm text-gray-500">Update your photo and personal details.</p>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                      <div className="relative group cursor-pointer">
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold border-4 border-white shadow-sm">
                          {userInitials}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Profile Photo</h3>
                        <p className="text-xs text-gray-500 mt-1">Click to upload a new avatar.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Full Name" name="fullName" value={formData.fullName} />
                      <InputGroup label="Email Address" name="email" value={formData.email} disabled />
                      <InputGroup label="Phone Number" name="phoneNumber" type="tel" value={formData.phoneNumber} />
                      <InputGroup label="Department" name="department" value={formData.department} />
                      <InputGroup label="Year" name="year" value={formData.year} options={['1st', '2nd', '3rd', '4th', '5th']} />
                      <InputGroup label="Language" name="language" value={formData.language} options={['English', 'Hindi', 'Spanish', 'French']} />
                      <InputGroup label="Date Format" name="dateFormat" value={formData.dateFormat} options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']} />
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Tab */}
              {activeTab === 'financial' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Financial Preferences</h2>
                    <p className="text-sm text-gray-500">Tailor your dashboard insights.</p>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="Primary Currency" name="currency" value={formData.currency} options={['USD', 'INR', 'EUR', 'GBP']} />
                    <InputGroup label="Income Frequency" name="incomeFrequency" value={formData.incomeFrequency} options={['Monthly', 'Bi-Weekly', 'Weekly', 'Quarterly']} />
                    <div className="md:col-span-2">
                      <InputGroup label="Income Sources" name="incomeSources" value={formData.incomeSources} />
                      <p className="text-xs text-gray-500 mt-1.5">Separate multiple sources with commas (e.g., Salary, Freelance)</p>
                    </div>
                    <InputGroup label="Financial Priority" name="priorities" value={formData.priorities} options={['Saving', 'Investing', 'Debt Payoff', 'Balanced']} />
                    <InputGroup label="Risk Tolerance" name="riskTolerance" value={formData.riskTolerance} options={['Conservative', 'Moderate', 'Aggressive']} />
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4">
                {/* Status Messages */}
                <div className="flex-1 mr-4">
                  {status.message && (
                    <div className={`flex items-center text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                      {status.message}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.location.reload()} // Or reset state logic
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || authLoading}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;