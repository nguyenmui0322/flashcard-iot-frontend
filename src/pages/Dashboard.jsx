import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [wordGroups, setWordGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch word groups with progress
    const fetchWordGroups = async () => {
      try {
        setLoading(true);
        // This would be your actual API call
        // const response = await fetch('your-api-url/word-groups');
        // const data = await response.json();

        // Simulated data for now
        const sampleData = [
          {
            id: 1,
            name: "Cơ bản",
            progress: 25,
            totalWords: 20,
            learnedWords: 5,
            currentWord: {
              id: 3,
              word: "Computer",
              meaning: "Máy tính",
            },
          },
          {
            id: 2,
            name: "Từ vựng công nghệ",
            progress: 50,
            totalWords: 30,
            learnedWords: 15,
            currentWord: {
              id: 15,
              word: "Algorithm",
              meaning: "Thuật toán",
            },
          },
          {
            id: 3,
            name: "Từ vựng kinh doanh",
            progress: 75,
            totalWords: 40,
            learnedWords: 30,
            currentWord: {
              id: 35,
              word: "Revenue",
              meaning: "Doanh thu",
            },
          },
          {
            id: 4,
            name: "Từ vựng giao tiếp",
            progress: 10,
            totalWords: 25,
            learnedWords: 2,
            currentWord: {
              id: 2,
              word: "Greeting",
              meaning: "Lời chào",
            },
          },
        ];

        // Simulate network delay
        setTimeout(() => {
          setWordGroups(sampleData);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError("Không thể tải dữ liệu tiến độ. Vui lòng thử lại sau.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchWordGroups();
  }, []);

  const getTotalProgress = () => {
    if (wordGroups.length === 0) return 0;

    const totalLearned = wordGroups.reduce(
      (sum, group) => sum + group.learnedWords,
      0
    );
    const totalWords = wordGroups.reduce(
      (sum, group) => sum + group.totalWords,
      0
    );

    if (totalWords === 0) return 0;
    return Math.round((totalLearned / totalWords) * 100);
  };

  return (
    <Layout title="Tiến độ học tập">
      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex h-24 items-center justify-center">
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Tổng quan tiến độ
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="mb-4 mr-8 sm:mb-0">
                <span className="text-4xl font-bold text-blue-600">
                  {getTotalProgress()}%
                </span>
                <span className="ml-2 text-gray-500">hoàn thành</span>
              </div>
              <div className="flex-1">
                <div className="mb-1 flex justify-between">
                  <span className="text-sm text-gray-700">Tổng tiến độ</span>
                  <span className="text-sm text-gray-700">
                    {wordGroups.reduce(
                      (sum, group) => sum + group.learnedWords,
                      0
                    )}
                    /
                    {wordGroups.reduce(
                      (sum, group) => sum + group.totalWords,
                      0
                    )}{" "}
                    từ
                  </span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-4 rounded-full bg-blue-600"
                    style={{ width: `${getTotalProgress()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Tiến độ theo nhóm từ
            </h2>

            {wordGroups.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <p className="text-center text-gray-500">
                  Bạn chưa có nhóm từ nào. Hãy tạo nhóm từ đầu tiên!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {wordGroups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-lg bg-white p-6 shadow"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {group.name}
                      </h3>
                      <Link
                        to={`/word-groups/${group.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Xem chi tiết
                      </Link>
                    </div>

                    <div className="mb-4">
                      <div className="mb-1 flex justify-between">
                        <span className="text-sm text-gray-500">Tiến độ</span>
                        <span className="text-sm text-gray-500">
                          {group.learnedWords}/{group.totalWords} từ
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${group.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {group.currentWord && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-gray-700">
                          Từ hiện tại:
                        </h4>
                        <div className="rounded-md bg-gray-50 p-3">
                          <div className="font-medium text-gray-900">
                            {group.currentWord.word}
                          </div>
                          <div className="text-sm text-gray-600">
                            {group.currentWord.meaning}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
