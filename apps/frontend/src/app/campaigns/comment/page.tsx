'use client';
import { useState } from 'react';
import { useCommentCampaigns } from '@/hooks/useCommentCampaigns';

export default function CommentCampaignPage() {
  const { campaigns, createCampaign, deleteCampaign } = useCommentCampaigns();
  
  // 1. Khởi tạo State kèm theo accountCount (mặc định là 1)
  const [form, setForm] = useState({ 
    groupIds: '', 
    keywords: '', 
    postIds: '', 
    commentText: '',
    accountCount: 1 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra dữ liệu đầu vào cơ bản
    if (!form.groupIds || !form.commentText) {
        return alert("Vui lòng nhập UID Group và nội dung comment!");
    }

    createCampaign(form, { 
        onSuccess: () => {
            alert("🚀 Chiến dịch Auto-Comment đã được kích hoạt!");
            // Reset form về mặc định
            setForm({ groupIds: '', keywords: '', postIds: '', commentText: '', accountCount: 1 });
        } 
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-gray-800">
      {/* CỘT TRÁI: CẤU HÌNH CHIẾN DỊCH */}
      <div className="bg-white p-6 rounded-xl shadow-sm border h-fit space-y-6">
        <h2 className="text-xl font-bold border-b pb-2 text-green-600">🛡️ Cấu hình Auto-Comment</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Danh sách UID Groups</label>
            <input 
              placeholder="Cách nhau bởi dấu phẩy..." 
              className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all" 
              value={form.groupIds} 
              onChange={e => setForm({...form, groupIds: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Từ khóa (Keywords)</label>
            <input 
              placeholder="VD: giá, tư vấn, mua..." 
              className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all" 
              value={form.keywords} 
              onChange={e => setForm({...form, keywords: e.target.value})} 
            />
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Hoặc Quét theo ID</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Danh sách Post IDs (Nếu có)</label>
            <input 
              placeholder="Nhập các ID bài viết cụ thể..." 
              className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all" 
              value={form.postIds} 
              onChange={e => setForm({...form, postIds: e.target.value})} 
            />
          </div>

          {/* 2. UI CHỌN CHẾ ĐỘ TÀI KHOẢN (GIỐNG TRANG POST) */}
          <div className="p-4 bg-green-50 border border-green-100 rounded-lg space-y-3">
            <label className="block text-sm font-bold text-green-800 uppercase">Số lượng tài khoản tham gia</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={form.accountCount === 1}
                  onChange={() => setForm({...form, accountCount: 1})}
                  className="accent-green-600"
                />
                <span className="text-sm font-medium">1 Acc ngẫu nhiên</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio"
                  checked={form.accountCount > 1}
                  onChange={() => setForm({...form, accountCount: 2})}
                  className="accent-green-600"
                />
                <span className="text-sm font-medium">Nhiều tài khoản</span>
              </label>
            </div>

            {form.accountCount > 1 && (
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-xs text-green-700">Chọn số lượng:</span>
                <input 
                  type="number" 
                  min="2" 
                  max="50"
                  className="w-20 p-1.5 border border-green-200 rounded text-center text-sm font-bold"
                  value={form.accountCount}
                  onChange={(e) => setForm({...form, accountCount: parseInt(e.target.value) || 2})}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nội dung (Spintax)</label>
            <textarea 
              placeholder="{Chào|Hi} bạn, check inbox nhé!" 
              className="w-full p-2.5 bg-gray-50 border rounded-lg h-24 focus:ring-2 focus:ring-green-500 outline-none transition-all" 
              value={form.commentText} 
              onChange={e => setForm({...form, commentText: e.target.value})} 
            />
          </div>

          <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-md transition-transform active:scale-95">
            🚀 Bắt đầu quét & Comment
          </button>
        </form>
      </div>

      {/* CỘT PHẢI: DANH SÁCH CHIẾN DỊCH */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold mb-4 flex items-center">
            Chiến dịch đang chạy 
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">{campaigns.length}</span>
        </h2>
        
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {campaigns.length === 0 && <p className="text-gray-400 text-center py-10 italic">Chưa có mục tiêu nào.</p>}
          
          {campaigns.map((cp: any) => (
            <div key={cp.id} className="p-4 border border-gray-100 rounded-xl relative group hover:border-green-200 transition-all">
              <span className="absolute top-3 right-3 bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
              
              <p className="text-sm font-bold text-gray-700 line-clamp-1 pr-10">💬 {cp.commentText}</p>
              
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center text-[11px] text-gray-500">
                    <span className="w-16 font-bold uppercase text-[9px] text-gray-400">Nhóm:</span>
                    <span className="truncate">{cp.groupIds}</span>
                </div>
                <div className="flex items-center text-[11px] text-gray-500">
                    <span className="w-16 font-bold uppercase text-[9px] text-gray-400">Từ khóa:</span>
                    <span className="text-blue-600">{cp.keywords || 'N/A'}</span>
                </div>
                {/* 3. Hiển thị số lượng tài khoản đang tham gia seeding */}
                <div className="flex items-center mt-2">
                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        🤖 {cp.accountCount} tài khoản tham gia
                    </span>
                </div>
              </div>

              <button 
                onClick={() => confirm('Bạn muốn dừng chiến dịch này?') && deleteCampaign(cp.id)} 
                className="mt-4 text-red-500 text-[11px] font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
              >
                停止 Dừng & Xóa mục tiêu
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}