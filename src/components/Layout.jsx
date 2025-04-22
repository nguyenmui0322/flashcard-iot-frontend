import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Layout({ children, title }) {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
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
              <Link to="/" className="text-xl font-semibold text-gray-800">
                Flashcard IoT
              </Link>
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
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        {title && (
          <h1 className="mb-6 text-3xl font-bold text-gray-800">{title}</h1>
        )}

        {children}
      </main>
    </div>
  );
}
