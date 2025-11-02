'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  HelpCircle,
  Lightbulb,
  TrendingUp,
  Settings,
  Minimize2,
  Maximize2,
  X
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  intent?: {
    name: string;
    confidence: number;
  };
  isTyping?: boolean;
}

interface SuggestedAction {
  type: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
}

interface AIChatbotProps {
  campaignId?: string;
  userId?: string;
  className?: string;
}

const SUGGESTED_QUESTIONS = [
  {
    icon: <TrendingUp className="h-4 w-4" />,
    text: "كيف أحسن أداء حملتي؟"
  },
  {
    icon: <HelpCircle className="h-4 w-4" />,
    text: "ما هو أفضل وقت للنشر؟"
  },
  {
    icon: <Lightbulb className="h-4 w-4" />,
    text: "كيف أنشئ حملة جديدة؟"
  },
  {
    icon: <Sparkles className="h-4 w-4" />,
    text: "حلل أداء حملاتي الحالية"
  }
];

export function AIChatbot({ campaignId, userId, className }: AIChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
    initializeChat();
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'bot',
      content: `مرحباً بك! أنا مساعدك الذكي في إدارة الحملات التسويقية. 🤖\n\nيمكنني مساعدتك في:\n• إنشاء وإدارة الحملات\n• فهم وتحليل البيانات\n• تحسين أداء الحملات\n• الإجابة على استفساراتك\n\nكيف يمكنني مساعدتك اليوم؟`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowWelcome(false);
    setIsTyping(true);

    // محاكاة الاستجابة
    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: botResponse.content,
        timestamp: new Date(),
        intent: botResponse.intent
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    
    // تحليل النية والاستجابة
    if (input.includes('حملة') || input.includes('إنشاء')) {
      return {
        content: `🚀 **لإنشاء حملة جديدة:**\n\n1. اذهب إلى قسم "الحملات" في القائمة الجانبية\n2. انقر على "إنشاء حملة جديدة"\n3. املأ المعلومات الأساسية:\n   • اسم الحملة\n   • وصف الحملة\n   • الميزانية المحددة\n   • تاريخ البداية والنهاية\n\n4. حدد الجمهور المستهدف\n5. اختر المنصات المناسبة\n6. ارفع المحتوى (صور، فيديوهات)\n7. راجع جميع التفاصيل واحفظ الحملة\n\nهل تريد مني توضيح أي خطوة أكثر؟`,
        intent: { name: 'create_campaign', confidence: 0.9 }
      };
    }

    if (input.includes('تحليل') || input.includes('أداء') || input.includes('إحصائيات')) {
      return {
        content: `📊 **لفحص تحليلات حملتك:**\n\n**الخطوات:**\n1. اذهب إلى قسم "الحملات"\n2. اختر الحملة التي تريد فحصها\n3. انقر على "التحليلات" في شريط التنقل\n\n**المقاييس الرئيسية:**\n• **الوصول**: عدد الأشخاص الذين شاهدوا إعلانك\n• **التفاعل**: الإعجابات، التعليقات، المشاركات\n• **النقرات**: عدد النقرات على إعلانك\n• **التحويلات**: عدد الإجراءات المكتملة\n• **العائد على الاستثمار**: مقارنة الأرباح بالإنفاق\n\n🎯 **نصائح للتحليل:**\n• راقب المقاييس يومياً\n• قارن الأداء بفترات سابقة\n• استخدم الفلاتر لدراسة فترات محددة\n\nأي مقياس معين تريد معرفة المزيد عنه؟`,
        intent: { name: 'view_analytics', confidence: 0.85 }
      };
    }

    if (input.includes('تحسين') || input.includes('زيادة') || input.includes('تطوير')) {
      return {
        content: `🚀 **استراتيجيات تحسين الأداء:**\n\n**1. تحسين المحتوى:**\n• استخدم صور عالية الجودة\n• اكتب عناوين جذابة\n• اجعل المحتوى قصير ومباشر\n• استخدم الدعوة للعمل (CTA)\n\n**2. تحسين التوقيت:**\n• انشر في الأوقات التي يكون فيها جمهورك أكثر نشاطاً\n• تجنب أوقات الذروة التنافسية\n• اختبر أوقات مختلفة وقس النتائج\n\n**3. تحسين الاستهداف:**\n• حدد الجمهور بدقة أكبر\n• استخدم البيانات الديموغرافية\n• ركز على الاهتمامات والسلوكيات\n\n**4. تحسين الميزانية:**\n• وزع الميزانية على المنصات الأكثر فعالية\n• زد الإنفاق على الإعلانات عالية الأداء\n• قلل الإنفاق على الإعلانات منخفضة الأداء\n\nهل تريد مني مساعدتك في تطبيق أي من هذه الاستراتيجيات؟`,
        intent: { name: 'optimize_campaign', confidence: 0.8 }
      };
    }

    if (input.includes('وقت') || input.includes('توقيت') || input.includes('متى')) {
      return {
        content: `⏰ **أفضل أوقات النشر:**\n\n**يوميًا:**\n• **الأفضل**: 9-11 صباحاً، 2-4 عصراً، 8-10 مساءً\n• **تجنب**: منتصف الليل، الفجر\n\n**أيام الأسبوع:**\n• **الأفضل**: الأحد-الخميس\n• **تجنب**: عطلة نهاية الأسبوع (إلا للترفيه)\n\n**نصائح مهمة:**\n• راقب تحليلات جمهورك لتحديد أوقاتهم المثلى\n• اختبر أوقات مختلفة لمدة أسبوعين\n• فكر في المنطقة الزمنية لجمهورك\n• مراعى المناسبات والمواسم\n\nأريد مني مساعدتك في إنشاء جدولة تلقائية للمحتوى؟`,
        intent: { name: 'timing_recommendation', confidence: 0.88 }
      };
    }

    if (input.includes('ميزانية') || input.includes('سعر') || input.includes('تكلفة')) {
      return {
        content: `💰 **لوضع ميزانية فعالة:**\n\n**الخطوات:**\n1. **حدد الهدف النهائي** (مبيعات، وعي، تفاعل)\n2. **احسب التكلفة المتوقعة** لكل تفاعل\n3. **وزع الميزانية:**\n   - 60% للمحتوى الأساسي\n   - 25% للاختبار والتحسين\n   - 15% للاستثمار الإضافي\n\n**نصائح مهمة:**\n• ابدأ بميزانية صغيرة واختبر\n• راقب الإنفاق يومياً\n• اضبط الميزانية حسب الأداء\n• احتفظ بـ 20% كاحتياطي للطوارئ\n\n**مثال عملي:**\nإذا كان هدفك 100 تفاعل وتكلفة التفاعل 2 ريال، فالميزانية المقترحة 200 ريال.\n\nهل تريد مني مساعدتك في حساب ميزانية لحملتك؟`,
        intent: { name: 'budget_planning', confidence: 0.82 }
      };
    }

    if (input.includes('مرحبا') || input.includes('أهلا') || input.includes('hello')) {
      return {
        content: `مرحباً بك! 😊 أنا مساعدك الذكي في إدارة الحملات التسويقية.\n\n🤖 **ما يمكنني مساعدتك فيه:**\n• إنشاء وإدارة الحملات\n• فهم وتحليل البيانات\n• تحسين أداء الحملات\n• الإجابة على استفساراتك\n\nكيف يمكنني مساعدتك اليوم؟`,
        intent: { name: 'greeting', confidence: 0.95 }
      };
    }

    // رد افتراضي
    return {
      content: `عذراً، لم أفهم سؤالك تماماً. 😔\n\nيمكنك أن تسألني عن:\n\n• "كيف أنشئ حملة جديدة؟"\n• "كيف أقرأ التحليلات؟"\n• "كيف أحسن أداء الحملة؟"\n• "ما هو أفضل وقت للنشر؟"\n• "كيف أضع ميزانية الحملة؟"\n\nأو اطرح سؤالك بطريقة أخرى وسأحاول مساعدتك! 😊`,
      intent: { name: 'general_inquiry', confidence: 0.5 }
    };
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const formatMessage = (content: string) => {
    // تنسيق بسيط للرسائل
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button 
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card className={`w-full max-w-2xl h-[600px] flex flex-col ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">المساعد الذكي</CardTitle>
            <p className="text-sm text-muted-foreground">متصل الآن</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Badge variant="outline" className="text-green-600 border-green-600">
            متصل
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {showWelcome && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  أسئلة مقترحة:
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {SUGGESTED_QUESTIONS.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start text-left h-auto p-3 whitespace-normal"
                      onClick={() => handleSuggestedQuestion(question.text)}
                    >
                      <div className="flex items-start space-x-2">
                        {question.icon}
                        <span className="text-sm">{question.text}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <Avatar className="h-6 w-6 mt-1">
                    {message.type === 'user' ? (
                      <AvatarFallback className="bg-gray-100">
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div
                      className="text-sm whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(message.content)
                      }}
                    />
                    <div
                      className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {message.intent && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {message.intent.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <Avatar className="h-6 w-6 mt-1">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>اضغط Enter للإرسال</span>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-3 w-3" />
              <span>مدعوم بالذكاء الاصطناعي</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}