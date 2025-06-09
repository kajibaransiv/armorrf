import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatMessage, insertChatMessageSchema, Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Clock, User, CheckCheck, Eye, Send, Package, Truck, CheckCircle } from "lucide-react";
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
  const wsRef = useRef<WebSocket | null>(null);

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

  // Query all orders for admin view
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    queryFn: () => apiRequest('GET', '/api/orders').then(res => res.json()),
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

  // Mutation to update order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      apiRequest('PATCH', `/api/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
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

  // WebSocket connection for real-time messaging
  useEffect(() => {
    if (!wsRef.current) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
          queryClient.invalidateQueries({ queryKey: ['/api/chat/unread-count'] });
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
  }, [queryClient]);

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
          <p className="text-gray-400">Manage customer communications and orders</p>
        </div>
        
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-700">
            <TabsTrigger value="messages" className="data-[state=active]:bg-gray-800">
              Customer Messages
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-gray-800">
              Order Management
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages" className="mt-6">
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
              <CardContent className="p-4">
                {selectedSession ? (
                  <div className="flex flex-col h-[600px]">
                    <ScrollArea className="flex-1 pr-4 mb-4 h-[500px]">
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
                    
                    {/* Reply Input - Always visible when session selected */}
                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex gap-2">
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
                    </div>
                  </div>
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
          </TabsContent>
          
          <TabsContent value="orders" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{orders.length}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Pending Orders</CardTitle>
                  <Clock className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {orders.filter(order => order.status === 'pending').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Shipped Orders</CardTitle>
                  <Truck className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {orders.filter(order => order.status === 'shipped').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-white">Order #{order.id}</h3>
                            <p className="text-sm text-gray-400">
                              {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={
                                order.status === 'pending' ? 'destructive' :
                                order.status === 'paid' ? 'default' :
                                order.status === 'shipped' ? 'secondary' :
                                'outline'
                              }
                            >
                              {order.status}
                            </Badge>
                            <Select
                              value={order.status}
                              onValueChange={(status) => 
                                updateOrderStatusMutation.mutate({ orderId: order.id, status })
                              }
                            >
                              <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium text-gray-300 mb-2">Product Details</h4>
                            <p className="text-white">Size: {order.size}</p>
                            <p className="text-white">Quantity: {order.quantity}</p>
                            <p className="text-white">Total: ${(order.totalAmount / 100).toFixed(2)}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-300 mb-2">Shipping Address</h4>
                            <p className="text-white">{order.shippingFirstName} {order.shippingLastName}</p>
                            <p className="text-gray-400">{order.shippingAddress}</p>
                            <p className="text-gray-400">
                              {order.shippingCity}, {order.shippingState} {order.shippingZip}
                            </p>
                            <p className="text-gray-400">{order.shippingCountry}</p>
                            <p className="text-gray-400 mt-1">{order.shippingEmail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}