import React, { useEffect, useMemo, useState } from 'react';
import { MessageCircle, SendHorizonal } from 'lucide-react';
import { UserDashboardLayout } from '@/app/components/shared/UserDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { chatAPI } from '@/services/api';
import { notify } from '@/utils/notifications';

export const UserChat: React.FC = () => {
  const { token } = useAuth();
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const conversationId = useMemo(() => String(conversation?.id || conversation?._id || ''), [conversation]);

  const loadMessages = async (cid: string, authToken: string) => {
    const data: any = await chatAPI.getMessages(cid, authToken);
    setMessages(Array.isArray(data?.messages) ? data.messages : []);
    setConversation(data?.conversation || conversation);
  };

  const bootstrapConversation = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const conversations: any = await chatAPI.getMyConversations(token);
      const first = Array.isArray(conversations) && conversations.length > 0 ? conversations[0] : null;

      if (first) {
        setConversation(first);
        await loadMessages(String(first.id || first._id), token);
      } else {
        const created: any = await chatAPI.createOrGetMyConversation({ subject: 'Tư vấn sản phẩm' }, token);
        setConversation(created);
        await loadMessages(String(created?.id || created?._id), token);
      }
    } catch (error) {
      notify.error('Không thể tải chat hỗ trợ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrapConversation();
  }, [token]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!token || !conversationId || !content) return;

    try {
      setSending(true);
      const message = await chatAPI.sendMessage(conversationId, content, token);
      setMessages((prev) => [...prev, message]);
      setDraft('');
    } catch (error) {
      notify.error('Không gửi được tin nhắn');
    } finally {
      setSending(false);
    }
  };

  return (
    <UserDashboardLayout
      title="Chat hỗ trợ"
      subtitle="Nhắn với admin để được tư vấn chọn hàng hoặc hỗ trợ đơn hàng"
      icon={MessageCircle}
      backTo="/dashboard"
      backLabel="Quay lại Dashboard"
    >
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg">Salvio Care</h2>
          <p className="text-sm text-gray-500">Admin sẽ phản hồi sớm nhất có thể.</p>
        </div>

        <div className="h-[420px] overflow-y-auto px-6 py-5 space-y-3 bg-gray-50">
          {loading ? (
            <p className="text-sm text-gray-500">Đang tải hội thoại...</p>
          ) : messages.length === 0 ? (
            <div className="text-sm text-gray-500">Chưa có tin nhắn nào, hãy bắt đầu cuộc trò chuyện.</div>
          ) : (
            messages.map((item) => {
              const mine = item.senderRole === 'user';
              return (
                <div key={item._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      mine ? 'bg-[#C9A24D] text-white' : 'bg-white border border-gray-200 text-gray-700'
                    }`}
                  >
                    <p>{item.content}</p>
                    <p className={`mt-1 text-[11px] ${mine ? 'text-white/80' : 'text-gray-400'}`}>
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
            placeholder="Nhập nội dung cần hỗ trợ..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#C9A24D]"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !draft.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#C9A24D] px-4 py-2 text-sm text-white hover:bg-[#b8923f] disabled:opacity-50"
          >
            <SendHorizonal className="w-4 h-4" />
            Gửi
          </button>
        </div>
      </div>
    </UserDashboardLayout>
  );
};