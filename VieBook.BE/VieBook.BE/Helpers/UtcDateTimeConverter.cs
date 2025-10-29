using System.Text.Json;
using System.Text.Json.Serialization;

namespace VieBook.BE.Helpers;

public class UtcDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // Deserialize: Nhận ISO string từ frontend và parse thành UTC
        var value = reader.GetString();
        if (DateTime.TryParse(value, out var date))
        {
            // Nếu string có 'Z' hoặc timezone offset, parse sẽ tự động xử lý
            // Chỉ cần ensure Kind là UTC
            return DateTime.SpecifyKind(date.ToUniversalTime(), DateTimeKind.Utc);
        }
        throw new JsonException($"Unable to parse DateTime: {value}");
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        // Serialize: Luôn output ISO UTC string
        // Nếu value.Kind là Unspecified, coi như UTC (không convert)
        DateTime utcValue;
        if (value.Kind == DateTimeKind.Unspecified)
        {
            // Giữ nguyên giá trị, chỉ set Kind
            utcValue = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }
        else if (value.Kind == DateTimeKind.Local)
        {
            // Convert Local -> UTC
            utcValue = value.ToUniversalTime();
        }
        else
        {
            // Đã là UTC rồi
            utcValue = value;
        }
        
        writer.WriteStringValue(utcValue.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
    }
}

