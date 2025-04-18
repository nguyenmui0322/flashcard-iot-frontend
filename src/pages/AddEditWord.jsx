import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import ButtonWithLoading from "../components/ButtonWithLoading";
import { useAuth } from "../context/useAuth";
import { useLocation } from "react-router-dom";

export default function AddEditWord() {
  const { groupId, wordId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!wordId;
  const { getAccessToken } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [formData, setFormData] = useState({
    word: queryParams.get("word") || "",
    meaning: queryParams.get("meaning") || "",
    type: queryParams.get("type") || "Khác",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.word.trim() || !formData.meaning.trim()) {
      setError("Vui lòng nhập đầy đủ từ và nghĩa");
      return;
    }

    try {
      setLoading(true);

      const freshToken = await getAccessToken();

      if (isEditMode) {
        await fetch(`http://localhost:3000/api/words/${wordId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${freshToken}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch(`http://localhost:3000/api/word-groups/${groupId}/words`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${freshToken}`,
          },
          body: JSON.stringify({ ...formData }),
        });
      }
      navigate(`/word-groups/${groupId}`);
    } catch (err) {
      setError(
        isEditMode
          ? "Không thể cập nhật từ vựng."
          : "Không thể thêm từ vựng mới."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={isEditMode ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới"}>
      <div className="max-w-lg mx-auto">
        <div className="rounded-lg bg-white p-8 shadow">
          {error && (
            <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          {loading && isEditMode ? (
            <LoadingSpinner
              text={
                !isEditMode
                  ? "Đang tải thông tin từ vựng..."
                  : "Đang cập nhật thông tin từ vựng..."
              }
            />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="mb-2 block text-sm font-medium text-gray-700"
                  htmlFor="word"
                >
                  Từ
                </label>
                <input
                  id="word"
                  name="word"
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  value={formData.word}
                  onChange={handleChange}
                  placeholder="Nhập từ"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="mb-2 block text-sm font-medium text-gray-700"
                  htmlFor="meaning"
                >
                  Nghĩa
                </label>
                <input
                  id="meaning"
                  name="meaning"
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  value={formData.meaning}
                  onChange={handleChange}
                  placeholder="Nhập nghĩa"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="mb-2 block text-sm font-medium text-gray-700"
                  htmlFor="type"
                >
                  Loại từ
                </label>
                <select
                  id="type"
                  name="type"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="Danh từ">Danh từ</option>
                  <option value="Danh từ">Đại từ</option>
                  <option value="Động từ">Động từ</option>
                  <option value="Tính từ">Tính từ</option>
                  <option value="Trạng từ">Trạng từ</option>
                  <option value="Trạng từ">Giới từ</option>
                  <option value="Trạng từ">Liên từ</option>
                  <option value="Trạng từ">Thán từ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(`/word-groups/${groupId}`)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <ButtonWithLoading loading={loading}>
                  {isEditMode ? "Cập nhật" : "Thêm mới"}
                </ButtonWithLoading>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
