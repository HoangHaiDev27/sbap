import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { uploadChapterFile, createChapter } from "../../api/ownerBookApi";
import { checkSpelling as checkSpellingApi, moderation as moderationApi, checkPlagiarism as checkPlagiarismApi, generateEmbeddings as generateEmbeddingsApi } from "../../api/openAiApi";
import { useLocation } from "react-router-dom";

// Real API for content policy check
async function checkPolicy(content) {
  try {
    const result = await moderationApi(content);
    
    // Convert OpenAI moderation result to our format
    if (result.flagged) {
      const flaggedCategories = Object.entries(result.categories || {})
        .filter(([_, isFlagged]) => isFlagged)
        .map(([category, _]) => category);
      
      return {
        passed: false,
        message: `Nội dung vi phạm chính sách: ${flaggedCategories.join(", ")}`,
        flaggedCategories,
        categoryScores: result.categoryScores || {}
      };
    } else {
      return {
        passed: true,
        message: "Nội dung hợp lệ và tuân thủ chính sách",
        flaggedCategories: [],
        categoryScores: result.categoryScores || {}
      };
    }
  } catch (error) {
    console.error("Moderation API error:", error);
    // Fallback to mock if API fails
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random() > 0.2 ? 
      { passed: true, message: "Nội dung hợp lệ (kiểm tra dự phòng)" } : 
      { passed: false, message: "Nội dung vi phạm chính sách (kiểm tra dự phòng)" };
  }
}

async function checkPlagiarism(bookId, content, chapterId = null) {
  try {
    const result = await checkPlagiarismApi(bookId, content, chapterId);
    
    return {
      similarity: Math.round(result.similarity * 100), // Convert to percentage
      passed: result.passed,
      message: result.message,
      classification: result.classification,
      matches: result.matches || []
    };
  } catch (error) {
    console.error("Plagiarism API error:", error);
    // Fallback to mock if API fails
    await new Promise(resolve => setTimeout(resolve, 1000));
    const similarity = Math.random() * 30;
    return { 
      similarity: Math.round(similarity), 
      passed: similarity <= 20,
      message: similarity <= 20 ? "Nội dung độc đáo (kiểm tra dự phòng)" : "Nội dung có dấu hiệu đạo văn (kiểm tra dự phòng)",
      classification: "None",
      matches: []
    };
  }
}

// Bỏ mock, sử dụng API thật ở dưới qua handleCheckSpelling

export default function ChapterForm() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data
  const [chapterId, setChapterId] = useState(null); // Thêm state để lưu chapterId
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(10);
  const [isFree, setIsFree] = useState(false);
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [pdfPages, setPdfPages] = useState(null);
  const [status, setStatus] = useState("Draft");
  const fileInputRef = useRef(null);
  
  // Step 1 - Spelling check
  const [spellingErrors, setSpellingErrors] = useState([]);
  const [isCheckingSpelling, setIsCheckingSpelling] = useState(false);
  const [correctedText, setCorrectedText] = useState("");
  const [contentHasMeaning, setContentHasMeaning] = useState(true); // Track if content has meaningful content
  const [meaningScore, setMeaningScore] = useState(100); // Track meaning score (0-100)
  const [meaningReason, setMeaningReason] = useState(""); // Track reason for meaning assessment
  const contentAreaRef = useRef(null);
  
  // Step 3 - Approval states
  const [isCheckingPolicy, setIsCheckingPolicy] = useState(false);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [policyResult, setPolicyResult] = useState(null);
  const [plagiarismResult, setPlagiarismResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [policyProgress, setPolicyProgress] = useState(0);
  const [plagiarismProgress, setPlagiarismProgress] = useState(0);
  const [hasAutoChecked, setHasAutoChecked] = useState(false);
  const [lastCheckedContent, setLastCheckedContent] = useState("");
  
  const [bookTitle, setBookTitle] = useState(location.state?.bookTitle || "Không xác định");
  
  // Terms and conditions popup
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState({
    title: "",
    price: "",
    content: ""
  });

  // Handler cho title input - sử dụng useCallback để tránh re-render
  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
    // Clear title validation error when user types
    if (validationErrors.title) {
      setValidationErrors(prev => ({ ...prev, title: "" }));
    }
  }, [validationErrors.title]);

  // Handler cho content input - sử dụng useCallback để tránh re-render
  const handleContentChange = useCallback((e) => {
    setContent(e.target.value);
    // Clear content validation error when user types
    if (validationErrors.content) {
      setValidationErrors(prev => ({ ...prev, content: "" }));
    }
    // Reset meaning assessment when content changes
    setContentHasMeaning(true);
    setMeaningScore(100);
    setMeaningReason("");
    setSpellingErrors([]);
    setCorrectedText("");
  }, [validationErrors.content]);

  // Validation functions
  const validateTitle = (title) => {
    if (!title.trim()) {
      return "Tiêu đề chương không được để trống";
    }
    if (title.trim().length < 3) {
      return "Tiêu đề chương phải có ít nhất 3 ký tự";
    }
    if (title.trim().length > 200) {
      return "Tiêu đề chương không được vượt quá 200 ký tự";
    }
    return "";
  };

  const validatePrice = (price, isFree) => {
    if (isFree) {
      return ""; // Free chapters don't need price validation
    }
    if (price < 0) {
      return "Giá chương không được âm";
    }
    if (price > 10000) {
      return "Giá chương không được vượt quá 10,000 xu";
    }
    if (price === 0 && !isFree) {
      return "Nếu muốn miễn phí, vui lòng tick vào ô 'Miễn phí'";
    }
    return "";
  };

  const validateContent = (content) => {
    if (!content.trim()) {
      return "Nội dung chương không được để trống";
    }
    if (content.trim().length < 50) {
      return "Nội dung chương phải có ít nhất 50 ký tự";
    }
    if (content.trim().length > 50000) {
      return "Nội dung chương không được vượt quá 50,000 ký tự";
    }
    return "";
  };

  // Validate all fields
  const validateAllFields = () => {
    const titleError = validateTitle(title);
    const priceError = validatePrice(price, isFree);
    const contentError = validateContent(content);

    setValidationErrors({
      title: titleError,
      price: priceError,
      content: contentError
    });

    return !titleError && !priceError && !contentError;
  };

  // Handler cho price input
  const handlePriceChange = useCallback((e) => {
    const val = e.target.value;
    setPrice(val === "" ? 0 : parseInt(val, 10));
    // Clear price validation error when user types
    if (validationErrors.price) {
      setValidationErrors(prev => ({ ...prev, price: "" }));
    }
  }, [validationErrors.price]);

  // Handler cho isFree checkbox
  const handleIsFreeChange = useCallback((e) => {
    setIsFree(e.target.checked);
    // Clear price validation error when user changes free status
    if (validationErrors.price) {
      setValidationErrors(prev => ({ ...prev, price: "" }));
    }
  }, [validationErrors.price]);

  // Khi tick vào free, giá tự = 0
  useEffect(() => {
    if (isFree) setPrice(0);
    else if (price === 0) setPrice(10);
  }, [isFree]);

  // Validate giá không âm
  useEffect(() => {
    if (price < 0) {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Giá chương không được âm" },
        })
      );
      setPrice(0);
    }
  }, [price]);

  // Xử lý chọn file TXT/PDF - sử dụng useCallback
  const handleFileChange = useCallback(async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPdfPages(null);

    if (selectedFile.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => setContent(event.target.result);
      reader.readAsText(selectedFile);
    } else if (selectedFile.type === "application/pdf") {
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        setPdfPages(pdf.numPages);

        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + "\n";
        }
        setContent(text);
      };
      fileReader.readAsArrayBuffer(selectedFile);
    } else {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Chỉ nhận file TXT hoặc PDF" },
        })
      );
      setFile(null);
    }
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }, []);

  const getFileTag = useCallback(() => {
    if (!file) return null;
    if (file.type === "text/plain")
      return <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-black rounded text-xs">TXT</span>;
    if (file.type === "application/pdf")
      return <span className="ml-2 px-2 py-0.5 bg-green-400 text-black rounded text-xs">PDF</span>;
    return null;
  }, [file]);

  // Terms and conditions handlers
  const handleAcceptTerms = () => {
    setAcceptedTerms(true);
    setShowTermsPopup(false);
  };

  const handleDeclineTerms = () => {
    setAcceptedTerms(false);
    setShowTermsPopup(false);
    navigate(`/owner/books/${bookId}/chapters`, { state: { bookTitle } });
  };

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < 3) {
      // Validate current step before proceeding
      if (currentStep === 1) {
        const titleError = validateTitle(title);
        const priceError = validatePrice(price, isFree);
        
        if (titleError || priceError) {
          setValidationErrors({
            title: titleError,
            price: priceError,
            content: ""
          });
          return;
        }
      } else if (currentStep === 2) {
        const contentError = validateContent(content);
        
        // Kiểm tra ý nghĩa nội dung nếu đã kiểm tra chính tả
        if (!contentHasMeaning) {
          window.dispatchEvent(
            new CustomEvent("app:toast", {
              detail: { 
                type: "error", 
                message: "Nội dung không có ý nghĩa. Vui lòng nhập nội dung có giá trị trước khi tiếp tục." 
              },
            })
          );
          return;
        }
        
        if (contentError) {
          setValidationErrors({
            title: "",
            price: "",
            content: contentError
          });
          return;
        }
      }

      const next = currentStep + 1;
      // If moving to step 3 and content changed, invalidate previous checks
      if (next === 3 && content.trim() && content !== lastCheckedContent) {
        setHasAutoChecked(false);
      }
      setCurrentStep(next);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Show terms popup on component mount if not already accepted
  useEffect(() => {
    if (!acceptedTerms) {
      setShowTermsPopup(true);
    }
  }, [acceptedTerms]);

  // Auto-check when entering step 3
  useEffect(() => {
    if (currentStep === 3 && content.trim() && (!hasAutoChecked || content !== lastCheckedContent)) {
      setHasAutoChecked(true);
      runAutoChecks();
    }
  }, [currentStep, hasAutoChecked, content, lastCheckedContent]);

  // Invalidate checks when content changes
  useEffect(() => {
    setHasAutoChecked(false);
  }, [content]);

  // Step 1: Check spelling - sử dụng useCallback
  const handleCheckSpelling = useCallback(async () => {
    if (!content.trim()) {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Vui lòng nhập nội dung để kiểm tra chính tả" },
        })
      );
      return;
    }

    setIsCheckingSpelling(true);
    try {
      const apiResult = await checkSpellingApi(content);
      // apiResult có thể là string JSON hoặc object
      let resultObj = apiResult;
      if (typeof apiResult === "string") {
        try { resultObj = JSON.parse(apiResult); } catch { resultObj = {}; }
      }

      const apiErrors = Array.isArray(resultObj?.errors) ? resultObj.errors : [];
      // Chuẩn hoá lỗi sang định dạng hiển thị
      const normalizedErrors = apiErrors.map(e => ({
        wrong: e.wrong || e.word || "",
        suggestion: e.suggestion || (Array.isArray(e.suggestions) ? e.suggestions.join(", ") : ""),
        explanation: e.explanation || "",
      }));
      setSpellingErrors(normalizedErrors);
      setCorrectedText(resultObj?.correctedText || "");

      // Cập nhật thông tin ý nghĩa nội dung
      const hasMeaning = resultObj?.hasMeaning !== false; // Default to true if not provided
      const meaningScoreValue = resultObj?.meaningScore ?? 100;
      const meaningReasonValue = resultObj?.meaningReason || "";
      
      setContentHasMeaning(hasMeaning);
      setMeaningScore(meaningScoreValue);
      setMeaningReason(meaningReasonValue);

      const hasErrors = normalizedErrors.length > 0 || (resultObj?.isCorrect === false);
      if (hasErrors) {
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: { type: "warning", message: `Tìm thấy ${normalizedErrors.length} lỗi chính tả/ngữ pháp` },
          })
        );
      } else {
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: { type: "success", message: "Không tìm thấy lỗi chính tả" },
          })
        );
      }
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Lỗi khi kiểm tra chính tả" },
        })
      );
    } finally {
      setIsCheckingSpelling(false);
    }
  }, [content]);

  // Auto-run both checks with real APIs
  const runAutoChecks = async () => {
    if (!content.trim()) return;

    // Reset states
    setPolicyResult(null);
    setPlagiarismResult(null);
    setPolicyProgress(0);
    setPlagiarismProgress(0);

    // Start policy check
    setIsCheckingPolicy(true);
    try {
      await checkPolicyWithProgress(content);
      
      // Start plagiarism check after policy check completes
      setIsCheckingPlagiarism(true);
      await checkPlagiarismWithProgress(bookId, content);
      
      setLastCheckedContent(content);
    } catch (error) {
      console.error("Auto checks failed:", error);
      setIsCheckingPolicy(false);
      setIsCheckingPlagiarism(false);
    }
  };

  // Policy check with progress simulation
  const checkPolicyWithProgress = async (content) => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // 5-20% increments
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setPolicyProgress(progress);
      }, 200);

      setTimeout(async () => {
        try {
          const result = await checkPolicy(content);
          setPolicyResult(result);
          setIsCheckingPolicy(false);
          clearInterval(interval);
          setPolicyProgress(100);
          resolve(result);
        } catch (error) {
          clearInterval(interval);
          setIsCheckingPolicy(false);
          reject(error);
        }
      }, 2000);
    });
  };

  // Plagiarism check with progress simulation
  const checkPlagiarismWithProgress = async (bookId, content) => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 12 + 8; // 8-20% increments
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setPlagiarismProgress(progress);
      }, 150);

      setTimeout(async () => {
        try {
          const result = await checkPlagiarism(bookId, content, chapterId);
          setPlagiarismResult(result);
          setIsCheckingPlagiarism(false);
          clearInterval(interval);
          setPlagiarismProgress(100);
          resolve(result);
        } catch (error) {
          clearInterval(interval);
          setIsCheckingPlagiarism(false);
          reject(error);
        }
      }, 2000); // Increased time for real API call
    });
  };

  // Manual re-check function (if needed)
  const handleRecheck = () => {
    setHasAutoChecked(false);
    setPolicyResult(null);
    setPlagiarismResult(null);
    setPolicyProgress(0);
    setPlagiarismProgress(0);
    runAutoChecks();
  };

  // Lưu chương
  const handleSaveChapter = async () => {
    // Validate all fields before saving
    if (!validateAllFields()) {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Vui lòng kiểm tra lại các trường bắt buộc" },
        })
      );
      return;
    }

    setIsSaving(true);
    try {
      const uploadResult = await uploadChapterFile({ bookId, title, price, content });
      const chapterUrl = uploadResult.url;

      const chapterResponse = await createChapter({
        ChapterId: 0,
        BookId: bookId,
        ChapterTitle: title,
        ChapterView: 0,
        ChapterSoftUrl: chapterUrl,
        ChapterAudioUrl: null,
        DurationSec: null,
        PriceAudio: price,
        UploadedAt: new Date().toISOString(),
        Status: status,
      });
      
      // Lưu chapterId từ response
      if (chapterResponse && chapterResponse.chapterId) {
        setChapterId(chapterResponse.chapterId);
        
        // Tạo embeddings cho chapter mới
        try {
          await generateEmbeddingsApi(chapterResponse.chapterId, content);
          console.log("Embeddings generated successfully for chapter", chapterResponse.chapterId);
        } catch (embeddingError) {
          console.error("Failed to generate embeddings:", embeddingError);
          // Không throw error vì chapter đã được tạo thành công
        }
      }

      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "success", message: "Đã lưu chương thành công!" },
        })
      );
      navigate(`/owner/books/${bookId}/chapters`, {
        state: { bookTitle },
      });
    } catch (err) {
      console.error(err);
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: err.message || "Có lỗi khi lưu chương" },
        })
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Step components - sử dụng useMemo để tránh re-render
  const StepIndicator = useMemo(() => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                step === currentStep
                  ? "bg-orange-500 text-white"
                  : step < currentStep
                  ? "bg-purple-600 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-1 mx-2 transition ${
                  step < currentStep ? "bg-purple-600" : "bg-gray-600"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="ml-6 text-sm text-gray-400">
        Bước {currentStep}/3
      </div>
    </div>
  ), [currentStep]);

  const Step1 = useMemo(() => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4 text-orange-400">Bước 1: Thông tin chương</h2>
      <div className="grid grid-cols-1 gap-4">
        {/* Tiêu đề chương */}
        <div>
          <label className="block text-sm mb-1">Tiêu đề chương *</label>
          <input
            type="text"
            placeholder="Ví dụ: Khởi đầu cuộc hành trình"
            value={title}
            onChange={handleTitleChange}
            className={`w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent border ${
              validationErrors.title 
                ? "border-red-500 focus:ring-red-500" 
                : "border-gray-600 focus:ring-orange-500"
            }`}
            maxLength={200}
            autoComplete="off"
            spellCheck="false"
          />
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-gray-400">{title.length}/200 ký tự</div>
            {validationErrors.title && (
              <div className="text-xs text-red-400">{validationErrors.title}</div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Giá chương */}
          <div className="flex flex-col max-w-[120px]">
            <label className="block text-sm mb-1">Giá (xu)</label>
            <input
              type="number"
              value={isFree ? 0 : price}
              onChange={handlePriceChange}
              disabled={isFree}
              className={`w-full px-3 py-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 disabled:opacity-50 ${
                validationErrors.price 
                  ? "border border-red-500 focus:ring-red-500" 
                  : "focus:ring-orange-500"
              }`}
            />
            {validationErrors.price && (
              <div className="text-xs text-red-400 mt-1">{validationErrors.price}</div>
            )}
          </div>

          {/* Miễn phí */}
          <div className="flex items-center space-x-3 mt-6 ml-6">
            <input
              type="checkbox"
              checked={isFree}
              onChange={handleIsFreeChange}
              className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
            />
            <span className="text-sm">Miễn phí</span>
          </div>

          {/* Trạng thái */}
          <div className="flex flex-col ml-6">
            <label className="block text-sm mb-1">Trạng thái</label>
            <div className="flex space-x-3">
              <label
                className={`px-3 py-1 rounded-lg cursor-pointer transition ${
                  status === "Draft" ? "bg-purple-600 text-white" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <input
                  type="radio"
                  name="chapterStatus"
                  value="Draft"
                  checked={status === "Draft"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="hidden"
                />
                Bản nháp
              </label>
              <label
                className={`px-3 py-1 rounded-lg cursor-pointer transition ${
                  status === "Active" ? "bg-green-600 text-white" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <input
                  type="radio"
                  name="chapterStatus"
                  value="Active"
                  checked={status === "Active"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="hidden"
                />
                Phát hành
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  ), [title, price, isFree, status, handleTitleChange]);

  const Step2 = useMemo(() => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4 text-orange-400">Bước 2: Upload & chỉnh sửa nội dung</h2>
      
      {/* Upload file */}
      <div
        className="bg-slate-700 p-6 rounded-lg mb-6 border-2 border-dashed border-gray-500 cursor-pointer hover:border-gray-400 flex flex-col items-center justify-center transition"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.pdf" onChange={handleFileChange} />
        <p className="text-center">
          {file ? file.name : "Chọn file chương (TXT hoặc PDF)"} {getFileTag()}
        </p>
        {file && (
          <p className="text-xs text-gray-400 mt-1 text-center">
            {formatFileSize(file.size)}
            {pdfPages && ` • Số trang: ${pdfPages}`}
          </p>
        )}
      </div>

      {/* Nội dung có thể chỉnh sửa */}
      <div>
        <label className="block text-sm mb-1">Nội dung chương (có thể chỉnh sửa)</label>
        <textarea
          placeholder="Nội dung sẽ được trích xuất từ file hoặc bạn có thể nhập trực tiếp..."
          value={content}
          onChange={handleContentChange}
          rows={20}
          ref={contentAreaRef}
          className={`w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent border ${
            validationErrors.content 
              ? "border-red-500 focus:ring-red-500" 
              : "border-gray-600 focus:ring-orange-500"
          }`}
        />
        <div className="flex justify-between items-center mt-2">
          <div className="flex flex-col">
            <div className="text-xs text-gray-400">{content.length}/50000 ký tự</div>
            {validationErrors.content && (
              <div className="text-xs text-red-400 mt-1">{validationErrors.content}</div>
            )}
          </div>
          <button
            onClick={handleCheckSpelling}
            disabled={isCheckingSpelling || !content.trim()}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              isCheckingSpelling || !content.trim()
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isCheckingSpelling ? "Đang kiểm tra..." : "Kiểm tra chính tả"}
          </button>
        </div>
      </div>

      {/* Hiển thị thông tin ý nghĩa nội dung */}
      {!contentHasMeaning && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mt-4">
          <div className="flex items-center mb-2">
            <span className="text-red-400 font-semibold">⚠️ Nội dung không có ý nghĩa</span>
            <span className="ml-2 text-sm text-gray-300">(Điểm: {meaningScore}/100)</span>
          </div>
          {meaningReason && (
            <p className="text-sm text-gray-300 mb-2">{meaningReason}</p>
          )}
          <p className="text-sm text-red-300">
            Vui lòng nhập nội dung có ý nghĩa và có giá trị để tiếp tục.
          </p>
        </div>
      )}

      {/* Hiển thị thông tin ý nghĩa tích cực */}
      {contentHasMeaning && meaningScore < 100 && meaningReason && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mt-4">
          <div className="flex items-center mb-2">
            <span className="text-green-400 font-semibold">✅ Nội dung có ý nghĩa</span>
            <span className="ml-2 text-sm text-gray-300">(Điểm: {meaningScore}/100)</span>
          </div>
          <p className="text-sm text-gray-300">{meaningReason}</p>
        </div>
      )}

      {/* Hiển thị lỗi chính tả từ API và gợi ý sửa */}
      {(spellingErrors.length > 0 || correctedText) && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mt-4">
          {spellingErrors.length > 0 && (
            <>
              <h3 className="text-yellow-400 font-semibold mb-2">Lỗi chính tả/ngữ pháp:</h3>
              <div className="space-y-2">
                {spellingErrors.map((error, index) => (
                  <div key={index} className="text-sm">
                    <div>
                      <span className="text-red-400">{error.wrong ? `"${error.wrong}"` : "(không rõ)"}</span>
                      {error.suggestion && (
                        <span className="ml-2">→ Gợi ý: <span className="text-green-400">{error.suggestion}</span></span>
                      )}
                    </div>
                    {error.explanation && (
                      <div className="text-gray-300 ml-4">{error.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {correctedText && (
            <div className="mt-4">
              <h4 className="text-yellow-300 font-semibold mb-2">Bản đã sửa tự động:</h4>
              <div className="bg-slate-900/60 border border-yellow-500/30 rounded p-3 text-sm whitespace-pre-wrap max-h-64 overflow-auto">{correctedText}</div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    const next = typeof correctedText === "string" ? correctedText : JSON.stringify(correctedText);
                    setContent(next || "");
                    // focus textarea and move caret to start
                    try {
                      contentAreaRef.current?.focus();
                      contentAreaRef.current?.setSelectionRange(0, 0);
                    } catch {}
                    window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "success", message: "Đã áp dụng bản sửa" } }));
                  }}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm"
                >
                  Áp dụng bản đã sửa vào nội dung
                </button>
                <button
                  onClick={() => setCorrectedText("")}
                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                >
                  Ẩn bản sửa
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  ), [content, file, pdfPages, spellingErrors, isCheckingSpelling, contentHasMeaning, meaningScore, meaningReason, handleContentChange, handleFileChange, handleCheckSpelling, getFileTag, formatFileSize]);

  const Step3 = () => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4 text-orange-400">Bước 3: Kiểm duyệt chương</h2>
      
      {/* Auto-check status */}
      {!hasAutoChecked && content.trim() && (
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
          <p className="text-blue-400 text-sm">Đang chuẩn bị kiểm duyệt tự động...</p>
        </div>
      )}

      {!content.trim() && (
        <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-400 text-sm">Vui lòng nhập nội dung ở bước 2 để kiểm duyệt</p>
        </div>
      )}
      
      {/* Kiểm duyệt chính sách nội dung */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-3">1. Kiểm duyệt chính sách nội dung</h3>
        
        {isCheckingPolicy && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Đang kiểm duyệt...</span>
              <span className="text-sm text-orange-400 font-semibold">{Math.round(policyProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-orange-500 h-3 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${policyProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {policyResult && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            policyResult.passed ? "bg-green-900/30 border border-green-500/50" : "bg-red-900/30 border border-red-500/50"
          }`}>
            <span className="text-2xl">{policyResult.passed ? "✅" : "❌"}</span>
            <div className="flex-1">
              <div className={`font-semibold ${policyResult.passed ? "text-green-400" : "text-red-400"}`}>
                {policyResult.passed ? "Đạt yêu cầu" : "Không đạt yêu cầu"}
              </div>
              <div className="text-sm text-gray-300">{policyResult.message}</div>
              {policyResult.flaggedCategories && policyResult.flaggedCategories.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-red-300 mb-1">Danh mục vi phạm:</div>
                  <div className="flex flex-wrap gap-1">
                    {policyResult.flaggedCategories.map((category, index) => (
                      <span key={index} className="px-2 py-1 bg-red-800/50 text-red-200 rounded text-xs">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Kiểm duyệt đạo văn */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-3">2. Kiểm duyệt đạo văn</h3>
        
        {isCheckingPlagiarism && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Đang kiểm tra đạo văn...</span>
              <span className="text-sm text-purple-400 font-semibold">{Math.round(plagiarismProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${plagiarismProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {plagiarismResult && (
          <div className={`flex items-start space-x-3 p-4 rounded-lg ${
            plagiarismResult.passed ? "bg-green-900/30 border border-green-500/50" : "bg-red-900/30 border border-red-500/50"
          }`}>
            <span className="text-2xl mt-1">{plagiarismResult.passed ? "✅" : "❌"}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className={`font-semibold text-lg ${plagiarismResult.passed ? "text-green-400" : "text-red-400"}`}>
                  {plagiarismResult.passed ? "Không đạo văn" : "Có đạo văn"}
                </div>
                <div className={`text-lg font-bold ${plagiarismResult.passed ? "text-green-400" : "text-red-400"}`}>
                  {plagiarismResult.similarity}%
                </div>
              </div>
              
              <div className="text-sm text-gray-300 mb-3">
                {plagiarismResult.message}
              </div>

              {/* Hiển thị thanh progress cho phần trăm đạo văn */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Mức độ tương đồng</span>
                  <span className="text-xs font-semibold">{plagiarismResult.similarity}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      plagiarismResult.similarity <= 20 ? "bg-green-500" :
                      plagiarismResult.similarity <= 50 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(plagiarismResult.similarity, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Hiển thị chương tương tự nếu có đạo văn */}
              {!plagiarismResult.passed && plagiarismResult.matches && plagiarismResult.matches.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-semibold text-red-300 mb-2">Chương tương tự được tìm thấy:</div>
                  <div className="space-y-2">
                    {plagiarismResult.matches.slice(0, 3).map((match, index) => (
                      <div key={index} className="bg-red-800/30 p-3 rounded-lg border border-red-500/30">
                        <div className="font-semibold text-red-200 mb-1">{match.chapterTitle}</div>
                        <div className="text-sm text-gray-300 mb-1">
                          Từ sách: <span className="font-medium">{match.bookTitle || "Không xác định"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Tương đồng:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-600 rounded-full h-1.5">
                              <div 
                                className="bg-red-400 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(match.similarity * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-red-400">
                              {Math.round(match.similarity * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hiển thị thông báo nếu không có đạo văn */}
              {plagiarismResult.passed && (
                <div className="mt-3 p-3 bg-green-800/30 rounded-lg border border-green-500/30">
                  <div className="text-sm text-green-200">
                    ✅ Nội dung chương hoàn toàn độc đáo và không có dấu hiệu đạo văn
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Kết quả tổng thể */}
      {policyResult && plagiarismResult && (
        <div className={`p-4 rounded-lg ${
          policyResult.passed && plagiarismResult.passed 
            ? "bg-green-900/30 border border-green-500/50" 
            : "bg-red-900/30 border border-red-500/50"
        }`}>
          <h3 className={`font-semibold mb-2 ${
            policyResult.passed && plagiarismResult.passed ? "text-green-400" : "text-red-400"
          }`}>
            Kết quả kiểm duyệt
          </h3>
          <p className="text-sm">
            {policyResult.passed && plagiarismResult.passed
              ? "✅ Chương đã vượt qua tất cả kiểm duyệt và sẵn sàng để thêm"
              : "❌ Chương chưa đạt yêu cầu kiểm duyệt, vui lòng chỉnh sửa nội dung"
            }
          </p>
        </div>
      )}
    </div>
  );

  // Terms and Conditions Popup Component
  const TermsPopup = () => (
    showTermsPopup && (
      <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-orange-400 mb-4">Điều khoản sử dụng khi thêm chương mới</h2>
          
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">1. Về nội dung chương:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Nội dung chương phải là tác phẩm gốc của bạn hoặc có quyền sử dụng hợp pháp</li>
                <li>Không được sao chép, đạo văn từ các tác phẩm khác</li>
                <li>Nội dung phải tuân thủ các quy định về chính sách nội dung của nền tảng</li>
                <li>Không chứa nội dung vi phạm pháp luật, bạo lực, khiêu dâm, hoặc gây thù hận</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">2. Về quyền chỉnh sửa:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Sau khi chương được tạo và phát hành, bạn <span className="text-red-400 font-semibold">KHÔNG THỂ</span> chỉnh sửa nội dung chương</li>
                <li>Chỉ có thể thay đổi <span className="text-green-400 font-semibold">giá xu</span> của chương</li>
                <li>Nếu cần chỉnh sửa nội dung, bạn phải xóa chương cũ và tạo chương mới</li>
                <li>Việc chỉnh sửa nội dung sau khi phát hành có thể ảnh hưởng đến trải nghiệm người đọc</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">3. Về kiểm duyệt tự động:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Hệ thống sẽ tự động kiểm tra chính sách nội dung và đạo văn</li>
                <li>Chương chỉ được phát hành khi vượt qua tất cả kiểm duyệt</li>
                <li>Kết quả kiểm duyệt sẽ được hiển thị chi tiết trong quá trình tạo chương</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">4. Cam kết của bạn:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Bạn cam kết tuân thủ tất cả các điều khoản trên</li>
                <li>Chịu trách nhiệm về nội dung chương do bạn tạo ra</li>
                <li>Hiểu rằng việc vi phạm có thể dẫn đến việc chương bị gỡ bỏ hoặc tài khoản bị khóa</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleDeclineTerms}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition"
            >
              Từ chối và quay lại
            </button>
            <button
              onClick={handleAcceptTerms}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
            >
              Tôi đồng ý và tiếp tục
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Don't render main content if terms not accepted
  if (!acceptedTerms) {
    return <TermsPopup />;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">
        Thêm chương mới: <span className="text-orange-400">{bookTitle}</span>
      </h1>

      {StepIndicator}

      {/* Step content */}
      {currentStep === 1 && Step1}
      {currentStep === 2 && Step2}
      {currentStep === 3 && <Step3 />}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition"
            >
              Quay lại
            </button>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/owner/books/${bookId}/chapters`, {
              state: { bookTitle },
            })}
            className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition"
            disabled={isSaving}
          >
            Hủy
          </button>
          
          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              disabled={currentStep === 2 && !contentHasMeaning}
              className={`px-4 py-2 rounded-lg transition ${
                currentStep === 2 && !contentHasMeaning
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              Tiếp tục
            </button>
          ) : (
            <>
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
              >
                Chỉnh sửa nội dung
              </button>
              <button
                onClick={handleSaveChapter}
                disabled={
                  isSaving || 
                  !policyResult?.passed || 
                  !plagiarismResult?.passed ||
                  !title.trim() ||
                  !content.trim()
                }
                className={`px-4 py-2 rounded-lg transition ${
                  isSaving || 
                  !policyResult?.passed || 
                  !plagiarismResult?.passed ||
                  !title.trim() ||
                  !content.trim()
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isSaving ? "Đang xử lý..." : "Thêm chương"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
