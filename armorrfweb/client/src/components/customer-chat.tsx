import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatMessage, insertChatMessageSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Minimize2, Maximize2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSessionId } from "@/lib/hooks";
import { z } from "zod";

export default function CustomerChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const sessionId = useSessionId();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Query messages for this session
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/chat/messages', sessionId],
    queryFn: () => apiRequest('GET', `/api/chat/messages?sessionId=${sessionId}`).then(res => res.json()),
    enabled: isOpen,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: z.infer<typeof insertChatMessageSchema>) =>
      apiRequest('POST', '/api/chat/messages', messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', sessionId] });
      setMessage("");
    },
  });

  // WebSocket connection for real-time messaging
  useEffect(() => {
    if (isOpen && !wsRef.current) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', sessionId] });
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen, queryClient, sessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const messageData = {
      sessionId,
      message: message.trim(),
      senderType: "customer",
      customerEmail: customerEmail || undefined,
    };

    sendMessageMutation.mutate(messageData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Chat toggle button
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-white text-black hover:bg-gray-100 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`bg-gray-900 border-gray-700 shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-80 h-96'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm">
              Customer Support
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex flex-col h-full p-4 pt-0">
            {/* Email input for first-time users */}
            {messages.length === 0 && (
              <div className="mb-4">
                <Input
                  placeholder="Your email (optional)"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 mb-4 h-48">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center">
                  <div>
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Start a conversation with our support team</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages
                    .sort((a: ChatMessage, b: ChatMessage) => 
                      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    )
                    .map((msg: ChatMessage) => (
                    <div key={msg.id} className={`flex ${msg.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-lg p-2 text-sm ${
                        msg.senderType === 'customer'
                          ? 'bg-white text-black' 
                          : 'bg-gray-800 text-white border border-gray-600'
                      }`}>
                        <p>{msg.message}</p>
                        <div className="text-xs opacity-70 mt-1">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendMessageMutation.isPending}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessageMutation.isPending}
                size="sm"
                className="bg-white text-black hover:bg-gray-100"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}