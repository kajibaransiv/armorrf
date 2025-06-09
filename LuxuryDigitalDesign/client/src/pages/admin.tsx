import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatMessage, insertChatMessageSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Clock, User, CheckCheck, Eye, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useRef, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { z } from "zod";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Query all messages for admin view
  const { data: allMessages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages'],
    queryFn: () => apiRequest('GET', '/api/chat/messages').then(res => res.json()),
  });

  // Query unread count
  const { data: unreadData } = useQuery({
    queryKey: ['/api/chat/unread-count'],
    queryFn: () => apiRequest('GET', '/api/chat/unread-count').then(res => res.json()),
  });

  // Mutation to mark message as read
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: number) => 
      apiRequest('PATCH', `/api/chat/messages/${messageId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/unread-count'] });
    },
  });

  // Mutation to send admin reply
  const sendReplyMutation = useMutation({
    mutationFn: (messageData: z.infer<typeof insertChatMessageSchema>) =>
      apiRequest('POST', '/api/chat/messages', messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/unread-count'] });
      setReplyMessage("");
    },
  });

  // Handle sending admin reply
  const handleSendReply = () => {
    if (!replyMessage.trim() || !selectedSession) return;

    const messageData = {
      sessionId: selectedSession,
      message: replyMessage.trim(),
      senderType: "admin",
    };

    sendReplyMutation.mutate(messageData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  // Group messages by session
  const sessionGroups = allMessages.reduce((acc: Record<string, ChatMessage[]>, message: ChatMessage) => {
    if (!acc[message.sessionId]) {
      acc[message.sessionId] = [];
    }
    acc[message.sessionId].push(message);
    return acc;
  }, {});

  // Sort sessions by most recent activity
  const sortedSessions = Object.entries(sessionGroups).sort(([, a], [, b]) => {
    const latestA = Math.max(...(a as ChatMessage[]).map(m => new Date(m.createdAt).getTime()));
    const latestB = Math.max(...(b as ChatMessage[]).map(m => new Date(m.createdAt).getTime()));
    return latestB - latestA;
  });

  const selectedMessages = selectedSession ? sessionGroups[selectedSession] || [] : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage customer communications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{allMessages.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Unread Messages</CardTitle>
              <Eye className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{unreadData?.count || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Sessions</CardTitle>
              <User className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{Object.keys(sessionGroups).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session List */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Customer Sessions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {sortedSessions.map(([sessionId, messages]) => {
                  const lastMessage = (messages as ChatMessage[])[messages.length - 1];
                  const unreadCount = (messages as ChatMessage[]).filter(m => !m.isRead).length;
                  const hasCustomerMessages = (messages as ChatMessage[]).some(m => m.senderType === 'customer');
                  
                  return (
                    <div
                      key={sessionId}
                      onClick={() => setSelectedSession(sessionId)}
                      className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${
                        selectedSession === sessionId ? 'bg-gray-800' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">
                            {hasCustomerMessages ? lastMessage.customerEmail || 'Anonymous' : 'Internal Session'}
                          </h3>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {lastMessage.message}
                      </p>
                    </div>
                  );
                })}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message View */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">
                  {selectedSession ? `Session: ${selectedSession}` : 'Select a session'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSession ? (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                      {(selectedMessages as ChatMessage[])
                        .sort((a: ChatMessage, b: ChatMessage) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        .map((message: ChatMessage) => (
                        <div key={message.id} className="space-y-2">
                          <div className={`flex ${message.senderType === 'customer' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${
                              message.senderType === 'customer'
                                ? 'bg-gray-800 text-white' 
                                : 'bg-white text-black'
                            }`}>
                              <p className="text-sm">{message.message}</p>
                              <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                                <span>
                                  {message.senderType === 'customer'
                                    ? message.customerEmail || 'Customer' 
                                    : 'Admin'
                                  }
                                </span>
                                <div className="flex items-center gap-2">
                                  <span>
                                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                  </span>
                                  {!message.isRead && message.senderType === 'customer' && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => markAsReadMutation.mutate(message.id)}
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                    >
                                      <CheckCheck className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {selectedSession && (
                    <div className="mt-4 flex gap-2">
                      <Input
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={sendReplyMutation.isPending}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 flex-1"
                      />
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim() || sendReplyMutation.isPending}
                        size="sm"
                        className="bg-white text-black hover:bg-gray-100"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                ) : (
                  <div className="h-[600px] flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a customer session to view messages</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}