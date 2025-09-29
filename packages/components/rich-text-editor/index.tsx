import { useEffect, useRef, useState } from "react";
// @ts-ignore
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) {
  const [editorValue, setEditorValue] = useState(value || "");
  const quillRef = useRef(false);

  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = true;

      // Remove duplicate toolbars (ReactQuill sometimes injects multiple)
      setTimeout(() => {
        document.querySelectorAll(".ql-toolbar").forEach((toolbar, index) => {
          if (index > 0) toolbar.remove();
        });
      }, 100);
    }
  }, []);

  return (
    <div className="relative">
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={(content) => {
          setEditorValue(content);
          onChange(content);
        }}
        modules={{
          toolbar: [
            [{ font: [] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ size: ["small", "false", "large", "huge"] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ script: "sub" }, { script: "super" }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ align: [] }],
            ["blockquote", "code-block"],
            ["link", "image", "video"],
            ["clean"],
          ],
        }}
        placeholder="Write a detailed product description here..."
        className="bg-transparent border border-gray-700 text-white rounded-md focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-300"
        style={{ minHeight: "250px" }}
      />

      <style>
        {`
        /* Toolbar */
        .ql-toolbar {
          background: #1f2937; /* dark gray */
          border: 1px solid #374151;
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          padding: 6px;
          transition: background 0.3s ease;
        }
        .ql-toolbar button:hover {
          background: #374151 !important;
          border-radius: 4px;
        }

        /* Editor container */
        .ql-container {
          background: #111827 !important;
          border: 1px solid #374151 !important;
          border-top: none !important;
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          color: white;
          transition: border 0.3s ease;
        }

        /* Editor text */
        .ql-editor {
          min-height: 200px;
          font-size: 0.95rem;
          line-height: 1.5;
          padding: 12px;
        }

        /* Placeholder */
        .ql-editor.ql-blank::before {
          color: #9ca3af !important;
          font-style: italic;
        }

        /* Dropdowns & pickers */
        .ql-picker {
          color: white !important;
        }
        .ql-picker-options {
          background: #1f2937 !important;
          border: 1px solid #374151 !important;
        }
        .ql-picker-item {
          color: white !important;
        }
        .ql-picker-item:hover {
          background: #374151 !important;
        }

        /* Icons */
        .ql-stroke {
          stroke: white !important;
        }
        .ql-fill {
          fill: white !important;
        }
      `}
      </style>
    </div>
  );
}
