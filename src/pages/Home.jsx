import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Home() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  console.log("🚀 ~ Home ~ currentUser:", currentUser);
  const navigate = useNavigate();

  async function handleLogout() {
    setError("");

    try {
      await logout();
      navigate("/login");
    } catch {
      setError("Không thể đăng xuất");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-800">
                <Link to="/">Flashcard IoT</Link>
              </span>
              <div className="ml-10 space-x-4">
                <Link to="/" className="text-gray-700 hover:text-gray-900">
                  Trang chủ
                </Link>
                <Link
                  to="/word-groups"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Nhóm từ
                </Link>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Tiến độ
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-700">
                {currentUser.displayName}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow">
          {error && (
            <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          <h1 className="mb-6 text-3xl font-bold text-gray-800">
            Chào mừng đến với Flashcard IoT
          </h1>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Quản lý nhóm từ
              </h2>
              <p className="mb-4 text-gray-600">
                Tạo và quản lý các nhóm từ vựng của bạn
              </p>
              <Link
                to="/word-groups"
                className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Xem nhóm từ
              </Link>
            </div>

            <div className="rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Theo dõi tiến độ
              </h2>
              <p className="mb-4 text-gray-600">
                Xem tiến độ học tập và từ vựng đã học
              </p>
              <Link
                to="/dashboard"
                className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Xem tiến độ
              </Link>
            </div>

            <div className="rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Thông tin tài khoản
              </h2>
              <div className="space-y-2">
                <div>
                  <strong>Email:</strong> {currentUser.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
