import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      // Gọi API lên bảng questions, đồng thời join với bảng profiles để lấy tên người hỏi
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          profiles (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setQuestions(data);
      } else {
        console.error("Lỗi khi tải câu hỏi:", error);
      }
      setLoading(false);
    };
    
    fetchQuestions();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Câu hỏi mới nhất</h2>
        <Link to="/ask" className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition">
          Đặt câu hỏi
        </Link>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {/* Skeleton loading */}
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 mb-4 text-lg">Chưa có câu hỏi nào.</p>
          <Link to="/ask" className="text-primary-600 font-medium hover:underline text-lg">
            Hãy là người đầu tiên đặt câu hỏi!
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map(q => (
            <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-primary-300 transition">
              <Link to={`/questions/${q.id}`} className="text-xl font-semibold text-primary-700 hover:underline">
                {q.title}
              </Link>
              <p className="text-gray-600 mt-2 line-clamp-2">{q.content}</p>
              
              <div className="flex items-center text-sm text-gray-500 mt-4 space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {q.profiles?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span>{q.profiles?.full_name || 'Người dùng'}</span>
                </div>
                <span>👀 {q.views} lượt xem</span>
                <span>🕒 {new Date(q.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
