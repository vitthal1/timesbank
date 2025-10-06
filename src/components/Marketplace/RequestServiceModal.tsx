// ============================================
// src/components/Marketplace/RequestServiceModal.tsx - UPDATED
// ============================================
// Uses updated useServiceRequests hook (now service-backed). Added validation and error display.

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useServiceRequests } from '../../hooks/useServiceRequests';
import type { ServiceOffering, ServiceRequest } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface RequestServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  offering: ServiceOffering;
  onSuccess?: () => void;
}

export default function RequestServiceModal({ isOpen, onClose, offering, onSuccess }: RequestServiceModalProps) {
  const { user } = useAuth();
  const { createRequest, isCreating } = useServiceRequests({ userId: user?.id });
  const [notes, setNotes] = useState('');
  const [requestedHours, setRequestedHours] = useState(offering.expected_hours);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (requestedHours <= 0) {
      setError('Requested hours must be greater than 0.');
      return;
    }
    setError(null);

    try {
      await createRequest({
        service_offering_id: offering.id,
        requester_user_id: user.id,
        requested_hours: requestedHours,
        notes,
        status: 'pending',
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError('Failed to submit request: ' + (err as Error).message);
    }
  };

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl align-middle">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Request {offering.title}
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <div>
                    <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
                      Requested Hours
                    </label>
                    <input
                      id="hours"
                      type="number"
                      value={requestedHours}
                      onChange={(e) => setRequestedHours(parseFloat(e.target.value) || 0)}
                      min={0.5}
                      step={0.5}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes (optional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      disabled={isCreating}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      disabled={isCreating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      disabled={isCreating}
                    >
                      {isCreating ? 'Submitting...' : 'Send Request'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}