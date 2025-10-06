// ============================================
// src/components/Marketplace/ServiceCard.tsx - UPDATED
// ============================================
// Minor updates: Added ARIA labels, disabled state handling, and integration with updated modal.
// No direct Supabase changes.

import { useState } from 'react';
import { ServiceOffering, User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import RequestServiceModal from './RequestServiceModal';

interface ServiceCardProps {
  offering: ServiceOffering & { provider: Pick<User, 'username' | 'avatar_url' | 'location' | 'rating'> };
  onRequest?: () => void;
}

export default function ServiceCard({ offering, onRequest }: ServiceCardProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequested, setIsRequested] = useState(false);

  const handleRequestClick = () => {
    if (!user) {
      alert('Please log in to request a service.');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{offering.title}</h3>
            <p className="text-gray-600 mb-3 line-clamp-2">{offering.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Duration: {offering.expected_hours}h</span>
              <span>Price: {offering.price_in_hours}h credits</span>
            </div>
            <div className="flex items-center gap-2 mb-4" aria-label={`Provider rating: ${offering.provider.rating} stars`}>
              <span className="text-yellow-500">★ {offering.provider.rating}</span>
              <span className="text-gray-400">•</span>
              <span>{offering.provider.location || 'Remote'}</span>
            </div>
          </div>
          <img
            src={offering.provider.avatar_url || '/default-avatar.png'}
            alt={`${offering.provider.username}'s avatar`}
            className="w-12 h-12 rounded-full ml-4"
          />
        </div>
        <button
          onClick={handleRequestClick}
          disabled={isRequested || offering.status !== 'active' || !user}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isRequested || offering.status !== 'active' || !user
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          aria-label={user ? `Request ${offering.title} from ${offering.provider.username}` : 'Log in to request service'}
        >
          {isRequested ? 'Requested' : offering.status === 'active' ? 'Request Service' : 'Unavailable'}
        </button>
      </div>
      <RequestServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        offering={offering}
        onSuccess={() => {
          setIsRequested(true);
          onRequest?.();
        }}
      />
    </div>
  );
}