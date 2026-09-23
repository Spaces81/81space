import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function AskQuestion() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Nếu chưa đăng nhập, yêu cầu đăng nhập
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center mt-16 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Bạn cần đăng nhập</h2>
        <p className="text-gray-600 mb-6">Vui lòng đăng nhập để có thể đặt câu hỏi trên FUEDU.</p>
        <button 
          onClick={() => navigate('/login')} 
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 font-medium"
        >
          Đi tới Đăng nhập
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('questions')
        .insert([
          { 
            user_id: user.id, 
            title: title.trim(), 
            content: content.trim() 
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Thành công, chuyển về trang chủ (Sau này sẽ chuyển tới trang chi tiết /questions/:id)
      navigate('/');
      
    } catch (err) {
      console.error(err);
      setError('Không thể tạo câu hỏi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Đặt câu hỏi mới</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 border border-red-100">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tiêu đề câu hỏi
          </label>
          <input 
            type="text" 
            required 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="VD: Giải thích vòng lặp for trong C cho người mới học"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nội dung chi tiết
          </label>
          <textarea 
            required 
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 h-64"
            placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
          >
            Hủy
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Đang đăng bài...' : 'Đăng câu hỏi'}
          </button>
        </div>
      </form>
    </div>
  );
}
