import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:3001/comment-campaigns';

export const useCommentCampaigns = () => {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['comment-campaigns'],
    queryFn: async () => (await axios.get(API_URL)).data,
  });

  const createCampaign = useMutation({
    mutationFn: (payload: any) => axios.post(API_URL, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comment-campaigns'] }),
  });

  const deleteCampaign = useMutation({
    mutationFn: (id: string) => axios.delete(`${API_URL}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comment-campaigns'] }),
  });

  return { campaigns, isLoading, createCampaign: createCampaign.mutate, deleteCampaign: deleteCampaign.mutate };
};