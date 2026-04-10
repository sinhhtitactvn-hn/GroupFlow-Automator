'use client';
import { useState, useEffect, useRef } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';

/**
 * STAFF ENGINEER LOGIC: Spintax Parser (Frontend Version)
 */
const parseSpintax = (text: string): string => {
  const spintaxRegex = /\{([^{}]+)\}/g;
  let result = text;
  let match;
  while ((match = spintaxRegex.exec(result)) !== null) {
    const options = match[1].split('|');
    const selected = options[Math.floor(Math.random() * options.length)].trim();
    result = result.replace(match[0], selected);
    spintaxRegex.lastIndex = 0;
  }
  return result;
};

export default function PostSchedulePage() {
  const { campaigns, createCampaign, deleteCampaign } = useCampaigns();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 1. Cập nhật State form: Thêm accountCount (mặc định là 1)
  const [form, setForm] = useState({ 
    content: '', 
    groupIds: '', 
    scheduledAt: '',
    accountCount: 1 
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [spintaxPreview, setSpintaxPreview] = useState('');

  useEffect(() => {
    if (form.content) {
      setSpintaxPreview(parseSpintax(form.content));
    } else {
      setSpintaxPreview('');
    }
  }, [form.content]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValidGroups = /^[0-9, ]+$/.test(form.groupIds);
    if (!isValidGroups) {
      return alert('Danh sách UID Group chỉ được chứa số và dấu phẩy!');
    }

    const formData = new FormData();
    formData.append('content', form.content);
    formData.append('groupIds', form.groupIds);
    
    // 2. Append accountCount vào FormData (Bắt buộc phải là string)
    formData.append('accountCount', form.accountCount.toString());

    if (form.scheduledAt) {
      formData.append('scheduledAt', form.scheduledAt);
    }

    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    createCampaign(formData, {
      onSuccess: () => {
        alert('🚀 Đã lên lịch chiến dịch thành công!');
        setForm({ content: '', groupIds: '', scheduledAt: '', accountCount: 1 });
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      onError: (err: any) => {
        alert('Lỗi: ' + (err.response?.data?.message || 'Không thể tạo chiến dịch'));
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-gray-800">
      <div className="bg-white p-6 rounded-xl shadow-sm border h-fit space-y-6">
        <div>
          <h2 className="text-xl font-bold">Lên lịch đăng bài</h2>
          <p className="text-sm text-gray-500">Cấu hình nội dung, media và số lượng tài khoản</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nội dung bài viết */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Nội dung bài viết</label>
            <textarea
              placeholder="Ví dụ: {Chào|Hi} anh em..."
              className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.content}
              onChange={(e) => setForm({...form, content: e.target.value})}
              required
            />
          </div>

          {/* Xem trước Spintax */}
          {spintaxPreview && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-amber-700 uppercase">Xem trước</span>
                <button type="button" onClick={() => setSpintaxPreview(parseSpintax(form.content))} className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-800 px-2 py-1 rounded">🎲 Thử lại</button>
              </div>
              <p className="text-sm text-gray-700 italic">"{spintaxPreview}"</p>
            </div>
          )}

          {/* Media */}
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg space-y-2">
            <label className="block text-xs font-bold text-indigo-700 uppercase">Đính kèm Media</label>
            <input 
              type="file" multiple accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange}
              className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-600 file:text-white cursor-pointer"
            />
          </div>

          {/* --- MỚI: CHỌN CHẾ ĐỘ TÀI KHOẢN --- */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
            <label className="block text-sm font-bold text-gray-700 uppercase">Chế độ tài khoản</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" name="acc_mode"
                  checked={form.accountCount === 1}
                  onChange={() => setForm({...form, accountCount: 1})}
                />
                <span className="text-sm">Ngẫu nhiên 1 Acc</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" name="acc_mode"
                  checked={form.accountCount > 1}
                  onChange={() => setForm({...form, accountCount: 2})} // Mặc định 2 khi chọn chế độ này
                />
                <span className="text-sm">Nhiều tài khoản</span>
              </label>
            </div>

            {form.accountCount > 1 && (
              <div className="flex items-center space-x-3 mt-2 animate-in fade-in slide-in-from-top-1">
                <span className="text-xs text-gray-500">Số lượng:</span>
                <input 
                  type="number" min="2" max="100"
                  className="w-20 p-2 border rounded-md text-center text-sm font-bold bg-white"
                  value={form.accountCount}
                  onChange={(e) => setForm({...form, accountCount: parseInt(e.target.value) || 2})}
                />
              </div>
            )}
          </div>

          {/* Group ID */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Danh sách UID Group</label>
            <input
              placeholder="18273645, 99283746..."
              className="w-full p-3 border rounded-lg outline-none"
              value={form.groupIds}
              onChange={(e) => setForm({...form, groupIds: e.target.value})}
              required
            />
          </div>

          {/* Thời gian */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Thời gian đăng bài</label>
            <input
              type="datetime-local"
              className="w-full p-3 border rounded-lg"
              value={form.scheduledAt}
              onChange={(e) => setForm({...form, scheduledAt: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-md">
            Xác nhận chiến dịch
          </button>
        </form>
      </div>

      {/* CỘT PHẢI: DANH SÁCH CHIẾN DỊCH */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold mb-6">Chiến dịch đã tạo</h2>
        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
          {campaigns.length === 0 && <div className="text-center py-10 text-gray-400">Chưa có chiến dịch nào.</div>}
          {campaigns.map((cp: any) => (
            <div key={cp.id} className="p-4 border border-gray-100 rounded-xl relative group shadow-sm bg-white">
              <span className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${cp.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : cp.status === 'RUNNING' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{cp.status}</span>
              <p className="font-semibold text-sm line-clamp-1 pr-24">{cp.content}</p>
              <div className="flex flex-wrap items-center mt-2 gap-3 text-[11px] text-gray-500">
                <span>📅 {new Date(cp.scheduledAt).toLocaleString('vi-VN')}</span>
                <span>👥 {cp.groupIds.split(',').length} nhóm</span>
                {/* 3. Hiển thị số lượng tài khoản trong danh sách */}
                <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">🤖 {cp.accountCount} Accs</span>
                {cp.mediaPaths && <span className="text-indigo-600 font-bold">🖼️ Media</span>}
              </div>
              <button onClick={() => confirm('Xóa?') && deleteCampaign(cp.id)} className="mt-2 text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">🗑️ Hủy bỏ</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}