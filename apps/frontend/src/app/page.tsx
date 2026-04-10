'use client';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { stats, logs } = useDashboard();

  return (
    <div className="space-y-6 text-gray-800">
      {/* 1. HÀNG THỐNG KÊ (CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Accs đang LIVE" value={stats?.liveAccs || 0} icon="🟢" color="text-green-600" />
        <StatCard title="Bài đã đăng" value={stats?.totalPosts || 0} icon="📝" color="text-blue-600" />
        <StatCard title="Comment thành công" value={stats?.totalComments || 0} icon="💬" color="text-indigo-600" />
        <StatCard title="Hành động lỗi" value={stats?.failedActions || 0} icon="⚠️" color="text-red-600" />
      </div>

      {/* 2. BẢNG LOGS THỜI GIAN THỰC */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-lg">Hoạt động gần đây</h3>
          <span className="text-xs text-gray-400 animate-pulse">● Đang cập nhật trực tiếp</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-gray-400 bg-gray-50">
                <th className="p-4">Thời gian</th>
                <th className="p-4">Tài khoản</th>
                <th className="p-4">Hành động</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
                  <td className="p-4 font-medium">{log.uid}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold">
                      {log.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-bold ${log.status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}`}>
                      {log.status === 'SUCCESS' ? '✓ THÀNH CÔNG' : '✗ THẤT BẠI'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 max-w-xs truncate">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase">{title}</p>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}