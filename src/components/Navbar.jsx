import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            FUEDU
          </Link>
          <nav className="hidden md:flex space-x-4">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium">Trang chủ</Link>
            <Link to="/questions" className="text-gray-700 hover:text-primary-600 font-medium">Câu hỏi</Link>
            <Link to="/ai" className="text-gray-700 hover:text-primary-600 font-medium">AI Assistant</Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/ask" className="hidden md:inline-flex bg-primary-100 text-primary-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-200">
                Đặt câu hỏi
              </Link>
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block font-medium">{profile?.name || 'Người dùng'}</span>
                </button>
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <Link to={`/profile/${user.id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Hồ sơ cá nhân
                  </Link>
                  <button onClick={signOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    Đăng xuất
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium px-3 py-2">
                Đăng nhập
              </Link>
              <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
