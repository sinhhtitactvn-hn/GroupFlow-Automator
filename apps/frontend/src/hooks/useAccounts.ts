// apps/frontend/src/hooks/useAccounts.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:3001/accounts';

export const useAccounts = () => {
  const queryClient = useQueryClient();

  // 1. Lấy danh sách
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => (await axios.get(API_URL)).data,
  });

  // 2. Mutation Thêm mới
  const upsertMutation = useMutation({
    mutationFn: async (payload: any) => axios.post(API_URL, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });

  // 3. Mutation Cập nhật (Sửa)
  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => 
      axios.patch(`${API_URL}/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });

  // 4. Mutation Kiểm tra ngay (Trigger check)
  const checkAccountMutation = useMutation({
    mutationFn: async (id: string) => axios.post(`${API_URL}/${id}/check`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });

  // 5. Mutation Xóa
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => axios.delete(`${API_URL}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });

  return { 
    accounts, 
    isLoading, 
    upsertAccount: upsertMutation.mutate, 
    updateAccount: updateAccountMutation.mutate,
    deleteAccount: deleteMutation.mutate,
    checkAccount: checkAccountMutation.mutate // ĐẢM BẢO CÓ DÒNG NÀY
  };
};