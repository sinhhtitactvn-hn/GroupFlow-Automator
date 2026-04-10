import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:3001/campaigns';

export const useCampaigns = () => {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => (await axios.get(API_URL)).data,
  });

  const createCampaign = useMutation({
    mutationFn: (formData: FormData) => 
      axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  const deleteCampaign = useMutation({
    mutationFn: (id: string) => axios.delete(`${API_URL}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  return { campaigns, isLoading, createCampaign: createCampaign.mutate, deleteCampaign: deleteCampaign.mutate };
};