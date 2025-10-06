// ============================================
// src/components/Dashboard/ServiceOfferingsManager.tsx - FIXED
// ============================================

import { useState, useEffect } from 'react';
import { ServiceOffering, UserSkill, ServiceRequest } from '../../types';
import { supabase } from '../../lib/supabaseClient'; // Direct import for skills query

import { useServiceRequests } from '../../hooks/useServiceRequests';
import { getUserServiceOfferings, createServiceOffering, updateServiceOffering, deleteServiceOffering, subscribeToUserOfferings } from '../../services/serviceOfferingsService';

interface ServiceOfferingsManagerProps {
  userId: string;
}

// Type for joined skills data (UserSkill + nested skills from Supabase join)
type JoinedUserSkill = UserSkill & { skills: { name: string } };

export default function ServiceOfferingsManager({ userId }: ServiceOfferingsManagerProps) {
  const [offerings, setOfferings] = useState<ServiceOffering[]>([]);
  const [skills, setSkills] = useState<JoinedUserSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceOffering>>({
    title: '',
    description: '',
    expected_hours: 1.00,
    price_in_hours: 1.00,
    status: 'active' as const,
  });

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        // Fixed destructuring: direct array for offerings, {data} for skills
        const [offeringsData, { data: skillsData }] = await Promise.all([
          getUserServiceOfferings(userId),
          supabase
            .from('user_skills')
            .select('*, skills(name)')
            .eq('user_id', userId)
            .eq('willing_to_teach', true),
        ]);
        setOfferings(offeringsData || []);
        setSkills(skillsData || []);
      } catch (err) {
        setError('Failed to load data: ' + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [userId]); // Removed supabase dep (stable import)

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = subscribeToUserOfferings(userId, setOfferings);
    return unsubscribe;
  }, [userId]);

  const { requests: incomingRequests, updateStatus, isUpdating } = useServiceRequests({ userId, asProvider: true });

  // Form handlers (optimistic)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Safe parsing for numeric fields
    const parsedValue = (name === 'expected_hours' || name === 'price_in_hours')
      ? (parseFloat(value) || 0)
      : value;
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || (formData.expected_hours && formData.expected_hours <= 0) || (formData.price_in_hours && formData.price_in_hours <= 0)) {
      setError('Please fill required fields with valid values.');
      return;
    }

    // Exclude user_id from object (passed separately to service); correct type cast
    const optimisticData = { ...formData } as Omit<ServiceOffering, 'id' | 'created_at' | 'updated_at' | 'user_id'>;
    let newOffering: ServiceOffering | null = null;

    try {
      if (editingId) {
        newOffering = await updateServiceOffering(editingId, formData);
        if (newOffering) {
          setOfferings(prev => prev.map(o => o.id === editingId ? newOffering! : o));
        }
      } else {
        newOffering = await createServiceOffering(optimisticData, userId);
        if (newOffering) {
          setOfferings(prev => [newOffering, ...prev]);
        }
      }
      resetForm();
      setError(null);
    } catch (err) {
      setError('Failed to save offering: ' + (err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offering?')) return;
    const success = await deleteServiceOffering(id);
    if (success) {
      setOfferings(prev => prev.filter(o => o.id !== id));
    } else {
      setError('Failed to delete offering.');
    }
  };

  const handleEdit = (offering: ServiceOffering) => {
    setEditingId(offering.id);
    setFormData(offering);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', expected_hours: 1.00, price_in_hours: 1.00, status: 'active' });
    setEditingId(null);
  };

  const handleStatusChange = async (requestId: string, newStatus: ServiceRequest['status']) => {
    if (!confirm(`Are you sure? This will ${newStatus === 'accepted' ? 'accept and charge credits' : 'reject'} the request.`)) return;
    try {
      await updateStatus({ requestId, status: newStatus });
      setError(null);
    } catch (err) {
      setError('Failed to update status: ' + (err as Error).message);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Offering' : 'Create New Service Offering'}</h3>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="title"
            placeholder="Service Title"
            value={formData.title || ''}
            onChange={handleInputChange}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
          <select name="skill_id" value={formData.skill_id || ''} onChange={handleInputChange} className="p-2 border rounded focus:ring-2 focus:ring-blue-500">
            <option value="">Select a Skill</option>
            {/* Fixed: Use typed JoinedUserSkill for skills access */}
            {skills.map(skill => <option key={skill.id} value={skill.skill_id}>{skill.skills?.name}</option>)}
          </select>
          <textarea name="description" placeholder="Description" value={formData.description || ''} onChange={handleInputChange} rows={3} className="p-2 border rounded focus:ring-2 focus:ring-blue-500 col-span-2" />
          <input type="number" name="expected_hours" placeholder="Expected Duration (hours)" value={formData.expected_hours || ''} onChange={handleInputChange} min={0.5} step={0.5} className="p-2 border rounded focus:ring-2 focus:ring-blue-500" required />
          <input type="number" name="price_in_hours" placeholder="Price in Time Credits (hours)" value={formData.price_in_hours || ''} onChange={handleInputChange} min={0.5} step={0.5} className="p-2 border rounded focus:ring-2 focus:ring-blue-500" required />
          <select name="status" value={formData.status || 'active'} onChange={handleInputChange} className="p-2 border rounded focus:ring-2 focus:ring-blue-500">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="booked">Booked</option>
          </select>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">{editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>}
        </div>
      </form>

      {/* Offerings List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-lg font-semibold p-4 border-b">My Service Offerings ({offerings.length})</h3>
        {offerings.length === 0 ? (
          <p className="p-4 text-gray-500">No offerings yet. Create one above!</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {offerings.map(offering => (
              <li key={offering.id} className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{offering.title}</h4>
                  <p className="text-sm text-gray-600">{offering.description?.substring(0, 100)}... | {offering.expected_hours}h | {offering.price_in_hours}h credits</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${offering.status === 'active' ? 'bg-green-100 text-green-800' : offering.status === 'booked' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {offering.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(offering)} className="text-blue-500 hover:text-blue-700" aria-label="Edit offering">Edit</button>
                  <button onClick={() => handleDelete(offering.id)} className="text-red-500 hover:text-red-700" aria-label="Delete offering">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Incoming Requests */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-lg font-semibold p-4 border-b">Incoming Requests ({incomingRequests.length})</h3>
        {incomingRequests.length === 0 ? (
          <p className="p-4 text-gray-500">No incoming requests yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {incomingRequests.map((req) => (
              <li key={req.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">Request for "{req.service_offerings.title}"</h4>
                    <p className="text-sm text-gray-600">From: {req.users.username} | Hours: {req.requested_hours} | {req.notes || 'No notes'}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleStatusChange(req.id, 'accepted')}
                        disabled={isUpdating}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(req.id, 'rejected')}
                        disabled={isUpdating}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}