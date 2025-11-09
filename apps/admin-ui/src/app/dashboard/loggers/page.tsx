"use client";

import BreadCrumbs from "apps/admin-ui/src/shared/components/breadCrumbs";
import { Download, Terminal, Filter } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type LogType = "success" | "error" | "warning" | "info" | "debug";

type LogItem = {
  type: LogType;
  message: string;
  timestamp: string;
  source?: string;
};

const typeColorMap: Record<LogType, string> = {
  success: "text-emerald-400",
  error: "text-red-400",
  warning: "text-yellow-300",
  info: "text-blue-300",
  debug: "text-gray-400",
};

export default function Page() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<LogType | "all">("all");
  const [search, setSearch] = useState("");
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_SOCKET_URI!);

    socket.onmessage = (event: any) => {
      try {
        const parsed = JSON.parse(event.data);
        setLogs((prev) => [...prev, parsed]);
      } catch (err) {
        console.error("Invalid log format", err);
      }
    };

    return () => socket.close();
  }, []);

  // Auto-scroll and filtering logic
  useEffect(() => {
    const visibleLogs =
      activeFilter === "all"
        ? logs
        : logs.filter((log) => log.type === activeFilter);

    const searched = visibleLogs.filter(
      (log) =>
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        log.source?.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredLogs(searched);

    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, activeFilter, search]);

  // Keyboard filter shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "1") setActiveFilter("error");
      else if (e.key === "2") setActiveFilter("success");
      else if (e.key === "3") setActiveFilter("warning");
      else if (e.key === "4") setActiveFilter("info");
      else if (e.key === "5") setActiveFilter("debug");
      else if (e.key === "0") setActiveFilter("all");
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Download logs
  const downloadLogs = () => {
    const content = filteredLogs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toLocaleTimeString()}] ${
            log.source
          } [${log.type.toUpperCase()}] ${log.message}`
      )
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "application-logs.log";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-gray-100 font-mono p-8 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-emerald-900/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-wide flex items-center gap-2">
              <Terminal className="text-blue-400 w-6 h-6" />
              Application Logs
            </h2>
            <div className="mt-1">
              <BreadCrumbs title="Application Logs" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-900 text-sm pl-8 pr-3 py-2 rounded-md border border-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 outline-none transition-all duration-200"
              />
            </div>

            <button
              onClick={downloadLogs}
              className="flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700 transition-colors duration-300 px-3 py-2 rounded-md shadow-md"
            >
              <Download size={15} />
              Download
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 animate-slideUp">
          {["all", "error", "success", "warning", "info", "debug"].map(
            (type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type as LogType | "all")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all duration-200 ${
                  activeFilter === type
                    ? "bg-blue-600 text-white shadow-md scale-105"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {type}
              </button>
            )
          )}
        </div>

        {/* Log Container */}
        <div
          ref={logContainerRef}
          className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-4 h-[600px] overflow-y-auto shadow-inner custom-scrollbar transition-all duration-300"
        >
          {filteredLogs.length === 0 ? (
            <p className="text-gray-500 italic animate-pulse">
              Waiting for logs ...
            </p>
          ) : (
            filteredLogs.map((log, i) => (
              <div
                key={i}
                className={`whitespace-pre-wrap py-0.5 rounded transition-all duration-200 hover:bg-white/5 ${
                  log.type === "error" ? "animate-logFlashError" : ""
                }`}
              >
                <span className="text-gray-500">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>{" "}
                <span className="text-purple-400">{log.source}</span>{" "}
                <span className={typeColorMap[log.type]}>
                  [{log.type.toUpperCase()}]
                </span>{" "}
                <span>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
