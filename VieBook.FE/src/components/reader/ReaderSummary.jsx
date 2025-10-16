import React, { useState } from "react";
import { RiCloseLine, RiFileTextLine, RiLoader4Line } from "react-icons/ri";
import { summarizeContent } from "../../api/openAiApi";

export default function ReaderSummary({ 
  chapterContent, 
  chapterTitle, 
  onClose 
}) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    try {
      setIsLoading(true);
      console.log("ReaderSummary - Starting summarization for:", chapterTitle);
      
      // Call OpenAI API to summarize content
      const result = await summarizeContent(chapterContent, chapterTitle);
      console.log("ReaderSummary - API response:", result);
      
      if (result && result.summary) {
        setSummary(`
          <h3 class="text-lg font-semibold mb-3">Tóm tắt chương: ${chapterTitle}</h3>
          <div class="prose prose-sm max-w-none text-gray-300">
            ${result.summary}
          </div>
        `);
      } else {
        setSummary("<p class='text-yellow-500'>Không thể tạo tóm tắt cho nội dung này.</p>");
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary(`
        <div class="text-red-500">
          <p class="font-semibold">Lỗi khi tạo tóm tắt:</p>
          <p class="text-sm mt-2">${error.message || "Vui lòng thử lại sau."}</p>
          <p class="text-xs mt-2 text-gray-400">Nếu lỗi vẫn tiếp tục, vui lòng liên hệ hỗ trợ.</p>
        </div>
      `);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      {/* Popup */}
      <div className="relative bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <RiFileTextLine /> Tóm tắt nội dung
            </h3>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <RiCloseLine size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!summary && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-300 mb-4">Nhấn nút bên dưới để tạo tóm tắt nội dung chương</p>
              <button
                onClick={handleSummarize}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <RiFileTextLine size={20} />
                Tạo tóm tắt
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-3">
                <RiLoader4Line className="animate-spin text-orange-500" size={24} />
                <span className="text-gray-300">Đang tạo tóm tắt...</span>
              </div>
            </div>
          )}

          {summary && !isLoading && (
            <div 
              className="prose prose-lg max-w-none text-gray-300"
              dangerouslySetInnerHTML={{ __html: summary }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
