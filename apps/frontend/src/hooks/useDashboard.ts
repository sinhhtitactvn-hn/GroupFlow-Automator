import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useDashboard = () => {
  // Lấy thống kê - Refresh mỗi 10 giây
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => (await axios.get('http://localhost:3001/stats')).data,
    refetchInterval: 10000, 
  });

  // Lấy Logs - Refresh mỗi 5 giây
  const { data: logs = [] } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => (await axios.get('http://localhost:3001/logs')).data,
    refetchInterval: 5000, 
  });

  return { stats, logs };
};