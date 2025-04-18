import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function WordGroups() {
  const [wordGroups, setWordGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call to get word groups
    const fetchWordGroups = async () => {
      try {
        setLoading(true);
        // This would be your actual API call
        // const response = await fetch('your-api-url/word-groups');
        // const data = await response.json();

        // Simulated data for now
        const sampleData = [
          { id: 1, name: "Cơ bản", progress: 25 },
          { id: 2, name: "Từ vựng công nghệ", progress: 50 },
          { id: 3, name: "Từ vựng kinh doanh", progress: 75 },
          { id: 4, name: "Từ vựng giao tiếp", progress: 10 },
        ];

        // Simulate network delay
        setTimeout(() => {
          setWordGroups(sampleData);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError("Không thể tải danh sách nhóm từ. Vui lòng thử lại sau.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchWordGroups();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhóm từ này?")) {
      try {
        // This would be your actual API call
        // await fetch(`your-api-url/word-groups/${id}`, {
        //   method: 'DELETE'
        // });

        // Update local state
        setWordGroups(wordGroups.filter((group) => group.id !== id));
      } catch (err) {
        setError("Không thể xóa nhóm từ. Vui lòng thử lại sau.");
        console.error(err);
      }
    }
  };

  return (
    <Layout title="Quản lý nhóm từ">
      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>
      )}

      <div className="mb-6 flex justify-between">
        <div>
          <Link
            to="/word-groups/add"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Thêm nhóm từ mới
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex h-24 items-center justify-center">
          <p>Đang tải dữ liệu...</p>
        </div>
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
              {wordGroups.map((group) => (
                <tr key={group.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {group.name}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${group.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {group.progress}%
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
