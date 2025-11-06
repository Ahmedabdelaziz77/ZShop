import { PickerProps } from "emoji-picker-react";
import { ImageIcon, Send, Smile } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useState } from "react";

const EmojiPicker = dynamic(
  () =>
    import("emoji-picker-react").then(
      (mod) => mod.default as React.FC<PickerProps>
    ),
  { ssr: true }
);

export default function ChatInput({
  message,
  setMessage,
  onSendMessage,
}: {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  onSendMessage: (e: any) => void;
}) {
  const [showEmoji, setShowEmoji] = useState(false);

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log("uploading file...");
  };

  return (
    <form
      onSubmit={onSendMessage}
      className="relative flex items-center gap-3 px-4 py-3 border-t border-gray-800 bg-gray-900/70 backdrop-blur-lg"
    >
      {/* Upload Image */}
      <label className="cursor-pointer p-2 rounded-lg hover:bg-gray-800 transition">
        <ImageIcon className="w-5 h-5 text-gray-300 hover:text-teal-400 transition" />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          hidden
        />
      </label>

      {/* Emoji Picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowEmoji((prev) => !prev)}
          className="p-2 rounded-lg hover:bg-gray-800 transition"
        >
          <Smile className="w-5 h-5 text-gray-300 hover:text-yellow-400 transition" />
          {""}
        </button>
        {showEmoji && (
          <div className="absolute bottom-12 left-0 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
      </div>

      {/* Text Input */}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 text-sm bg-gray-800 border border-gray-700 text-gray-100 rounded-full outline-none focus:ring-2 focus:ring-teal-500 transition"
      />

      {/* Send Button */}
      <button
        type="submit"
        className="p-2.5 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 transition shadow-md hover:shadow-teal-500/30"
      >
        <Send className="w-4 h-4 text-white" />
        {""}
      </button>
    </form>
  );
}
