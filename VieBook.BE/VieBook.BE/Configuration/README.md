# API Configuration

## Tổng quan

File `ApiConfiguration.cs` chứa tất cả các cấu hình API endpoints, URLs và constants được sử dụng trong toàn bộ backend.

## Cấu trúc

### 1. Base URLs

```csharp
public const string FRONTEND_URL = "http://localhost:3008";
public const string BACKEND_URL = "http://localhost:5757";
```

### 2. API Endpoints

```csharp
public static class Endpoints
{
    // User endpoints
    public const string USERS = "/api/users";
    public const string USER_BY_ID = "/api/users/{id}";

    // Payment endpoints
    public const string CREATE_PAYMENT_LINK = "/create-payment-link";
    public const string PAYOS_WEBHOOK = "/api/webhook/payos-webhook";
    // ...
}
```

### 3. Frontend URLs với Parameters

```csharp
public static class FrontendUrls
{
    public static string RechargePage(string status, int? amount, int? orderCode)
    {
        // Tự động tạo URL với query parameters
        return $"{FRONTEND_URL}/recharge?status={status}&amount={amount}&orderCode={orderCode}";
    }
}
```

### 4. PayOS Configuration

```csharp
public static class PayOS
{
    public const string CLIENT_ID_KEY = "PayOS:PAYOS_CLIENT_ID";
    public const string API_KEY = "PayOS:PAYOS_API_KEY";
    public const string CHECKSUM_KEY = "PayOS:PAYOS_CHECKSUM_KEY";
}
```

## Cách sử dụng

### Trong Controllers:

```csharp
using VieBook.BE.Configuration;

// Sử dụng endpoints
[Route(ApiConfiguration.Endpoints.USERS)]
public class UsersController : ControllerBase

// Sử dụng frontend URLs
var redirectUrl = ApiConfiguration.FrontendUrls.RechargePage("success", amount, orderCode);
return Redirect(redirectUrl);
```

### Trong Program.cs:

```csharp
using VieBook.BE.Configuration;

// Sử dụng database config
options.UseSqlServer(builder.Configuration.GetConnectionString(ApiConfiguration.Database.CONNECTION_STRING_KEY));

// Sử dụng PayOS config
configuration[ApiConfiguration.PayOS.CLIENT_ID_KEY]

// Sử dụng CORS config
options.AddPolicy(ApiConfiguration.Cors.POLICY_NAME, ...)
```

## Lợi ích

1. **Tập trung quản lý**: Tất cả URLs và endpoints ở một nơi
2. **Dễ bảo trì**: Chỉ cần sửa 1 file khi thay đổi cấu hình
3. **Tránh lỗi**: Không lo nhầm lẫn URLs giữa các file
4. **IntelliSense**: IDE sẽ gợi ý các constants có sẵn
5. **Type Safety**: Compile-time checking cho các endpoints

## Thêm Endpoint mới

1. Thêm constant vào class `Endpoints`:

```csharp
public const string NEW_ENDPOINT = "/api/new-endpoint";
```

2. Sử dụng trong controller:

```csharp
[HttpGet(ApiConfiguration.Endpoints.NEW_ENDPOINT)]
public IActionResult NewEndpoint() { ... }
```

## Thay đổi URL

Chỉ cần sửa trong `ApiConfiguration.cs`:

```csharp
public const string FRONTEND_URL = "http://new-frontend-url.com";
```

Tất cả các nơi sử dụng sẽ tự động cập nhật!
