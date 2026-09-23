import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function QuestionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestionAndAnswers();
  }, [id]);

  const fetchQuestionAndAnswers = async () => {
    // 1. Lấy chi tiết câu hỏi
    const { data: qData } = await supabase
      .from('questions')
      .select(`*, profiles(name, avatar_url)`)
      .eq('id', id)
      .single();
    
    if (qData) {
      setQuestion(qData);
    }

    // 2. Lấy danh sách câu trả lời
    const { data: aData } = await supabase
      .from('answers')
      .select(`*, profiles(name, avatar_url)`)
      .eq('question_id', id)
      .order('created_at', { ascending: true });
    
    if (aData) {
      setAnswers(aData);
    }
    setLoading(false);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    setSubmitting(true);

    const { error } = await supabase
      .from('answers')
      .insert([{ 
        question_id: id, 
        user_id: user.id, 
        content: newAnswer.trim() 
      }]);

    setSubmitting(false);
    if (!error) {
      setNewAnswer(''); // Xóa nội dung trong ô nhập sau khi gửi
      fetchQuestionAndAnswers(); // Cập nhật lại danh sách câu trả lời
    } else {
      alert('Đã có lỗi xảy ra khi đăng câu trả lời.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-lg border border-red-100">
        <p className="text-red-500 text-lg">Không tìm thấy câu hỏi hoặc câu hỏi đã bị xóa!</p>
        <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Khối hiển thị câu hỏi */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{question.title}</h1>
        <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
          {question.content}
        </div>
        
        <div className="mt-8 flex items-center text-sm text-gray-500 space-x-4 border-t border-gray-100 pt-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              {question.profiles?.name?.charAt(0) || 'U'}
            </div>
            <span className="font-medium text-gray-900">{question.profiles?.name || 'Người dùng'}</span>
          </div>
          <span>đã hỏi vào {new Date(question.created_at).toLocaleString('vi-VN')}</span>
          <span>• {question.views} lượt xem</span>
        </div>
      </div>

      {/* Khối hiển thị danh sách câu trả lời */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {answers.length} Câu trả lời
        </h3>
        
        {answers.length === 0 && (
          <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500 border border-dashed border-gray-300">
            Chưa có câu trả lời nào. Hãy là người đầu tiên giúp đỡ bạn ấy!
          </div>
        )}

        <div className="space-y-4">
          {answers.map(ans => (
            <div key={ans.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-gray-800 whitespace-pre-wrap">{ans.content}</div>
              <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-primary-700">{ans.profiles?.name}</span>
                </div>
                <span>{new Date(ans.created_at).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form nhập câu trả lời mới */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold mb-4">Câu trả lời của bạn</h3>
        {user ? (
          <form onSubmit={handleSubmitAnswer}>
            <textarea 
              required
              value={newAnswer}
              onChange={e => setNewAnswer(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:border-primary-500 focus:ring-primary-500 min-h-[120px] mb-4"
              placeholder="Giải thích chi tiết vấn đề để giúp đỡ cộng đồng..."
            />
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-primary-600 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 transition"
              >
                {submitting ? 'Đang gửi...' : 'Đăng câu trả lời'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
            <p className="text-gray-600">
              Vui lòng <Link to="/login" className="text-primary-600 font-medium hover:underline">đăng nhập</Link> để tham gia thảo luận.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
