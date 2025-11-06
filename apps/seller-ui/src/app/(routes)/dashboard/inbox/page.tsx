"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "apps/seller-ui/src/context/web-socket-context";
import useSeller from "apps/seller-ui/src/hooks/useSeller";
import ChatInput from "apps/seller-ui/src/shared/components/chats/chat-input";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function InboxContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { seller } = useSeller();
  const { ws } = useWebSocket();

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  const conversationId = searchParams.get("conversationId");
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  /** Fetch messages */
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId || hasFetchedOnce) return [];
      const res = await axiosInstance.get(
        `/chatting/api/get-seller-messages/${conversationId}?page=1`
      );
      setPage(1);
      setHasMore(res.data.hasMore);
      setHasFetchedOnce(true);
      return res.data.messages.reverse();
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  });

  /** Load more on scroll */
  const loadMoreMessages = async () => {
    const nextPage = page + 1;
    const res = await axiosInstance.get(
      `/chatting/api/get-seller-messages/${conversationId}?page=${nextPage}`
    );
    queryClient.setQueryData(["messages", conversationId], (old: any = []) => [
      ...res.data.messages.reverse(),
      ...old,
    ]);
    setPage(nextPage);
    setHasMore(res.data.hasMore);
  };

  /** Fetch conversations */
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/chatting/api/get-seller-conversations"
      );
      return res.data.conversations;
    },
  });

  useEffect(() => {
    if (conversations) setChats(conversations);
  }, [conversations]);

  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.conversationId === conversationId);
      setSelectedChat(chat);
    }
  }, [conversationId, chats]);

  useEffect(() => {
    if (messages?.length > 0) scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    });
  };

  /** Handle WebSocket messages */
  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event: any) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_MESSAGE") {
        const newMessage = data.payload;
        if (newMessage.conversationId === conversationId)
          queryClient.setQueryData(
            ["messages", conversationId],
            (old: any = []) => [
              ...old,
              {
                content: newMessage.messageBody || newMessage.content || "",
                senderType: newMessage.senderType,
                seen: false,
                createdAt: newMessage.createdAt || new Date().toISOString(),
              },
            ]
          );
        scrollToBottom();
        setChats((prev) =>
          prev.map((chat) =>
            chat.conversationId === newMessage.conversationId
              ? { ...chat, lastMessage: newMessage.content }
              : chat
          )
        );
      }

      if (data.type === "UNSEEN_COUNT_UPDATE") {
        const { conversationId, count } = data.payload;
        setChats((prev) =>
          prev.map((chat) =>
            chat.conversationId === conversationId
              ? { ...chat, unreadCount: count }
              : chat
          )
        );
      }
    };
  }, [ws, conversationId]);

  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.conversationId === conversationId);
      setSelectedChat(chat || null);
    }
  }, [conversationId, chats]);

  /** Select conversation */
  const handleChatSelect = (c: any) => {
    setHasFetchedOnce(false);
    setChats((prev) =>
      prev.map((chat) =>
        chat.conversationId === c.conversationId
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    );
    router.push(`?conversationId=${c.conversationId}`);

    ws?.send(
      JSON.stringify({
        type: "MARK_AS_SEEN",
        conversationId: c.conversationId,
      })
    );
  };

  /** Send message */
  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    const payload = {
      fromUserId: seller?.id,
      toUserId: selectedChat?.user?.id,
      conversationId: selectedChat?.conversationId,
      messageBody: message,
      senderType: "seller",
    };

    ws?.send(JSON.stringify(payload));

    setMessage("");
    scrollToBottom();
  };

  return (
    <div className="w-full min-h-screen bg-gray-950 text-gray-100 flex">
      {/* SIDEBAR */}
      <div className="w-[320px] border-r border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-800 text-lg font-semibold tracking-wide">
          💬 Messages
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-800 custom-scroll">
          {isLoading ? (
            <div className="text-center py-6 text-gray-400">Loading...</div>
          ) : chats.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No conversations yet
            </div>
          ) : (
            chats.map((chat) => {
              const isActive =
                selectedChat?.conversationId === chat.conversationId;
              return (
                <button
                  key={chat.conversationId}
                  onClick={() => handleChatSelect(chat)}
                  className={`w-full text-left px-4 py-3 transition-all duration-200 ${
                    isActive
                      ? "bg-blue-950/60 border-l-4 border-blue-600"
                      : "hover:bg-gray-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={
                        chat.user?.avatar?.[0] ||
                        "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                      }
                      alt={chat.user?.name}
                      width={40}
                      height={40}
                      className="rounded-full border border-gray-800 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate text-gray-100">
                          {chat.user?.name}
                        </span>
                        {chat.user?.isOnline && (
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <p className="truncate max-w-[150px]">
                          {chat.lastMessage || "No messages yet"}
                        </p>
                        {chat?.unreadCount > 0 && (
                          <span className="ml-2 text-[10px] px-2 py-[2px] rounded-full bg-blue-600 text-white">
                            {chat?.unreadCount > 9 ? "9+" : chat?.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* CHAT CONTENT */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-950 to-gray-900">
        {selectedChat ? (
          <>
            {/* HEADER */}
            <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center gap-3 shadow-sm">
              <Image
                src={
                  selectedChat.user?.avatar?.[0] ||
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                }
                alt={selectedChat.user?.name}
                width={42}
                height={42}
                className="rounded-full border border-gray-700 object-cover"
              />
              <div>
                <h2 className="font-semibold text-base text-white">
                  {selectedChat.user?.name}
                </h2>
                <p className="text-xs text-gray-400">
                  {selectedChat.user?.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            {/* MESSAGES */}
            <div
              className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scroll"
              ref={messageContainerRef}
            >
              {hasMore && (
                <div className="flex justify-center mb-2">
                  <button
                    onClick={loadMoreMessages}
                    className="text-xs px-4 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                  >
                    Load previous messages
                  </button>
                </div>
              )}
              {messages.map((msg: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.senderType === "seller"
                      ? "items-end ml-auto"
                      : "items-start"
                  } max-w-[75%]`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl shadow-sm w-fit leading-relaxed ${
                      msg.senderType === "seller"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-100"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
              <div ref={scrollAnchorRef} />
            </div>

            {/* INPUT */}
            <div className="border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm p-3">
              <ChatInput
                message={message}
                setMessage={setMessage}
                onSendMessage={handleSend}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Select a conversation to start chatting 💬
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <InboxContent />
    </Suspense>
  );
}
