import React, { useState } from 'react';
import { useShop } from '../store';
import { useToast } from '../components/Toast';
import { GiveawayEntry } from '../types';
import { Link } from 'react-router-dom';

const Giveaway: React.FC = () => {
  const { addGiveawayEntry, giveawayEnabled, giveawayEntries } = useShop();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!giveawayEnabled) {
    return (
      <div className="pt-32 pb-24 px-6 min-h-screen bg-white">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-3 text-black">Giveaway</h1>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            No giveaway is currently running. Check back later!
          </p>
          <Link to="/" className="inline-block bg-gray-900 text-white font-bold uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-gray-800 transition-colors text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    if (!/^[0-9]{10,15}$/.test(phone.replace(/\s/g, ''))) {
      showToast('Please enter a valid phone number', 'error');
      return;
    }

    setIsSubmitting(true);

    const existingPhone = giveawayEntries.filter(e => e.phone === phone.trim());
    if (existingPhone.length > 0) {
      showToast('This phone number has already been used', 'error');
      setIsSubmitting(false);
      return;
    }

    const ig = instagram.trim().replace(/^@/, '');
    if (ig) {
      const existingIg = giveawayEntries.filter(e => e.instagram && e.instagram.replace(/^@/, '') === ig);
      if (existingIg.length > 0) {
        showToast('This Instagram ID has already been used', 'error');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const entry: GiveawayEntry = {
        id: `gw_${phone.trim()}`,
        name: name.trim(),
        phone: phone.trim(),
        instagram: instagram.trim() || undefined,
        createdAt: Date.now(),
      };
      await addGiveawayEntry(entry);
      showToast('Successfully entered the giveaway! Good luck!', 'success');
      setName('');
      setPhone('');
      setInstagram('');
    } catch {
      showToast('Failed to submit entry. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-white">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-3 text-black">
          Giveaway
        </h1>
          <p className="text-gray-500 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
            Enter your details for a chance to win exclusive III Monks merchandise.
          </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-sm focus:border-gray-900 outline-none transition-colors text-black"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-sm focus:border-gray-900 outline-none transition-colors text-black"
              placeholder="Enter your phone number"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Instagram ID</label>
            <input
              type="text"
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-sm focus:border-gray-900 outline-none transition-colors text-black"
              placeholder="@username"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 text-white font-bold uppercase tracking-widest py-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
          >
            {isSubmitting ? 'Submitting...' : 'Enter Giveaway'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Giveaway;