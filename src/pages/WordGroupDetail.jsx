import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";

export default function WordGroupDetail() {
  const { groupId } = useParams();
  const { getAccessToken } = useAuth();

  const [wordGroup, setWordGroup] = useState(null);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [processingWordId, setProcessingWordId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const freshToken = await getAccessToken();

        const groupResponse = await fetch(
          `http://localhost:3000/api/word-groups/${groupId}`,
          {
            headers: {
              Authorization: `Bearer ${freshToken}`,
            },
          }
        );

        if (!groupResponse.ok) {
          throw new Error(
            `API call failed with status: ${groupResponse.status}`
          );
        }

        const groupResult = await groupResponse.json();

        if (!groupResult.success) {
          throw new Error(groupResult.message || "Failed to fetch word group");
        }

        const wordsResponse = await fetch(
          `http://localhost:3000/api/word-groups/${groupId}/words`,
          {
            headers: {
              Authorization: `Bearer ${freshToken}`,
            },
          }
        );

        if (!wordsResponse.ok) {
          throw new Error(
            `API call failed with status: ${wordsResponse.status}`
          );
        }

        const wordsResult = await wordsResponse.json();

        if (!wordsResult.success) {
          throw new Error(wordsResult.message || "Failed to fetch words");
        }

        setWordGroup(groupResult.data);
        setWords(wordsResult.data || []);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin nhóm từ. Vui lòng thử lại sau.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, [groupId, getAccessToken]);

  const handleDeleteWord = async (wordId, currentStatus) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa từ này?")) {
      try {
        setProcessingWordId(wordId);
        const freshToken = await getAccessToken();

        const response = await fetch(
          `http://localhost:3000/api/words/${wordId}`,
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

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to delete word");
        }

        setWords(words.filter((word) => word.id !== wordId));

        setWordGroup((prev) => ({
          ...prev,
          totalWords: prev.totalWords - 1,
          learnedWords:
            prev.learnedWords + (currentStatus === "active" ? -1 : 0),
        }));
      } catch (err) {
        setError("Không thể xóa từ. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setProcessingWordId(null);
      }
    }
  };

  const handleToggleTimeout = async (wordId, currentStatus) => {
    try {
      setProcessingWordId(wordId);
      const freshToken = await getAccessToken();

      const response = await fetch(
        `http://localhost:3000/api/words/${wordId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${freshToken}`,
          },
          body: JSON.stringify({
            status: currentStatus === "timeout" ? "active" : "timeout",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to update status");
      }

      setWords(
        words.map((word) =>
          word.id === wordId
            ? {
                ...word,
                status: currentStatus === "timeout" ? "active" : "timeout",
              }
            : word
        )
      );

      setWordGroup((prev) => ({
        ...prev,
        learnedWords:
          prev.learnedWords + (currentStatus === "timeout" ? 1 : -1),
      }));
    } catch (err) {
      setError("Không thể cập nhật trạng thái. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setProcessingWordId(null);
    }
  };

  const filteredWords =
    activeTab === "all"
      ? words
      : words.filter((word) => word.status === "timeout");

  const progressPercentage = Math.round(
    (wordGroup?.learnedWords / wordGroup?.totalWords) * 100
  );

  return (
    <Layout title={loading ? "Đang tải..." : `Nhóm từ: ${wordGroup?.name}`}>
      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>
      )}

      {!loading && wordGroup && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <div className="mb-2 flex items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Tiến độ: {progressPercentage || 0}%
              </h2>
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progressPercentage || 0}%` }}
              ></div>
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {wordGroup?.learnedWords || 0}/{wordGroup?.totalWords || 0} từ
            </div>
          </div>

          <div className="flex space-x-2">
            <Link
              to={`/word-groups/${groupId}/add-word`}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Thêm từ mới
            </Link>
            <Link
              to="/word-groups"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Quay lại
            </Link>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="large" text="Đang tải dữ liệu nhóm từ..." />
      ) : (
        <>
          <div className="mb-4 border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("all")}
                className={`mr-2 px-3 py-2 text-sm font-medium ${
                  activeTab === "all"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Tất cả từ ({words.length})
              </button>
              <button
                onClick={() => setActiveTab("timeout")}
                className={`mr-2 px-3 py-2 text-sm font-medium ${
                  activeTab === "timeout"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Timeout ({words.filter((w) => w.timeout).length})
              </button>
            </nav>
          </div>

          {filteredWords.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-center text-gray-500">
                {activeTab === "all"
                  ? "Nhóm từ này chưa có từ nào. Hãy thêm từ đầu tiên!"
                  : "Không có từ nào bị timeout."}
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
                      Từ
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Nghĩa
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Loại từ
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Trạng thái
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
                  {filteredWords.map((word) => (
                    <tr key={word.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {word.word}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-gray-900">{word.meaning}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-gray-900">{word.type}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            word.status === "timeout"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {word.status === "timeout" ? "Timeout" : "Active"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button
                          onClick={() =>
                            handleToggleTimeout(word.id, word.status)
                          }
                          disabled={processingWordId === word.id}
                          className={`mr-3 cursor-pointer ${
                            processingWordId === word.id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          } ${
                            word.status === "timeout"
                              ? "text-green-600 hover:text-green-900 hover:underline transition duration-150 ease-in-out"
                              : "text-yellow-600 hover:text-yellow-900 hover:underline transition duration-150 ease-in-out"
                          }`}
                        >
                          {processingWordId === word.id ? (
                            <span className="inline-flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5"
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
                            </span>
                          ) : word.status === "timeout" ? (
                            "Active"
                          ) : (
                            "Timeout"
                          )}
                        </button>

                        {processingWordId === word.id ? (
                          <span
                            className={`mr-3 cursor-pointer text-indigo-600 opacity-50 inline-flex items-center`}
                          >
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5"
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
                          </span>
                        ) : (
                          <Link
                            to={`/word-groups/${groupId}/edit-word/${
                              word.id
                            }?word=${encodeURIComponent(
                              word.word
                            )}&meaning=${encodeURIComponent(
                              word.meaning
                            )}&type=${encodeURIComponent(word.type)}`}
                            className="mr-3 cursor-pointer text-indigo-600 hover:text-indigo-900 hover:underline transition duration-150 ease-in-out"
                          >
                            Sửa
                          </Link>
                        )}

                        <button
                          onClick={() => handleDeleteWord(word.id, word.status)}
                          disabled={processingWordId === word.id}
                          className={`cursor-pointer text-red-600 hover:text-red-900 hover:underline transition duration-150 ease-in-out ${
                            processingWordId === word.id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {processingWordId === word.id ? (
                            <span className="inline-flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-1 h-5 w-5"
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
                            </span>
                          ) : (
                            "Xóa"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
