// ============================================
// src/hooks/useServiceRequests.ts - UPDATED
// ============================================
// Refactored to use serviceRequestsService for DB ops.
// Added real-time subscription via service. Uses TanStack Query for caching/mutations.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getServiceRequests, createServiceRequest, updateServiceRequestStatus, subscribeToUserRequests } from '../services/serviceRequestsService';
import type { ServiceRequest } from '../types';
import { useEffect } from 'react';

interface UseServiceRequestsProps {
  userId?: string;
  asProvider?: boolean;
  offeringId?: string;
}

export function useServiceRequests({ userId, asProvider = false, offeringId }: UseServiceRequestsProps) {
  const queryClient = useQueryClient();

  // Fetch requests via service
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['serviceRequests', { userId, asProvider, offeringId }],
    queryFn: () => getServiceRequests(userId!, asProvider, offeringId),
    enabled: !!userId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToUserRequests(userId, asProvider, (updatedRequests) => {
      queryClient.setQueryData(['serviceRequests', { userId, asProvider, offeringId }], updatedRequests);
    });
    return unsubscribe;
  }, [userId, asProvider, offeringId, queryClient]);

  // Create mutation
  const createRequestMutation = useMutation({
    mutationFn: (newRequest: Omit<ServiceRequest, 'id' | 'created_at' | 'updated_at'>) => createServiceRequest(newRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: ServiceRequest['status'] }) => updateServiceRequestStatus(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
    },
  });

  return {
    requests: requests || [],
    isLoading,
    error,
    createRequest: createRequestMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    isCreating: createRequestMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
  };
}