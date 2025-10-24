namespace VieBook.BE.Constants
{
    /// <summary>
    /// Định nghĩa các permissions trong hệ thống
    /// </summary>
    public static class Permissions
    {
        // User Management
        public const string UserManagement = "UserManagement";
        public const string ViewUsers = "ViewUsers";
        public const string CreateUsers = "CreateUsers";
        public const string UpdateUsers = "UpdateUsers";
        public const string DeleteUsers = "DeleteUsers";

        // Book Management
        public const string BookManagement = "BookManagement";
        public const string ViewBooks = "ViewBooks";
        public const string CreateBooks = "CreateBooks";
        public const string UpdateBooks = "UpdateBooks";
        public const string DeleteBooks = "DeleteBooks";
        public const string ApproveBooks = "ApproveBooks";

        // Order Management
        public const string OrderManagement = "OrderManagement";
        public const string ViewOrders = "ViewOrders";
        public const string CreateOrders = "CreateOrders";
        public const string UpdateOrders = "UpdateOrders";
        public const string CancelOrders = "CancelOrders";

        // Payment Management
        public const string PaymentManagement = "PaymentManagement";
        public const string ViewPayments = "ViewPayments";
        public const string ProcessPayments = "ProcessPayments";
        public const string RefundPayments = "RefundPayments";

        // Transaction Management
        public const string TransactionManagement = "TransactionManagement";
        public const string ViewTransactions = "ViewTransactions";
        public const string ManageTransactions = "ManageTransactions";

        // Category Management
        public const string CategoryManagement = "CategoryManagement";
        public const string ViewCategories = "ViewCategories";
        public const string CreateCategories = "CreateCategories";
        public const string UpdateCategories = "UpdateCategories";
        public const string DeleteCategories = "DeleteCategories";

        // Notification Management
        public const string NotificationManagement = "NotificationManagement";
        public const string ViewNotifications = "ViewNotifications";
        public const string SendNotifications = "SendNotifications";

        // Analytics & Reports
        public const string Analytics = "Analytics";
        public const string ViewReports = "ViewReports";
        public const string ExportData = "ExportData";

        // System Settings
        public const string SystemSettings = "SystemSettings";
        public const string ManageRoles = "ManageRoles";
        public const string ManagePermissions = "ManagePermissions";
    }

    /// <summary>
    /// Định nghĩa các roles trong hệ thống (theo database)
    /// </summary>
    public static class Roles
    {
        public const string Admin = "Admin";     // RoleId: 1 - Quản trị viên hệ thống
        public const string Staff = "Staff";     // RoleId: 2 - Nhân viên
        public const string Owner = "Owner";     // RoleId: 3 - Chủ sở hữu
        public const string Customer = "Customer"; // RoleId: 4 - Khách hàng
    }

    /// <summary>
    /// Mapping roles với permissions
    /// </summary>
    public static class RolePermissions
    {
        public static readonly Dictionary<string, List<string>> RolePermissionMap = new()
        {
            [Roles.Admin] = new List<string>
            {
                // Admin có tất cả permissions
                Permissions.UserManagement,
                Permissions.ViewUsers,
                Permissions.CreateUsers,
                Permissions.UpdateUsers,
                Permissions.DeleteUsers,
                Permissions.BookManagement,
                Permissions.ViewBooks,
                Permissions.CreateBooks,
                Permissions.UpdateBooks,
                Permissions.DeleteBooks,
                Permissions.ApproveBooks,
                Permissions.OrderManagement,
                Permissions.ViewOrders,
                Permissions.CreateOrders,
                Permissions.UpdateOrders,
                Permissions.CancelOrders,
                Permissions.PaymentManagement,
                Permissions.ViewPayments,
                Permissions.ProcessPayments,
                Permissions.RefundPayments,
                Permissions.TransactionManagement,
                Permissions.ViewTransactions,
                Permissions.ManageTransactions,
                Permissions.CategoryManagement,
                Permissions.ViewCategories,
                Permissions.CreateCategories,
                Permissions.UpdateCategories,
                Permissions.DeleteCategories,
                Permissions.NotificationManagement,
                Permissions.ViewNotifications,
                Permissions.SendNotifications,
                Permissions.Analytics,
                Permissions.ViewReports,
                Permissions.ExportData,
                Permissions.SystemSettings,
                Permissions.ManageRoles,
                Permissions.ManagePermissions
            },
            [Roles.Owner] = new List<string>
            {
                // Owner có quyền quản lý toàn bộ hệ thống
                Permissions.UserManagement,
                Permissions.ViewUsers,
                Permissions.CreateUsers,
                Permissions.UpdateUsers,
                Permissions.BookManagement,
                Permissions.ViewBooks,
                Permissions.CreateBooks,
                Permissions.UpdateBooks,
                Permissions.ApproveBooks,
                Permissions.OrderManagement,
                Permissions.ViewOrders,
                Permissions.UpdateOrders,
                Permissions.PaymentManagement,
                Permissions.ViewPayments,
                Permissions.ProcessPayments,
                Permissions.TransactionManagement,
                Permissions.ViewTransactions,
                Permissions.ManageTransactions,
                Permissions.CategoryManagement,
                Permissions.ViewCategories,
                Permissions.CreateCategories,
                Permissions.UpdateCategories,
                Permissions.NotificationManagement,
                Permissions.ViewNotifications,
                Permissions.SendNotifications,
                Permissions.Analytics,
                Permissions.ViewReports,
                Permissions.ExportData
            },
            [Roles.Staff] = new List<string>
            {
                // Staff có quyền quản lý hàng ngày
                Permissions.UserManagement,
                Permissions.ViewUsers,
                Permissions.CreateUsers,
                Permissions.UpdateUsers,
                Permissions.BookManagement,
                Permissions.ViewBooks,
                Permissions.CreateBooks,
                Permissions.UpdateBooks,
                Permissions.ApproveBooks,
                Permissions.OrderManagement,
                Permissions.ViewOrders,
                Permissions.UpdateOrders,
                Permissions.PaymentManagement,
                Permissions.ViewPayments,
                Permissions.ProcessPayments,
                Permissions.TransactionManagement,
                Permissions.ViewTransactions,
                Permissions.ManageTransactions,
                Permissions.CategoryManagement,
                Permissions.ViewCategories,
                Permissions.CreateCategories,
                Permissions.UpdateCategories,
                Permissions.NotificationManagement,
                Permissions.ViewNotifications,
                Permissions.SendNotifications,
                Permissions.Analytics,
                Permissions.ViewReports
            },
            [Roles.Customer] = new List<string>
            {
                // Customer chỉ có quyền cơ bản
                Permissions.ViewBooks,
                Permissions.ViewOrders,
                Permissions.CreateOrders,
                Permissions.ViewPayments,
                Permissions.ViewCategories,
                Permissions.ViewNotifications
            }
        };

        /// <summary>
        /// Lấy danh sách permissions của một role
        /// </summary>
        public static List<string> GetPermissionsForRole(string role)
        {
            return RolePermissionMap.TryGetValue(role, out var permissions) 
                ? permissions 
                : new List<string>();
        }

        /// <summary>
        /// Kiểm tra role có permission không
        /// </summary>
        public static bool HasPermission(string role, string permission)
        {
            var permissions = GetPermissionsForRole(role);
            return permissions.Contains(permission);
        }

        /// <summary>
        /// Lấy danh sách permissions của nhiều roles
        /// </summary>
        public static List<string> GetPermissionsForRoles(List<string> roles)
        {
            var allPermissions = new HashSet<string>();
            
            foreach (var role in roles)
            {
                var rolePermissions = GetPermissionsForRole(role);
                foreach (var permission in rolePermissions)
                {
                    allPermissions.Add(permission);
                }
            }
            
            return allPermissions.ToList();
        }
    }
}
