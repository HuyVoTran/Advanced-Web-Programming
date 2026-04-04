import React, { useEffect, useMemo, useState } from 'react';
import { MessageCircle, SendHorizonal } from 'lucide-react';
import adminApi from '@/services/adminApi';
import { notify } from '@/utils/notifications';

export const AdminChat: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const selectedConversationId = useMemo(
    () => String(selectedConversation?.id || selectedConversation?._id || ''),
    [selectedConversation]
  );

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllChats('open');
      const list = Array.isArray(data) ? data : [];
      setConversations(list);
      if (list.length > 0 && !selectedConversationId) {
        setSelectedConversation(list[0]);
      }
    } catch (error) {
      notify.error('Không thể tải danh sách hội thoại');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data: any = await adminApi.getChatMessages(conversationId);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
      if (data?.conversation) {
        setSelectedConversation(data.conversation);
      }
    } catch (error) {
      notify.error('Không thể tải tin nhắn');
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedConversationId) return;
    loadMessages(selectedConversationId);
  }, [selectedConversationId]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!selectedConversationId || !content) return;

    try {
      setSending(true);
      const message = await adminApi.sendChatMessage(selectedConversationId, content);
      setMessages((prev) => [...prev, message]);
      setDraft('');
      loadConversations();
    } catch (error) {
      notify.error('Không gửi được tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversationId) return;
    try {
      await adminApi.updateChatStatus(selectedConversationId, 'closed');
      notify.success('Đã đóng hội thoại');
      setMessages([]);
      setSelectedConversation(null);
      loadConversations();
    } catch (error) {
      notify.error('Không thể đóng hội thoại');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl tracking-wide">Live Chat khách hàng</h1>
        <p className="text-gray-500 mt-1">Tư vấn trực tiếp và chăm sóc khách hàng theo thời gian thực (polling MVP).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-lg">Hội thoại mở</h2>
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {loading ? (
              <p className="p-4 text-sm text-gray-500">Đang tải hội thoại...</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">Chưa có hội thoại nào.</p>
            ) : (
              conversations.map((item) => {
                const isActive = String(item.id || item._id) === selectedConversationId;
                return (
                  <button
                    key={item.id || item._id}
                    onClick={() => setSelectedConversation(item)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                      isActive ? 'bg-[#C9A24D]/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-900">{item.user?.fullName || 'Khách hàng'}</p>
                      {!!item.unreadCount && (
                        <span className="min-w-5 h-5 px-1 rounded-full bg-[#C9A24D] text-white text-[11px] inline-flex items-center justify-center">
                          {item.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.lastMessagePreview || 'Chưa có tin nhắn'}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#C9A24D]" />
              <div>
                <h2 className="text-lg">{selectedConversation?.user?.fullName || 'Chọn hội thoại'}</h2>
                <p className="text-xs text-gray-500">{selectedConversation?.user?.email || ''}</p>
              </div>
            </div>
            {selectedConversationId && (
              <button
                type="button"
                onClick={handleCloseConversation}
                className="border border-red-300 text-red-600 px-3 py-1.5 text-xs uppercase tracking-wide rounded hover:bg-red-50"
              >
                Đóng chat
              </button>
            )}
          </div>

          <div className="h-[460px] overflow-y-auto p-5 bg-gray-50 space-y-3">
            {!selectedConversationId ? (
              <p className="text-sm text-gray-500">Chọn một hội thoại để phản hồi khách hàng.</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có tin nhắn nào trong hội thoại này.</p>
            ) : (
              messages.map((item) => {
                const mine = item.senderRole === 'admin';
                return (
                  <div key={item._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm ${
                        mine ? 'bg-[#111827] text-white' : 'bg-white border border-gray-200 text-gray-700'
                      }`}
                    >
                      <p>{item.content}</p>
                      <p className={`mt-1 text-[11px] ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-4 flex items-center gap-3">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSend();
                }
              }}
              disabled={!selectedConversationId}
              placeholder="Nhập phản hồi cho khách hàng..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#C9A24D] disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!selectedConversationId || sending || !draft.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C9A24D] px-4 py-2 text-sm text-white hover:bg-[#b8923f] disabled:opacity-50"
            >
              <SendHorizonal className="w-4 h-4" />
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};