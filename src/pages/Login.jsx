import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Email hoặc mật khẩu không chính xác.');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Đăng nhập FUEDU</h2>
        <p className="text-gray-600 mt-2">Chào mừng bạn quay trở lại</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-primary-500 focus:ring-primary-500 outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-primary-500 focus:ring-primary-500 outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
