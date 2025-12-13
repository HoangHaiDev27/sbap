import * as signalR from "@microsoft/signalr";
import { getToken } from "../api/authApi";
import { API_BASE_URL } from "../config/apiConfig";

class ChatWebSocketService {
  constructor() {
    this.connection = null;
    this.isConnecting = false;
    this.isConnected = false;
      this.messageHandlers = [];
      this.typingHandlers = [];
      this.conversationHandlers = [];
      this.notificationHandlers = [];
      this.joinedConversations = new Map(); // conversationId -> participantIds
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
  }

  /**
   * Khởi tạo kết nối SignalR
   */
  async connect() {
    if (this.isConnected || this.isConnecting) {
      console.log("⚠️ Already connected or connecting to WebSocket");
      return;
    }

    const token = getToken();
    if (!token) {
      console.warn("⚠️ No token found, cannot connect to WebSocket");
      return;
    }

    this.isConnecting = true;

    try {
      // Xác định URL backend cho WebSocket Hub
      const hubUrl = `${API_BASE_URL}/hub/chathub`;

      // Tạo SignalR connection
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
          withCredentials: true,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
              return null; // Stop reconnecting
            }
            // Exponential backoff: 0s, 2s, 10s, 30s
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Event handlers
      this.connection.onreconnecting((error) => {
        console.warn("🔄 Reconnecting to WebSocket...", error);
        this.isConnected = false;
      });

      this.connection.onreconnected((connectionId) => {
        console.log("✅ Reconnected to WebSocket:", connectionId);
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Rejoin all conversations after reconnect
        try {
          for (const [cid, participantIds] of this.joinedConversations.entries()) {
            this.connection.invoke("JoinConversation", cid, participantIds);
            console.log(`📥 Re-joined conversation ${cid} after reconnect`);
          }
        } catch (e) {
          console.warn("⚠️ Failed to rejoin conversations after reconnect:", e);
        }
      });

      this.connection.onclose((error) => {
        console.warn("❌ WebSocket connection closed:", error);
        this.isConnected = false;
        this.isConnecting = false;
      });

      // Listen for messages
      this.connection.on("ReceiveMessage", (message) => {
        console.log("📨 Received message via WebSocket:", message);
        this.messageHandlers.forEach((handler) => handler(message));
      });

      // Listen for typing indicator
      this.connection.on("UserTyping", (data) => {
        console.log("✍️ User typing:", data);
        this.typingHandlers.forEach((handler) => handler(data, true));
      });

      this.connection.on("UserStoppedTyping", (data) => {
        console.log("🛑 User stopped typing:", data);
        this.typingHandlers.forEach((handler) => handler(data, false));
      });

      // Listen for new conversation notifications
      this.connection.on("NewConversation", (data) => {
        console.log("🆕 New conversation created:", data);
        this.conversationHandlers.forEach((handler) => handler(data));
      });

      // Listen for real-time notifications
      this.connection.on("ReceiveNotification", (notification) => {
        console.log("🔔 Received notification via WebSocket:", notification);
        this.notificationHandlers.forEach((handler) => handler(notification));
      });

      // Start connection
      await this.connection.start();
      this.isConnected = true;
      this.isConnecting = false;
      console.log("✅ Connected to WebSocket");
    } catch (error) {
      console.error("❌ Error connecting to WebSocket:", error);
      this.isConnecting = false;
      this.isConnected = false;
      
      // Retry connection after delay
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        console.log(`🔄 Retrying connection in ${delay / 1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => this.connect(), delay);
      }
    }
  }

  /**
   * Ngắt kết nối
   */
  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("🔌 Disconnected from WebSocket");
      } catch (error) {
        console.error("Error disconnecting:", error);
      }
      this.isConnected = false;
      this.connection = null;
    }
  }

  /**
   * Join vào một conversation
   */
  async joinConversation(conversationId, participantIds) {
    if (!this.isConnected) {
      console.warn("⚠️ Not connected to WebSocket, attempting to connect...");
      await this.connect();
    }

    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke("JoinConversation", conversationId, participantIds);
        console.log(`📥 Joined conversation ${conversationId}`);
        this.joinedConversations.set(conversationId, participantIds);
      } catch (error) {
        console.error("Error joining conversation:", error);
      }
    }
  }

  /**
   * Leave conversation
   */
  async leaveConversation(conversationId) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke("LeaveConversation", conversationId);
        console.log(`📤 Left conversation ${conversationId}`);
      } catch (error) {
        console.error("Error leaving conversation:", error);
      }
    }
    this.joinedConversations.delete(conversationId);
  }

  /**
   * Gửi typing indicator
   */
  async sendTyping(conversationId, userName) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke("UserTyping", conversationId, userName);
      } catch (error) {
        console.error("Error sending typing indicator:", error);
      }
    }
  }

  /**
   * Gửi stop typing
   */
  async sendStopTyping(conversationId, userName) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke("UserStoppedTyping", conversationId, userName);
      } catch (error) {
        console.error("Error sending stop typing:", error);
      }
    }
  }

  /**
   * Đăng ký handler cho tin nhắn mới
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Đăng ký handler cho typing indicator
   */
  onTyping(handler) {
    this.typingHandlers.push(handler);
    return () => {
      this.typingHandlers = this.typingHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Đăng ký handler cho new conversation events
   */
  onNewConversation(handler) {
    this.conversationHandlers.push(handler);
    return () => {
      this.conversationHandlers = this.conversationHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Đăng ký handler cho notification events
   */
  onNotification(handler) {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  getConnectionState() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      state: this.connection?.state || "Disconnected"
    };
  }
}

// Singleton instance
const chatWebSocketService = new ChatWebSocketService();
export default chatWebSocketService;

