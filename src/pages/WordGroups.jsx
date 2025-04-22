import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";

export default function WordGroups() {
  const [wordGroups, setWordGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
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

  const handleGenerateGroup = async () => {
    try {
      setGenerating(true);
      const freshToken = await getAccessToken();

      const response = await fetch(
        "http://localhost:3000/api/word-groups/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${freshToken}`,
          },
          body: JSON.stringify({
            excludedTopics: wordGroups.map((group) => group.name),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Add the new group to the list
        setWordGroups([...wordGroups, result.data.group]);
      } else {
        throw new Error(result.message || "Failed to generate word group");
      }
    } catch (err) {
      setError("Không thể tạo nhóm từ AI. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Layout title="Quản lý nhóm từ">
      <div className="mb-4 flex justify-between">
        <div>
          <button
            onClick={handleGenerateGroup}
            disabled={generating}
            className={`rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mr-2 ${
              generating ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {generating ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang tạo...
              </span>
            ) : (
              "Tạo nhóm từ AI"
            )}
          </button>
        </div>
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
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {wordGroups.map((group) => {
                return (
                  <tr key={group.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {group.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <Link
                        to={`/word-groups/${group.id}`}
                        className="mr-2 text-blue-600 hover:text-blue-900"
                      >
                        Xem
                      </Link>
                      <Link
                        to={`/word-groups/edit/${
                          group.id
                        }?name=${encodeURIComponent(group.name)}`}
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
