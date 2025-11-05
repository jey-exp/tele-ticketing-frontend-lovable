import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { ROLES } from '@/config/rolesConfig';
import apiClient from '@/services/api';

export const ChatWidget = () => {
  const { user, isLoading: isUserLoading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  
  // Dr. X's Note: We use a ref for the scroll viewport, not the ScrollArea itself.
  const viewportRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { sender: 'ai', text: "Hi! I'm your AI assistant. How can I help you with your tickets today?" }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    // Auto-scroll to the bottom when new messages are added
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSend = async () => {
    if (currentMessage.trim() === '') return;

    const userMessage = { sender: 'user', text: currentMessage };
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/ai/chat/message', {
        message: currentMessage,
      });

      const aiResponse = { sender: 'ai', text: response.data.response };
      setMessages(prev => [...prev, aiResponse]);
      
      if (!chatId) {
        setChatId(response.data.chatId);
      }

    } catch (err) {
      const errorResponse = { sender: 'ai', text: "Sorry, I'm having trouble connecting right now." };
      setMessages(prev => [...prev, errorResponse]);
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isUserLoading) {
    return null;
  }
  if (!user || user.role !== ROLES.CUSTOMER) {
    return null;
  }

  return (
    <>
      {/* The Chat Window */}
      {isOpen && (
        // Dr. X's Fix: Ensure the Card uses flex-col and has a defined height
        <Card className="fixed bottom-[74px] right-4 z-[998] w-80 h-96 shadow-lg flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          {/* Dr. X's Fix: These classes are key. 
              flex-1 = take up remaining vertical space
              min-h-0 = allow this element to shrink (this is the magic)
          */}
          <CardContent className="flex-1 p-0 min-h-0">
            <ScrollArea className="h-full p-4" viewportRef={viewportRef}>
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'ai' && (
                      <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] rounded-lg p-3 text-sm ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex w-full gap-2"
            >
              <Input
                placeholder="Ask about your tickets..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      {/* The Floating Toggle Button */}
      <Button
        className="fixed bottom-[10px] right-4 z-[999] rounded-full h-14 w-14 shadow-lg"
        onClick={() => setIsOpen(prev => !prev)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </>
  );
};