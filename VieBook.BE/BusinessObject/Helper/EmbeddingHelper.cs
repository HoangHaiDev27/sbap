using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace BusinessObject.Helper
{
    public static class EmbeddingHelper
    {
        /// <summary>
        /// Chuyển đổi List<float> (từ C# Logic) sang string JSON (để lưu vào SQL Server)
        /// </summary>
        public static string SerializeVector(List<float> vector)
        {
            if (vector == null) return "[]";
            // Làm tròn để giảm kích thước chuỗi JSON và I/O (Ví dụ: 4 chữ số thập phân)
            var roundedVector = vector.Select(f => (float)Math.Round(f, 4)).ToList();
            return JsonSerializer.Serialize(roundedVector);
        }

        /// <summary>
        /// Chuyển đổi string JSON (từ SQL Server) sang List<float> (để dùng trong C# Logic)
        /// </summary>
        public static List<float> DeserializeVector(string vectorJson)
        {
            if (string.IsNullOrWhiteSpace(vectorJson)) return new List<float>();
            try
            {
                return JsonSerializer.Deserialize<List<float>>(vectorJson) ?? new List<float>();
            }
            catch (JsonException)
            {
                // Xử lý lỗi nếu chuỗi JSON không hợp lệ
                Console.WriteLine("Lỗi Deserialize Vector JSON.");
                return new List<float>();
            }
        }

        /// <summary>
        /// Tính toán độ tương đồng Cosine Similarity giữa hai vector.
        /// (Đây là hàm giả định từ SystemHelper cũ của bạn, cần được đảm bảo tồn tại)
        /// </summary>
        public static float CalculateCosineSimilarity(List<float> vectorA, List<float> vectorB)
        {
            if (vectorA == null || vectorB == null || vectorA.Count != vectorB.Count || vectorA.Count == 0)
            {
                return 0.0f;
            }

            double dotProduct = 0.0;
            double magnitudeA = 0.0;
            double magnitudeB = 0.0;

            for (int i = 0; i < vectorA.Count; i++)
            {
                dotProduct += vectorA[i] * vectorB[i];
                magnitudeA += vectorA[i] * vectorA[i];
                magnitudeB += vectorB[i] * vectorB[i];
            }

            if (magnitudeA == 0 || magnitudeB == 0)
            {
                return 0.0f;
            }

            return (float)(dotProduct / (Math.Sqrt(magnitudeA) * Math.Sqrt(magnitudeB)));
        }
    }
}