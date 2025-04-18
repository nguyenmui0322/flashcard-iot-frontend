import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";
import ButtonWithLoading from "../components/ButtonWithLoading";

export default function AddEditWordGroup() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!groupId;
  const { getAccessToken } = useAuth();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch word group data if in edit mode
    if (isEditMode) {
      const fetchWordGroup = async () => {
        try {
          setLoading(true);
          // This would be your actual API call
          // const response = await fetch(`your-api-url/word-groups/${groupId}`);
          // const data = await response.json();

          // Simulated data for now
          const sampleData = {
            id: parseInt(groupId),
            name:
              groupId === "1"
                ? "Cơ bản"
                : groupId === "2"
                ? "Từ vựng công nghệ"
                : groupId === "3"
                ? "Từ vựng kinh doanh"
                : "Từ vựng giao tiếp",
            progress:
              groupId === "1"
                ? 25
                : groupId === "2"
                ? 50
                : groupId === "3"
                ? 75
                : 10,
          };

          // Simulate network delay
          setTimeout(() => {
            setName(sampleData.name);
            setLoading(false);
          }, 500);
        } catch (err) {
          setError("Không thể tải thông tin nhóm từ. Vui lòng thử lại sau.");
          setLoading(false);
          console.error(err);
        }
      };

      fetchWordGroup();
    }
  }, [groupId, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Vui lòng nhập tên nhóm từ");
      return;
    }

    try {
      setLoading(true);

      // Get a fresh token
      const freshToken = await getAccessToken();

      if (isEditMode) {
        // await fetch(`your-api-url/word-groups/${groupId}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ name }),
        // });
      } else {
        // Gửi POST request đến API khi tạo mới
        const response = await fetch("http://localhost:3000/api/word-groups", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${freshToken}`,
          },
          body: JSON.stringify({
            name,
          }),
        });

        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to create word group");
        }
      }

      setLoading(false);
      navigate("/word-groups");
    } catch (err) {
      setError(
        isEditMode
          ? "Không thể cập nhật nhóm từ."
          : "Không thể tạo nhóm từ mới."
      );
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <Layout title={isEditMode ? "Chỉnh sửa nhóm từ" : "Thêm nhóm từ mới"}>
      <div className="max-w-lg mx-auto">
        <div className="rounded-lg bg-white p-8 shadow">
          {error && (
            <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          {loading && !isEditMode ? (
            <LoadingSpinner text="Đang tải thông tin nhóm từ..." />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="mb-2 block text-sm font-medium text-gray-700"
                  htmlFor="name"
                >
                  Tên nhóm từ
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên nhóm từ"
                  required
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate("/word-groups")}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <ButtonWithLoading
                  loading={loading}
                  loadingText="Đang xử lý..."
                >
                  {isEditMode ? "Cập nhật" : "Tạo mới"}
                </ButtonWithLoading>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
