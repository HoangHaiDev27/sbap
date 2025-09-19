using System.Collections.Generic;
using System.Linq;

namespace VieBook.BE.Configuration
{
    public static class ApiConfiguration
    {
        // Base URLs
        public const string FRONTEND_URL = "http://localhost:5173";
        public const string BACKEND_URL = "http://localhost:7058";

        // API Endpoints
        public static class Endpoints
        {
            // User endpoints
            public const string USERS = "/api/users";
            public const string USER_BY_ID = "/api/users/{id}";

            // Payment endpoints
            public const string CREATE_PAYMENT_LINK = "/create-payment-link";
            public const string PAYOS_WEBHOOK = "/api/webhook/payos-webhook";
            public const string VERIFY_PAYMENT = "/api/webhook/verify-payment";
            public const string PAYMENT_SUCCESS = "/api/webhook/payment-success";
            public const string PAYMENT_CANCEL = "/api/webhook/payment-cancel";
            public const string HANDLE_PAYOS_REDIRECT = "/api/webhook/handle-payos-redirect";

            // Wallet Transaction endpoints
            public const string WALLET_TRANSACTIONS = "/api/webhook/transactions";
            public const string WALLET_TRANSACTIONS_BY_USER = "/api/webhook/transactions/{userId}";

            // Test endpoints
            public const string TEST_REDIRECT = "/api/webhook/test-redirect";

            // Notification endpoints
            public const string NOTIFICATIONS = "/api/notification";
            public const string NOTIFICATION_BY_ID = "/api/notification/{id}";
            public const string USER_NOTIFICATIONS = "/api/notification/user/{userId}";
            public const string USER_UNREAD_NOTIFICATIONS = "/api/notification/user/{userId}/unread";
            public const string USER_NOTIFICATIONS_BY_TYPE = "/api/notification/user/{userId}/type/{type}";
            public const string USER_RECENT_NOTIFICATIONS = "/api/notification/user/{userId}/recent";
            public const string USER_UNREAD_COUNT = "/api/notification/user/{userId}/unread-count";
            public const string NOTIFICATION_MARK_READ = "/api/notification/{id}/mark-read";
            public const string USER_MARK_ALL_READ = "/api/notification/user/{userId}/mark-all-read";
            public const string NOTIFICATION_BULK = "/api/notification/bulk";
            public const string NOTIFICATION_TYPES = "/api/notification/types";
        }

        // Frontend URLs with parameters
        public static class FrontendUrls
        {
            public static string RechargePage(string status, int? amount, int? orderCode)
            {
                var queryParams = new List<string>();
                if (!string.IsNullOrEmpty(status)) queryParams.Add($"status={status}");
                if (amount.HasValue) queryParams.Add($"amount={amount}");
                if (orderCode.HasValue) queryParams.Add($"orderCode={orderCode}");

                var queryString = queryParams.Any() ? "?" + string.Join("&", queryParams) : "";
                return $"{FRONTEND_URL}/recharge{queryString}";
            }

            public static string HomePage => $"{FRONTEND_URL}/";
            public static string LoginPage => $"{FRONTEND_URL}/login";
        }

        // PayOS Configuration
        public static class PayOS
        {
            public const string CLIENT_ID_KEY = "PayOS:PAYOS_CLIENT_ID";
            public const string API_KEY = "PayOS:PAYOS_API_KEY";
            public const string CHECKSUM_KEY = "PayOS:PAYOS_CHECKSUM_KEY";
        }

        // Database Configuration
        public static class Database
        {
            public const string CONNECTION_STRING_KEY = "DefaultConnection";
            public const string TEST_DATABASE_NAME = "TestDb";
        }

        // CORS Configuration
        public static class Cors
        {
            public const string POLICY_NAME = "AllowFrontend";
            public static readonly string[] ALLOWED_ORIGINS = { FRONTEND_URL };
        }
    }
}
