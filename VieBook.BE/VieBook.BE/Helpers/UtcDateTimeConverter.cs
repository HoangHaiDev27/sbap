using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace VieBook.BE.Helpers;

public class UtcDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        if (string.IsNullOrEmpty(value))
        {
            throw new JsonException("DateTime value cannot be null or empty");
        }

        // Parse với DateTimeStyles.RoundtripKind để giữ nguyên timezone info từ ISO string
        // ISO string có 'Z' suffix sẽ được parse là UTC
        if (DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var dateOffset))
        {
            // Luôn trả về UTC DateTime
            return dateOffset.UtcDateTime;
        }

        // Fallback: thử parse như local time rồi convert sang UTC
        if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
        {
            return date.Kind == DateTimeKind.Utc 
                ? date 
                : DateTime.SpecifyKind(date, DateTimeKind.Utc);
        }

        throw new JsonException($"Unable to parse DateTime: {value}");
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        // Serialize: Luôn output ISO UTC string với 'Z' suffix
        DateTime utcValue = value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc) // Unspecified -> treat as UTC
        };
        
        writer.WriteStringValue(utcValue.ToString("yyyy-MM-ddTHH:mm:ss.fffZ", CultureInfo.InvariantCulture));
    }
}

