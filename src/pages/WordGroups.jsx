import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";

export default function WordGroups() {
  const [wordGroups, setWordGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, getAccessToken } = useAuth();

  useEffect(() => {
    const fetchWordGroups = async () => {
      try {
        setLoading(true);

        const freshToken = await getAccessToken();

        const response = await fetch("http://localhost:3000/api/word-groups", {
          headers: {
            Authorization: `Bearer ${freshToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setWordGroups(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch word groups");
        }

        setLoading(false);
      } catch (err) {
        setError("Không thể tải danh sách nhóm từ. Vui lòng thử lại sau.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchWordGroups();
  }, [currentUser, getAccessToken]);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhóm từ này?")) {
      try {
        const freshToken = await getAccessToken();

        const response = await fetch(
          `http://localhost:3000/api/word-groups/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${freshToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }

        setWordGroups(wordGroups.filter((group) => group.id !== id));
      } catch (err) {
        setError("Không thể xóa nhóm từ. Vui lòng thử lại sau.");
        console.error(err);
      }
    }
  };

  const calculateProgress = (group) => {
    if (!group || group.totalWords === 0) return 0;
    return Math.round((group.learnedWords / group.totalWords) * 100);
  };

  return (
    <Layout title="Quản lý nhóm từ">
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Danh sách nhóm từ</h1>
        <Link
          to="/word-groups/add"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Thêm nhóm từ mới
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>
      )}

      {loading ? (
        <LoadingSpinner size="large" text="Đang tải danh sách nhóm từ..." />
      ) : wordGroups.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-center text-gray-500">
            Bạn chưa có nhóm từ nào. Hãy tạo nhóm từ đầu tiên!
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Tên nhóm từ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Mô tả
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Tiến độ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {wordGroups.map((group) => {
                const progressPercentage = calculateProgress(group);
                return (
                  <tr key={group.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {group.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-500 line-clamp-2">
                        {group.description}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="w-full h-2.5 bg-gray-200 rounded-full">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {progressPercentage}% ({group.learnedWords || 0}/
                        {group.totalWords || 0})
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <Link
                        to={`/word-groups/${group.id}`}
                        className="mr-2 text-blue-600 hover:text-blue-900"
                      >
                        Xem
                      </Link>
                      <Link
                        to={`/word-groups/edit/${group.id}`}
                        className="mr-2 text-indigo-600 hover:text-indigo-900"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(group.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
