import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate
    if (formData.password.length < 8) {
      return setError('Mật khẩu phải có ít nhất 8 ký tự.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp.');
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Tùy thuộc vào cài đặt email confirmation, Supabase có thể tự động login hoặc cần verify email.
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-white p-8 border border-gray-200 rounded-lg shadow-sm text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Đăng ký thành công!</h2>
        <p className="text-gray-600">Đang chuyển hướng bạn về trang chủ...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h2>
        <p className="text-gray-600 mt-2">Tham gia cộng đồng FUEDU</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-primary-500 focus:ring-primary-500 outline-none"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-primary-500 focus:ring-primary-500 outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-primary-500 focus:ring-primary-500 outline-none"
            placeholder="Tối thiểu 8 ký tự"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
          <input
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-primary-500 focus:ring-primary-500 outline-none"
            placeholder="Nhập lại mật khẩu"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đăng ký'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
