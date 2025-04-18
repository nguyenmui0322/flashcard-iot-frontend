import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function AddEditWord() {
  const { groupId, wordId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!wordId;

  const [formData, setFormData] = useState({
    word: "",
    meaning: "",
    type: "Danh từ",
    timeout: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch word data if in edit mode
    if (isEditMode) {
      const fetchWord = async () => {
        try {
          setLoading(true);
          // This would be your actual API call
          // const response = await fetch(`your-api-url/words/${wordId}`);
          // const data = await response.json();

          // Simulated data for now
          const sampleData = {
            id: parseInt(wordId),
            word:
              wordId === "1"
                ? "Hello"
                : wordId === "2"
                ? "Goodbye"
                : wordId === "3"
                ? "Computer"
                : "Software",
            meaning:
              wordId === "1"
                ? "Xin chào"
                : wordId === "2"
                ? "Tạm biệt"
                : wordId === "3"
                ? "Máy tính"
                : "Phần mềm",
            type: "Danh từ",
            timeout: wordId === "2" || wordId === "5",
          };

          // Simulate network delay
          setTimeout(() => {
            setFormData(sampleData);
            setLoading(false);
          }, 500);
        } catch (err) {
          setError("Không thể tải thông tin từ vựng. Vui lòng thử lại sau.");
          setLoading(false);
          console.error(err);
        }
      };

      fetchWord();
    }
  }, [wordId, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
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

      // This would be your actual API call
      if (isEditMode) {
        // await fetch(`your-api-url/words/${wordId}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(formData),
        // });
      } else {
        // await fetch(`your-api-url/word-groups/${groupId}/words`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ ...formData, groupId }),
        // });
      }

      // Simulate network delay
      setTimeout(() => {
        setLoading(false);
        navigate(`/word-groups/${groupId}`);
      }, 500);
    } catch (err) {
      setError(
        isEditMode
          ? "Không thể cập nhật từ vựng."
          : "Không thể thêm từ vựng mới."
      );
      setLoading(false);
      console.error(err);
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
            <div className="flex h-24 items-center justify-center">
              <p>Đang tải dữ liệu...</p>
            </div>
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
                  <option value="Động từ">Động từ</option>
                  <option value="Tính từ">Tính từ</option>
                  <option value="Trạng từ">Trạng từ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    id="timeout"
                    name="timeout"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.timeout}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="timeout"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Timeout
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(`/word-groups/${groupId}`)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {loading
                    ? "Đang xử lý..."
                    : isEditMode
                    ? "Cập nhật"
                    : "Thêm mới"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
