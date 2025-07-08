import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Phone,
  Mail,
  Clock,
  User,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  id: string;
  type: 'user' | 'bot' | 'agent';
  content: string;
  timestamp: Date;
  sender?: string;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    question: "What's your return policy?",
    answer: "We accept returns within 30 days of delivery. Items must be unused, unwashed, and in original condition with tags attached.",
    category: "Returns"
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping takes 5-7 business days. Express shipping (1-2 days) is available for an additional fee.",
    category: "Shipping"
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we only ship within India. International shipping will be available soon.",
    category: "Shipping"
  },
  {
    question: "How do I track my order?",
    answer: "You can track your order by visiting the 'My Orders' section in your account or using the tracking link sent to your email.",
    category: "Orders"
  },
  {
    question: "Can I cancel my order?",
    answer: "Orders can be cancelled within 2 hours of placement. After that, please contact customer support.",
    category: "Orders"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, UPI, net banking, and cash on delivery (COD).",
    category: "Payment"
  }
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<'faq' | 'chat'>('faq');
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (type: 'user' | 'bot' | 'agent', content: string, sender?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      sender
    };
    setMessages(prev => [...prev, newMessage]);
    
    if (type !== 'user' && !isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    addMessage('user', inputValue);
    const userMessage = inputValue.toLowerCase();
    setInputValue("");
    
    // Simple bot responses
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      // Check for common keywords and provide appropriate responses
      if (userMessage.includes('order') && userMessage.includes('track')) {
        addMessage('bot', `To track your order, please visit the "My Orders" section in your account. You can also use the tracking link sent to your email. If you need the tracking number, please provide your order number.`);
      } else if (userMessage.includes('return') || userMessage.includes('refund')) {
        addMessage('bot', `Our return policy allows returns within 30 days of delivery. Items must be unused and in original condition. You can initiate a return request from your orders page or I can help you with the process. Would you like me to guide you?`);
      } else if (userMessage.includes('shipping') || userMessage.includes('delivery')) {
        addMessage('bot', `We offer standard shipping (5-7 days) and express shipping (1-2 days). Shipping is free on orders above ₹999. Your order status and estimated delivery date are available in your account.`);
      } else if (userMessage.includes('payment') || userMessage.includes('pay')) {
        addMessage('bot', `We accept all major credit/debit cards, UPI, net banking, and cash on delivery (COD). All payments are secured with industry-standard encryption.`);
      } else if (userMessage.includes('size') || userMessage.includes('fit')) {
        addMessage('bot', `For saree sizing, please refer to our size guide available on each product page. If you need specific measurements or fitting advice, I can connect you with our sizing specialist.`);
      } else if (userMessage.includes('cancel')) {
        addMessage('bot', `Orders can be cancelled within 2 hours of placement. After that, the order goes into processing. If you need to cancel an order, please provide your order number and I'll help you.`);
      } else if (userMessage.includes('agent') || userMessage.includes('human') || userMessage.includes('support')) {
        addMessage('bot', `I'm connecting you with a human agent. Please hold on for a moment. Our support team is available Monday-Saturday, 9 AM to 8 PM IST.`);
        // Simulate agent joining
        setTimeout(() => {
          addMessage('agent', `Hi! I'm Sarah from customer support. I see you were chatting with our bot. How can I help you today?`, 'Sarah');
        }, 3000);
      } else {
        // Generic response
        addMessage('bot', `Thanks for your message! I'm here to help with orders, returns, shipping, and general questions. You can also type "agent" to connect with a human representative. How can I assist you today?`);
      }
    }, 1500);
  };

  const handleFAQClick = (faq: FAQItem) => {
    setChatMode('chat');
    addMessage('user', faq.question);
    setTimeout(() => {
      addMessage('bot', faq.answer);
    }, 1000);
  };

  const groupedFAQs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg relative"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 shadow-2xl transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[600px]'}`}>
        {/* Header */}
        <CardHeader className="p-4 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div>
                <h3 className="font-semibold">Customer Support</h3>
                <p className="text-xs opacity-90">We're here to help!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-blue-700 p-1 h-8 w-8"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-700 p-1 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[536px]">
            {/* Mode Toggle */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex gap-2">
                <Button
                  variant={chatMode === 'faq' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChatMode('faq')}
                  className="flex-1"
                >
                  Quick Help
                </Button>
                <Button
                  variant={chatMode === 'chat' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChatMode('chat')}
                  className="flex-1"
                >
                  Live Chat
                </Button>
              </div>
            </div>

            {chatMode === 'faq' ? (
              /* FAQ Mode */
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Frequently Asked Questions</h4>
                  <p className="text-sm text-gray-600">Click on any question to get instant answers</p>
                </div>

                {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
                  <div key={category} className="space-y-2">
                    <h5 className="font-medium text-gray-800 text-sm">{category}</h5>
                    {categoryFAQs.map((faq, index) => (
                      <button
                        key={index}
                        onClick={() => handleFAQClick(faq)}
                        className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <p className="text-sm text-gray-700">{faq.question}</p>
                      </button>
                    ))}
                  </div>
                ))}

                {/* Contact Options */}
                <div className="border-t pt-4 mt-6">
                  <h5 className="font-medium text-gray-800 text-sm mb-3">Need more help?</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>+91 12345 67890</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>support@sareeshop.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Mon-Sat, 9 AM - 8 PM IST</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Chat Mode */
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 text-sm">
                      <Bot className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p>Hi {user?.username || 'there'}! I'm here to help you with any questions about your orders, returns, shipping, or our products.</p>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : message.type === 'agent'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : message.type === 'agent' ? (
                            <span className="text-xs font-bold">A</span>
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className={`rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {message.sender && (
                            <p className="text-xs opacity-75 mb-1">{message.sender}</p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 opacity-75`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}