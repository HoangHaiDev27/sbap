using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;

// ---------------------- CONFIG ----------------------
// Đường dẫn tuyệt đối để tránh lỗi tương đối
string basePath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), ".."));
string controllersPath = Path.Combine(basePath, "VieBook.BE", "Controllers"); // đường dẫn tới Controllers
string testsPath = Path.Combine(basePath, "Tests");                        // folder Tests
string appSettingsPath = Path.Combine(basePath, "VieBook.BE", "appsettings.json"); // đường dẫn tới appsettings.json

// Kiểm tra sự tồn tại của các thư mục và file
if (!Directory.Exists(controllersPath))
{
    Console.WriteLine($"❌ Thư mục Controllers không tồn tại: {controllersPath}");
    return;
}

if (!Directory.Exists(testsPath))
{
    Console.WriteLine($"❌ Thư mục Tests không tồn tại: {testsPath}");
    return;
}

if (!File.Exists(appSettingsPath))
{
    Console.WriteLine($"❌ File appsettings.json không tồn tại: {appSettingsPath}");
    return;
}

Console.WriteLine($"📁 Controllers path: {controllersPath}");
Console.WriteLine($"📁 Tests path: {testsPath}");
Console.WriteLine($"📄 AppSettings path: {appSettingsPath}");

// Load config từ appsettings.json
var config = new ConfigurationBuilder()
    .SetBasePath(Path.GetDirectoryName(appSettingsPath)!)
    .AddJsonFile(Path.GetFileName(appSettingsPath), optional: false, reloadOnChange: true)
    .Build();

string apiKey = config["Gemini:ApiKey"]
    ?? throw new Exception("❌ Missing Gemini:ApiKey in appsettings.json");
// ----------------------------------------------------

using var http = new HttpClient();
http.DefaultRequestHeaders.Add("x-goog-api-key", apiKey);

// Hàm phân tích controller để lấy danh sách các action methods
List<string> GetControllerActions(string controllerCode)
{
    var actions = new List<string>();
    var lines = controllerCode.Split('\n');

    for (int i = 0; i < lines.Length; i++)
    {
        var line = lines[i].Trim();

        // Regex bắt attribute [HttpGet], [HttpGet("search")], [HttpPost("create")]...
        if (Regex.IsMatch(line, @"\[Http(Get|Post|Put|Delete|Patch)(\(.*\))?\]"))
        {
            // Tìm method declaration ở 1-3 dòng tiếp theo
            for (int j = i + 1; j < lines.Length && j < i + 3; j++)
            {
                var methodLine = lines[j].Trim();
                if (methodLine.Contains("public") &&
                    methodLine.Contains("(") &&
                    (methodLine.Contains("IActionResult") || methodLine.Contains("Task")))
                {
                    // Extract method name
                    var openParenIndex = methodLine.IndexOf('(');
                    if (openParenIndex > 0)
                    {
                        var beforeParen = methodLine.Substring(0, openParenIndex).Trim();

                        var match = Regex.Match(beforeParen, @"(\w+)$");
                        if (match.Success)
                        {
                            var methodName = match.Groups[1].Value;
                            if (!string.IsNullOrEmpty(methodName) &&
                                methodName != "Controller" &&
                                methodName != "Task" &&
                                methodName != "IActionResult" &&
                                methodName != "async")
                            {
                                actions.Add(methodName);
                            }
                        }
                    }
                    break;
                }
            }
        }
    }

    return actions;
}


// Hàm phân tích file test hiện có để lấy danh sách các test methods
List<string> GetExistingTestMethods(string testCode)
{
    var testMethods = new List<string>();

    // Regex: bắt [Fact] hoặc [Theory] + public async Task MethodName(
    var regex = new Regex(@"\[(Fact|Theory)\]\s*public\s+async\s+Task\s+(\w+)\s*\(",
        RegexOptions.Multiline);

    var matches = regex.Matches(testCode);
    foreach (Match match in matches)
    {
        if (match.Groups.Count > 2)
        {
            var methodName = match.Groups[2].Value;
            if (!string.IsNullOrWhiteSpace(methodName))
            {
                testMethods.Add(methodName);
            }
        }
    }
    return testMethods;
}


// Hàm tìm các action còn thiếu test
// Hàm tìm các action còn thiếu test
List<string> FindMissingTests(List<string> controllerActions, List<string> existingTests)
{
    var missingTests = new List<string>();

    foreach (var action in controllerActions)
    {
        // Kiểm tra xem có test nào liên quan đến action không
        bool hasTest = existingTests.Any(tm =>
            tm.Contains(action, StringComparison.OrdinalIgnoreCase));

        if (!hasTest)
        {
            missingTests.Add(action);
        }
    }

    return missingTests;
}

// Hàm làm sạch code được generate
string CleanGeneratedCode(string code)
{
    var lines = code.Split('\n').ToList();
    var cleanedLines = new List<string>();
    bool inMethod = false;
    int braceCount = 0;
    bool foundFact = false;

    foreach (var line in lines)
    {
        var trimmedLine = line.Trim();

        // Bỏ qua các dòng không cần thiết
        if (trimmedLine.StartsWith("using ") ||
            trimmedLine.StartsWith("namespace ") ||
            trimmedLine.StartsWith("public class ") ||
            trimmedLine.StartsWith("private readonly ") ||
            trimmedLine.StartsWith("// Helper") ||
            trimmedLine.StartsWith("public class ") && trimmedLine.Contains("FormFile") ||
            trimmedLine.StartsWith("//") ||
            trimmedLine.StartsWith("/*") ||
            trimmedLine.StartsWith("*"))
        {
            continue;
        }

        // Xử lý [Fact] attribute
        if (trimmedLine.StartsWith("[Fact]"))
        {
            inMethod = true;
            braceCount = 0;
            foundFact = true;
            cleanedLines.Add(line);
            continue;
        }

        // Xử lý method declaration sau [Fact]
        if (inMethod && foundFact && trimmedLine.StartsWith("public async Task"))
        {
            cleanedLines.Add(line);
            foundFact = false;
            continue;
        }

        if (inMethod)
        {
            // Đếm braces để biết khi nào method kết thúc
            foreach (char c in line)
            {
                if (c == '{') braceCount++;
                if (c == '}') braceCount--;
            }

            cleanedLines.Add(line);

            // Nếu đã đóng hết braces của method
            if (braceCount == 0 && trimmedLine == "}")
            {
                inMethod = false;
            }
        }
        else if (!string.IsNullOrWhiteSpace(trimmedLine))
        {
            // Các dòng khác không phải method - bỏ qua
            continue;
        }
    }

    // Loại bỏ các dòng trống ở cuối
    while (cleanedLines.Count > 0 && string.IsNullOrWhiteSpace(cleanedLines[cleanedLines.Count - 1]))
    {
        cleanedLines.RemoveAt(cleanedLines.Count - 1);
    }

    return string.Join('\n', cleanedLines);
}


// Hàm tìm vị trí insert chính xác trong file test hiện có
int FindInsertPosition(List<string> lines)
{
    // Tìm vị trí } thứ 2 từ cuối (trước khi đóng class)
    int braceCount = 0;
    int secondLastBraceIndex = -1;
    int lastBraceIndex = -1;

    // Tìm từ cuối file lên đầu
    for (int i = lines.Count - 1; i >= 0; i--)
    {
        var line = lines[i].Trim();
        if (line == "}")
        {
            braceCount++;
            if (braceCount == 1)
            {
                lastBraceIndex = i; // Dòng } cuối cùng
            }
            else if (braceCount == 2)
            {
                secondLastBraceIndex = i; // Dòng } thứ 2 từ cuối
                break;
            }
        }
        else if (line == "{")
        {
            braceCount--;
        }
    }

    // Trả về vị trí } thứ 2 từ cuối (trước khi đóng class)
    if (secondLastBraceIndex > 0)
    {
        return secondLastBraceIndex;
    }

    // Fallback: trả về vị trí trước dòng cuối cùng
    return lines.Count - 1;
}

// (phần code GenerateTest và logic hash + backup giữ nguyên)
async Task<string> GenerateTest(string controllerCode, string controllerName, List<string> missingActions = null)
{
    try
    {
        var request = new
        {
            contents = new[]
            {
                new {
                    parts = new[]
                    {
                        new {
                            text = $@"Bạn là chuyên gia C#. Viết unit test dùng xUnit + CustomWebApplicationFactory cho controller sau:
------------------
{controllerCode}
------------------
Yêu cầu:
- Chỉ viết test cho các action sau: {(missingActions != null && missingActions.Any() ? string.Join(", ", missingActions) : "tất cả các action")}
- Sử dụng CustomWebApplicationFactory<Program> để tạo HttpClient
- Test đơn giản với _client, không cần seed data phức tạp
- Test cases PHẢI dựa trên logic thực tế của controller. 
  * Nếu controller gọi service và trả về Created() → test phải expect Created.
  * Nếu controller return Ok() khi thành công → test phải expect Ok.
  * Nếu controller return NotFound() khi không tìm thấy → test phải expect NotFound.
  * KHÔNG tự giả định có BadRequest, InternalServerError nếu trong code không hề return chúng.
- Sử dụng Assert để verify kết quả
- Test methods đơn giản, không cần setup phức tạp
- QUAN TRỌNG: Test cases phải thực tế, không tạo ra data invalid giả tạo
- Sử dụng data hợp lệ cho test success cases
- Sử dụng data thực sự invalid cho test failure cases
- Ưu tiên test các endpoint GET đơn giản trước (không cần data phức tạp)
- Tránh test các endpoint POST/PUT/DELETE phức tạp (cần validation, authentication)
- Test cases phải phù hợp với thực tế API behavior
- CHỈ sử dụng các trường có sẵn trong DTO, KHÔNG tự tạo thêm trường
- Kiểm tra DTO thực tế trước khi tạo test data
- Sử dụng đúng tên trường và kiểu dữ liệu của DTO
- VÍ DỤ: CreateNotificationDTO chỉ có UserId, Type, Title, Body - KHÔNG có Message, Data
- VÍ DỤ: BookDTO chỉ có: BookId, Title, Description, CoverUrl, Isbn, Language, TotalView, CreatedAt, Author, OwnerId, Status, TotalPrice, Sold, Rating, OwnerName, CategoryIds - KHÔNG có Price, PublishedDate, TotalPages, BookType
- VÍ DỤ: UserDTO chỉ có: UserId, Email, Status, CreatedAt, LastLoginAt, Wallet - KHÔNG có FirstName, LastName, Password, Phone, Address
- VÍ DỤ: CategoryDTO chỉ có: CategoryId, Name, Type, ParentId, IsActive - KHÔNG có CategoryName
- VÍ DỤ: BookSearchReponseDTO chỉ có: BookId, Title, CoverImageUrl - KHÔNG có Description, Isbn, Language, TotalView, CreatedAt, Author, OwnerId, Status, TotalPrice, Sold, Rating, OwnerName, CategoryIds
- CHỈ trả về code test methods, KHÔNG bao gồm:
  * Class declaration
  * Using statements
  * Namespace declaration
  * Constructor
  * Dispose method
  * Comments không cần thiết
- Mỗi test method phải có format chính xác:
  * Bắt đầu bằng [Fact]
  * Tên method: ActionName_WithCondition_ReturnsStatusCode
  * Sử dụng _client để gọi API
  * Sử dụng Assert để verify
  * Method declaration phải đầy đủ: public async Task MethodName()
  * Mỗi test method phải có đầy đủ: [Fact] + public async Task MethodName() + {{ }}
- Mỗi test method phải có tên rõ ràng theo pattern: ActionName_WithCondition_ReturnsStatusCode
- Chỉ sử dụng _client để gọi API endpoints
- Không sử dụng _context hoặc seed data phức tạp

Cấu trúc test mẫu (QUAN TRỌNG - phải theo đúng format này):
[Fact]
public async Task GetAction_ReturnsOk()
{{
    // Arrange - Test endpoint GET đơn giản

    // Act
    var response = await _client.GetAsync(""/api/yourcontroller"");

    // Assert
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
}}

[Fact]
public async Task GetAction_WithValidId_ReturnsOk()
{{
    // Arrange
    var id = 1;

    // Act
    var response = await _client.GetAsync($""/api/yourcontroller/{{id}}"");

    // Assert
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
}}

[Fact]
public async Task GetAction_WithInvalidId_ReturnsNotFound()
{{
    // Arrange
    var id = 999999; // ID không tồn tại

    // Act
    var response = await _client.GetAsync($""/api/yourcontroller/{{id}}"");

    // Assert
    Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
}}

[Fact]
public async Task PostAction_WithValidData_ReturnsOk()
{{
    // Arrange - CHỈ sử dụng các trường có sẵn trong DTO
    var newData = new YourDTO
    {{
        // VÍ DỤ với BookDTO:
        // Title = ""Test Book"",
        // Author = ""Test Author"",
        // Description = ""Test Description"",
        // Isbn = ""978-0321765723"",
        // Language = ""English"",
        // OwnerId = 1,
        // Status = ""Active"",
        // TotalPrice = 20.00m,
        // CategoryIds = new List<int> {{ 1 }}
        // KHÔNG sử dụng: Price, PublishedDate, TotalPages, BookType
    }};

    // Act
    var response = await _client.PostAsJsonAsync(""/api/yourcontroller"", newData);

    // Assert
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
}}

LƯU Ý QUAN TRỌNG:
- Mỗi test method PHẢI có đầy đủ: [Fact] + public async Task MethodName() + {{ }}
- KHÔNG được thiếu method declaration
- KHÔNG được thiếu dấu {{ }} bao quanh method body
- Tên method phải theo pattern: ActionName_WithCondition_ReturnsStatusCode
- Ưu tiên test các endpoint GET đơn giản trước
- Tránh test các endpoint POST/PUT/DELETE phức tạp
- Test cases phải phù hợp với thực tế API behavior
- CHỈ sử dụng các trường có sẵn trong DTO, KHÔNG tự tạo thêm trường
- Kiểm tra DTO thực tế trước khi tạo test data
- Sử dụng đúng tên trường và kiểu dữ liệu của DTO
- VÍ DỤ: CreateNotificationDTO chỉ có UserId, Type, Title, Body - KHÔNG có Message, Data
- VÍ DỤ: BookDTO chỉ có: BookId, Title, Description, CoverUrl, Isbn, Language, TotalView, CreatedAt, Author, OwnerId, Status, TotalPrice, Sold, Rating, OwnerName, CategoryIds - KHÔNG có Price, PublishedDate, TotalPages, BookType
- VÍ DỤ: UserDTO chỉ có các trường thực tế - KHÔNG tự tạo thêm trường
- VÍ DỤ: CategoryDTO chỉ có các trường thực tế - KHÔNG tự tạo thêm trường"
                        }
                    }
                }
            }
        };

        var json = JsonSerializer.Serialize(request);
        var response = await http.PostAsync(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            new StringContent(json, Encoding.UTF8, "application/json")
        );

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"❌ API call failed: {response.StatusCode} - {response.ReasonPhrase}");
            return "";
        }

        var result = await response.Content.ReadAsStringAsync();

        // lấy code từ response JSON
        using var doc = JsonDocument.Parse(result);
        var text = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return text ?? "";
    }
    catch (HttpRequestException ex)
    {
        Console.WriteLine($"❌ Network error: {ex.Message}");
        return "";
    }
    catch (JsonException ex)
    {
        Console.WriteLine($"❌ JSON parsing error: {ex.Message}");
        return "";
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Unexpected error: {ex.Message}");
        return "";
    }
}

// 🔹 Hàm tính hash SHA256 của controller
string GetHash(string content)
{
    using var sha = SHA256.Create();
    var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(content));
    return Convert.ToHexString(bytes);
}

try
{
    var controllerFiles = Directory.GetFiles(controllersPath, "*Controller.cs");

    if (controllerFiles.Length == 0)
    {
        Console.WriteLine("⚠️ Không tìm thấy file Controller nào trong thư mục Controllers");
        return;
    }

    Console.WriteLine($"🔍 Tìm thấy {controllerFiles.Length} controller(s)");

    foreach (var file in controllerFiles)
    {
        try
        {
            string controllerCode = await File.ReadAllTextAsync(file);
            string controllerName = Path.GetFileNameWithoutExtension(file); // vd: UsersController
            string testFile = Path.Combine(testsPath, $"{controllerName}Test.cs");
            string hashFile = testFile + ".hash";

            // Phân tích controller để lấy danh sách actions
            var controllerActions = GetControllerActions(controllerCode);
            Console.WriteLine($"🔍 Controller {controllerName} có {controllerActions.Count} actions: {string.Join(", ", controllerActions)}");

            // Kiểm tra file test hiện có
            List<string> missingActions = new List<string>();
            string existingTestCode = "";

            if (File.Exists(testFile))
            {
                existingTestCode = await File.ReadAllTextAsync(testFile);
                var existingTests = GetExistingTestMethods(existingTestCode);
                missingActions = FindMissingTests(controllerActions, existingTests);

                Console.WriteLine($"📋 File test hiện có {existingTests.Count} test methods: {string.Join(", ", existingTests)}");
                Console.WriteLine($"❌ Còn thiếu test cho {missingActions.Count} actions: {string.Join(", ", missingActions)}");

                if (missingActions.Count == 0)
                {
                    Console.WriteLine($"⏭ {controllerName}: đã có đủ test → skip.");
                    continue;
                }
            }
            else
            {
                missingActions = controllerActions; // Nếu chưa có file test thì generate tất cả
                Console.WriteLine($"📝 Chưa có file test cho {controllerName} → sẽ generate tất cả {controllerActions.Count} actions");
            }

            // tính hash controller hiện tại
            string newHash = GetHash(controllerCode);

            // check hash cũ
            if (File.Exists(hashFile))
            {
                string oldHash = await File.ReadAllTextAsync(hashFile);
                if (oldHash == newHash && missingActions.Count == 0)
                {
                    Console.WriteLine($"⏭ {controllerName}: không đổi và đã đủ test → skip.");
                    continue;
                }
            }

            Console.WriteLine($"👉 Generating test cho {missingActions.Count} actions còn thiếu của {controllerName}...");

            string generated = await GenerateTest(controllerCode, controllerName, missingActions);

            if (string.IsNullOrEmpty(generated))
            {
                Console.WriteLine($"❌ Không thể generate test cho {controllerName}");
                continue;
            }

            // lọc code từ output
            var match = Regex.Match(generated, "```csharp(.*?)```", RegexOptions.Singleline);
            string newTestCode = match.Success ? match.Groups[1].Value.Trim() : generated;

            if (string.IsNullOrEmpty(newTestCode))
            {
                Console.WriteLine($"❌ Không tìm thấy code C# trong response cho {controllerName}");
                continue;
            }

            // Làm sạch code được generate
            newTestCode = CleanGeneratedCode(newTestCode);
            // 🔹 Lọc các test mới để tránh bị trùng
            var existingTestNames = GetExistingTestMethods(existingTestCode);
            var newTestLinesDupCheck = newTestCode.Split('\n').ToList();

            var filteredNewTests = new List<string>();
            string buffer = "";
            bool insideMethod = false;
            string? currentMethod = null;

            foreach (var line in newTestLinesDupCheck)
            {
                if (line.Trim().StartsWith("[Fact]") || line.Trim().StartsWith("[Theory]"))
                {
                    buffer = line + "\n";
                    insideMethod = true;
                    currentMethod = null;
                }
                else if (insideMethod && line.Trim().StartsWith("public async Task"))
                {
                    var matchDupCheck = Regex.Match(line, @"public\s+async\s+Task\s+(\w+)\s*\(");
                    if (matchDupCheck.Success)
                    {
                        currentMethod = matchDupCheck.Groups[1].Value;
                    }
                    buffer += line + "\n";
                }
                else if (insideMethod)
                {
                    buffer += line + "\n";
                    if (line.Trim() == "}")
                    {
                        insideMethod = false;
                        if (currentMethod == null || !existingTestNames.Contains(currentMethod))
                        {
                            filteredNewTests.Add(buffer);
                        }
                        buffer = "";
                    }
                }
            }

            // Replace newTestCode với filtered
            newTestCode = string.Join("\n", filteredNewTests);


            // backup nếu có file cũ
            if (File.Exists(testFile))
            {
                string backupPath = testFile + $".bak_{DateTime.Now:yyyyMMddHHmmss}";
                File.Copy(testFile, backupPath, overwrite: true);
                Console.WriteLine($"📦 Backup file cũ: {backupPath}");
            }

            // Merge test code mới vào file hiện có
            string finalCode;
            if (File.Exists(testFile) && !string.IsNullOrEmpty(existingTestCode))
            {
                // Đọc file test hiện có
                var lines = existingTestCode.Split('\n').ToList();

                // Tìm vị trí } thứ 2 từ cuối (trước khi đóng class)
                int insertIndex = FindInsertPosition(lines);

                // Thêm test methods mới vào vị trí đúng
                var newTestLines = newTestCode.Split('\n').ToList();

                // Thêm dòng trống trước test methods mới nếu cần
                if (insertIndex > 0 && !string.IsNullOrWhiteSpace(lines[insertIndex - 1]))
                {
                    newTestLines.Insert(0, "");
                }

                // Thêm dòng trống sau test methods mới nếu cần
                if (insertIndex < lines.Count && !string.IsNullOrWhiteSpace(lines[insertIndex]))
                {
                    newTestLines.Add("");
                }

                // Chèn test methods mới vào vị trí đúng
                lines.InsertRange(insertIndex, newTestLines);

                // Ghi đè lại file với code đã được merge
                finalCode = string.Join('\n', lines);

                Console.WriteLine($"🔗 Merged {missingActions.Count} test methods vào file hiện có tại vị trí dòng {insertIndex}");
            }
            else
            {
                // Tạo file test mới hoàn chỉnh
                finalCode = $@"using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Collections.Generic;
using BusinessObject.Dtos;
using Xunit;

namespace Tests
{{
    public class {controllerName}Test : IClassFixture<CustomWebApplicationFactory<Program>>
    {{
        private readonly HttpClient _client;

        public {controllerName}Test(CustomWebApplicationFactory<Program> factory)
        {{
            _client = factory.CreateClient();
        }}

{newTestCode}
    }}
}}";
            }

            // ghi file test mới + hash
            await File.WriteAllTextAsync(testFile, finalCode);
            await File.WriteAllTextAsync(hashFile, newHash);

            Console.WriteLine($"✅ {testFile} updated với {missingActions.Count} test methods mới.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Lỗi khi xử lý file {file}: {ex.Message}");
            continue;
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Lỗi chung: {ex.Message}");
    return;
}

Console.WriteLine("🎉 Done! Chạy dotnet test để verify.");