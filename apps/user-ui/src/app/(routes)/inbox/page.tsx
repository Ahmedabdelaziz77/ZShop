"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "apps/user-ui/src/context/web-socket-context";
import useRequireAuth from "apps/user-ui/src/hooks/useRequiredAuth";
import ChatInput from "apps/user-ui/src/shared/components/chats/chat-input";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { isProtected } from "apps/user-ui/src/utils/protected";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function InboxContent() {
  const searchParams = useSearchParams();
  const { user } = useRequireAuth();
  const router = useRouter();
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const conversationId = searchParams.get("conversationId");

  const { ws } = useWebSocket();

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId || hasFetchedOnce) return [];
      const res = await axiosInstance.get(
        `/chatting/api/get-user-messages/${conversationId}?page=1`,
        isProtected
      );
      setPage(1);
      setHasMore(res.data.hasMore);
      setHasFetchedOnce(true);
      return res.data.messages.reverse();
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  });

  const loadMoreMessages = async () => {
    const nextPage = page + 1;
    const res = await axiosInstance.get(
      `/chatting/api/get-user-messages/${conversationId}?page=${nextPage}`,
      isProtected
    );
    queryClient.setQueryData(["messages", conversationId], (old: any = []) => [
      ...res.data.messages.reverse(),
      ...old,
    ]);
    setPage(nextPage);
    setHasMore(res.data.hasMore);
  };

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/chatting/api/get-user-conversations",
        isProtected
      );
      return res.data.conversations;
    },
  });

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

  const getLastMessage = (c: any) => c?.lastMessage || "";

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    });
  };

  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;
    const payload = {
      fromUserId: user?.id,
      toUserId: selectedChat?.seller?.id,
      conversationId: selectedChat?.conversationId,
      messageBody: message,
      senderType: "user",
    };

    ws?.send(JSON.stringify(payload));

    setMessage("");
    scrollToBottom();
  };

  const handleChatSelect = async (c: any) => {
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
        conversationId,
      })
    );
  };
  return (
    <div className="w-full">
      <div className="md:w-[80%] mx-auto pt-5">
        <div className="flex h-[80vh] shadow-sm overflow-hidden">
          <div className="w-[320px] border-r border-r-gray-200 bg-gray-50">
            <div className="p-4 border-b border-b-gray-200 text-lg font-semibold text-gray-800">
              Messages
            </div>
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-500">Loading ...</div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  No Conversations!
                </div>
              ) : (
                chats.map((c) => {
                  const isActive =
                    selectedChat?.conversationId === c.conversationId;
                  return (
                    <button
                      key={c?.conversationId}
                      className={`w-full text-left px-4 py-3 transition hover:bg-blue-50 ${
                        isActive ? "bg-blue-100" : ""
                      }`}
                      onClick={() => handleChatSelect(c)}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={
                            c?.seller?.avatar ||
                            "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                          }
                          alt={c?.seller?.name}
                          width={36}
                          height={36}
                          className="rounded-full border w-[40px] h-[40px] object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-800 font-semibold">
                              {c?.seller?.name}
                            </span>
                            {c?.seller?.isOnline && (
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 truncate max-w-[170px]">
                              {getLastMessage(c)}
                            </p>
                            {c?.unreadCount > 0 && (
                              <span className="ml-2 text-[10px] px-2 py-[2px] rounded-full bg-blue-600 text-white">
                                {c?.unreadCount > 9 ? "9+" : c?.unreadCount}
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
          <div className="flex flex-col flex-1 bg-gray-100">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-b-gray-200 bg-white flex items-center gap-3">
                  <Image
                    src={
                      selectedChat?.seller?.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                    }
                    alt={selectedChat?.seller?.name}
                    width={40}
                    height={40}
                    className="rounded-full border w-[40px] h-[40px] object-cover border-gray-200"
                  />
                  <div>
                    <h2 className="text-gray-800 font-semibold text-base">
                      {selectedChat?.seller?.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedChat?.seller?.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto px-6 py-6 space-y-4 text-sm"
                >
                  {hasMore && (
                    <div className="flex justify-center mb-2">
                      <button
                        onClick={loadMoreMessages}
                        className="text-xs px-4 py-1 bg-gray-200 hover:bg-gray-300"
                      >
                        Load previous messages
                      </button>
                    </div>
                  )}
                  {messages.map((message: any, i: number) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        message.senderType === "user"
                          ? "items-end ml-auto"
                          : "items-start"
                      } max-w-[80%]`}
                    >
                      <div
                        className={`${
                          message.senderType === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-800"
                        } px-4 py-2 rounded-lg shadow-sm w-fit`}
                      >
                        {message.text || message.content}
                      </div>
                      <div
                        className={`text-[11px] text-gray-400 mt-1 flex items-center gap-1 ${
                          message.senderType === "user"
                            ? "mr-1 justify-end"
                            : "ml-1"
                        }`}
                      >
                        {message.time ||
                          new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </div>
                    </div>
                  ))}
                  <div ref={scrollAnchorRef} />
                </div>
                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  onSendMessage={handleSend}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center text-sm justify-center text-gray-400">
                Select a Conversation to start chatting
              </div>
            )}
          </div>
        </div>
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
