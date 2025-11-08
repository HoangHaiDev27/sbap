import React, { useState, useEffect } from "react";
import { generateQRCode, getSupportedBanks } from "../../../api/vietQrApi";
import { approvePaymentRequest } from "../../../api/paymentRequestApi";
import toast from "react-hot-toast";

export default function WithdrawApproveModal({ withdraw, onClose }) {
  const [step, setStep] = useState("confirm"); // "confirm" | "qr" | "loading"
  const [selectedBankId, setSelectedBankId] = useState("");
  const [banks, setBanks] = useState([]);
  const [qrDataURL, setQrDataURL] = useState("");
  const [error, setError] = useState("");
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    if (step === "qr" && banks.length === 0) {
      loadBanks();
    }
  }, [step]);

  const loadBanks = async () => {
    try {
      setLoadingBanks(true);
      setError("");
      const bankList = await getSupportedBanks();
      setBanks(bankList);
      
      return bankList; // Return để có thể dùng ngay
    } catch (err) {
      console.error("Error loading banks:", err);
      setError(err.message || "Không thể tải danh sách ngân hàng");
      return [];
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleGenerateQR = async (bankAcqId = null) => {
    // Validate tài khoản
    if (!withdraw.bankNumber || withdraw.bankNumber.trim() === "") {
      toast.error("Số tài khoản hiện tại không đúng");
      setError("Số tài khoản hiện tại không đúng");
      return;
    }

    // Validate format số tài khoản (chỉ chứa số, độ dài từ 8-20 ký tự)
    const bankNumberRegex = /^\d{8,20}$/;
    if (!bankNumberRegex.test(withdraw.bankNumber.trim())) {
      toast.error("Số tài khoản không hợp lệ. Số tài khoản phải chứa từ 8-20 chữ số.");
      setError("Số tài khoản không hợp lệ. Số tài khoản phải chứa từ 8-20 chữ số.");
      return;
    }

    // Validate tên ngân hàng
    if (!withdraw.bankName || withdraw.bankName.trim() === "") {
      toast.error("Chưa có thông tin ngân hàng. Vui lòng yêu cầu người dùng cập nhật thông tin ngân hàng.");
      setError("Chưa có thông tin ngân hàng");
      return;
    }

    const acqId = bankAcqId || selectedBankId;
    if (!acqId) {
      toast.error("Không tìm thấy ngân hàng phù hợp. Vui lòng yêu cầu người dùng cập nhật thông tin ngân hàng.");
      setError("Không tìm thấy ngân hàng phù hợp");
      return;
    }

    try {
      setGeneratingQR(true);
      setError("");
      
      const request = {
        AccountNo: withdraw.bankNumber || "",
        AccountName: withdraw.user || "",
        AcqId: acqId,
        Amount: withdraw.amountReceived || 0,
        AddInfo: `Rut tien tu app - ${withdraw.id}`,
      };

      const result = await generateQRCode(request);
      
      if (result.success && result.qrDataURL) {
        setQrDataURL(result.qrDataURL);
        // step đã được set ở handleConfirm rồi
      } else {
        const errorMsg = result.message || "Không thể tạo mã QR";
        setError(errorMsg);
        
        // Kiểm tra nếu lỗi liên quan đến tài khoản
        if (errorMsg.toLowerCase().includes("account") || 
            errorMsg.toLowerCase().includes("tài khoản") ||
            errorMsg.toLowerCase().includes("không hợp lệ") ||
            errorMsg.toLowerCase().includes("invalid")) {
          toast.error("Số tài khoản hiện tại không đúng");
        }
      }
    } catch (err) {
      console.error("Error generating QR:", err);
      const errorMsg = err.message || "Không thể tạo mã QR";
      setError(errorMsg);
      
      // Kiểm tra nếu lỗi liên quan đến tài khoản
      if (errorMsg.toLowerCase().includes("account") || 
          errorMsg.toLowerCase().includes("tài khoản") ||
          errorMsg.toLowerCase().includes("không hợp lệ") ||
          errorMsg.toLowerCase().includes("invalid")) {
        toast.error("Số tài khoản hiện tại không đúng");
      }
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setError("");
      
      // Validate số tài khoản trước
      if (!withdraw?.bankNumber || withdraw.bankNumber.trim() === "") {
        toast.error("Số tài khoản hiện tại không đúng");
        return;
      }

      // Validate format số tài khoản (chỉ chứa số, độ dài từ 8-20 ký tự)
      const bankNumberRegex = /^\d{8,20}$/;
      if (!bankNumberRegex.test(withdraw.bankNumber.trim())) {
        toast.error("Số tài khoản không hợp lệ. Số tài khoản phải chứa từ 8-20 chữ số.");
        return;
      }
      
      // Validate tên ngân hàng
      if (!withdraw?.bankName || withdraw.bankName.trim() === "") {
        toast.error("Chưa có thông tin ngân hàng. Vui lòng yêu cầu người dùng cập nhật thông tin ngân hàng.");
        return;
      }
      
      // Load banks nếu chưa có
      let bankList = banks;
      if (bankList.length === 0) {
        bankList = await loadBanks();
        if (bankList.length === 0) {
          toast.error("Không thể tải danh sách ngân hàng");
          return;
        }
      }
      
      // Tự động tìm bank dựa trên bankName của user
      const matchedBank = bankList.find(
        b => {
          const bankNameLower = b.name?.toLowerCase() || "";
          const shortNameLower = b.shortName?.toLowerCase() || "";
          const withdrawBankLower = withdraw.bankName?.toLowerCase() || "";
          
          return bankNameLower === withdrawBankLower ||
                 shortNameLower === withdrawBankLower ||
                 bankNameLower.includes(withdrawBankLower) ||
                 withdrawBankLower.includes(bankNameLower) ||
                 shortNameLower.includes(withdrawBankLower) ||
                 withdrawBankLower.includes(shortNameLower);
        }
      );
      
      if (!matchedBank) {
        toast.error(`Ngân hàng "${withdraw.bankName}" không được hỗ trợ. Vui lòng yêu cầu người dùng cập nhật thông tin ngân hàng.`);
        setError("Không tìm thấy ngân hàng phù hợp");
        return;
      }
      
      // Set selectedBankId và tạo QR ngay
      setSelectedBankId(matchedBank.acqId);
      setStep("qr");
      
      // Tạo QR code với AcqId vừa tìm được (truyền trực tiếp để đảm bảo)
      await handleGenerateQR(matchedBank.acqId);
      
    } catch (err) {
      console.error("Error in handleConfirm:", err);
      toast.error(err.message || "Không thể tạo mã QR");
      setError(err.message || "Không thể tạo mã QR");
    }
  };

  const handleClose = () => {
    setStep("confirm");
    setQrDataURL("");
    setSelectedBankId("");
    setError("");
    onClose();
  };

  if (!withdraw) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {step === "confirm" && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Xác nhận duyệt yêu cầu
            </h2>
            <div className="mb-6 space-y-2">
              <p className="text-gray-700">
                Bạn có chắc chắn muốn <span className="font-semibold">duyệt</span> yêu cầu rút tiền{" "}
                <span className="font-bold">{withdraw.id}</span>?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p><span className="font-semibold">Người yêu cầu:</span> {withdraw.user}</p>
                <p><span className="font-semibold">Số tiền:</span> {withdraw.amount}</p>
                <p><span className="font-semibold">Ngân hàng:</span> {withdraw.bankName || "Chưa có"}</p>
                <p><span className="font-semibold">STK:</span> {withdraw.bankNumber || "Chưa có"}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
              >
                Tạo mã QR
              </button>
            </div>
          </div>
        )}

        {step === "qr" && !qrDataURL && generatingQR && (
          <div className="p-6">
            <div className="text-center py-8 text-gray-600">
              <p>Đang tạo mã QR...</p>
            </div>
          </div>
        )}

        {step === "qr" && qrDataURL && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Mã QR thanh toán
            </h2>

            <div className="mb-4 text-center">
              <img
                src={qrDataURL}
                alt="QR Code"
                className="mx-auto border border-gray-300 rounded-lg"
                style={{ maxWidth: "300px", maxHeight: "300px" }}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Hướng dẫn:</strong> Quét mã QR bằng ứng dụng ngân hàng để chuyển tiền.
                Sau khi chuyển tiền, vui lòng xác nhận đã hoàn tất.
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg text-sm mb-4">
              <p><span className="font-semibold">Người nhận:</span> {withdraw.user}</p>
              <p><span className="font-semibold">Số tài khoản:</span> {withdraw.bankNumber}</p>
              <p><span className="font-semibold">Số tiền:</span> {withdraw.amount}</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Đóng
              </button>
              <button
                onClick={async () => {
                  try {
                    setGeneratingQR(true);
                    setError("");
                    await approvePaymentRequest(withdraw.paymentRequestId);
                    handleClose();
                  } catch (err) {
                    console.error("Error approving payment request:", err);
                    setError(err.message || "Không thể cập nhật trạng thái. Vui lòng thử lại.");
                    setGeneratingQR(false);
                  }
                }}
                disabled={generatingQR}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingQR ? "Đang xử lý..." : "Đã chuyển tiền"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
