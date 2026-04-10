'use client';
import { useState } from 'react';
import { useAccounts } from '@/hooks/useAccounts';

export default function AccountsPage() {
  const { accounts, isLoading, upsertAccount, deleteAccount, checkAccount } = useAccounts();
  const [formData, setFormData] = useState({ cookie: '', token: '', proxy: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cookie) return alert('Vui lòng nhập Cookie');
    
    upsertAccount(formData, {
      onSuccess: () => setFormData({ cookie: '', token: '', proxy: '' })
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Quản lý tài khoản Facebook</h1>

      {/* Form thêm tài khoản */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="border p-2 rounded w-full"
            placeholder="Dán Cookie vào đây..."
            value={formData.cookie}
            onChange={(e) => setFormData({...formData, cookie: e.target.value})}
          />
          <input
            className="border p-2 rounded"
            placeholder="Token (Tùy chọn)"
            value={formData.token}
            onChange={(e) => setFormData({...formData, token: e.target.value})}
          />
          <input
            className="border p-2 rounded"
            placeholder="Proxy (IP:PORT...)"
            value={formData.proxy}
            onChange={(e) => setFormData({...formData, proxy: e.target.value})}
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Thêm tài khoản
        </button>
      </form>

      {/* Danh sách tài khoản */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">UID</th>
              <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
              <th className="p-4 font-semibold text-gray-600">Proxy</th>
              <th className="p-4 font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={4} className="p-4 text-center">Đang tải...</td></tr> : null}
            {accounts.map((acc: any) => (
              <tr key={acc.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4 font-mono text-sm">{acc.uid}</td>
                <td className="p-4">
                   <span className={`px-2 py-1 rounded text-xs ${acc.status === 'LIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {acc.status}
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-sm truncate max-w-[150px]">{acc.cookie}</td>
                <td className="p-4 flex space-x-3">
                  <button 
                    onClick={() => checkAccount(acc.id)} // Bây giờ nó sẽ không còn báo undefined
                    className="text-green-500 font-medium hover:underline"
                  >
                    Kiểm tra
                  </button>

                  <button 
                    onClick={() => alert(`UID: ${acc.uid}\nCookie: ${acc.cookie}`)}
                    className="text-blue-500 font-medium hover:underline"
                  >
                    Xem
                  </button>

                  <button 
                    onClick={() => {
                      const newProxy = prompt('Nhập Proxy mới:', acc.proxy || '');
                      if (newProxy !== null) updateAccount({ id: acc.id, data: { proxy: newProxy } });
                    }}
                    className="text-orange-500 font-medium hover:underline"
                  >
                    Sửa Proxy
                  </button>

                  <button 
                    onClick={() => confirm('Xóa tài khoản này?') && deleteAccount(acc.id)}
                    className="text-red-500 font-medium hover:underline"
                  >
                    Xóa
                  </button>
               </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}