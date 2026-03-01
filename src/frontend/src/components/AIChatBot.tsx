import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ── Bot Response Logic ─────────────────────────────────────

function getBotResponse(message: string): Promise<string> {
  const msg = message.toLowerCase().trim();

  const delay = 600 + Math.random() * 600;

  const respond = (text: string) =>
    new Promise<string>((resolve) => setTimeout(() => resolve(text), delay));

  // Greetings
  if (/\b(hello|hi|hey|howdy|greetings)\b/.test(msg)) {
    return respond(
      "Hi there! 👋 I'm your Campus AI Assistant. I can help you find departments, classrooms, courses, college info, and answer admission queries. What would you like to know?",
    );
  }

  // Navigation / Map
  if (/\b(map|navigate|find|where|location|building|room|floor)\b/.test(msg)) {
    return respond(
      "You can use the **Map** tab to visually explore the campus, or the **Search** tab to find any department, classroom, or lab by name. Each location has a QR code you can print for quick access! 🗺️",
    );
  }

  // QR / Scan
  if (/\b(qr|scan|qr\s*code)\b/.test(msg)) {
    return respond(
      "Go to the **Scan** tab to scan QR codes placed on classroom doors and notice boards. You can also upload a photo containing a QR code instead of using the camera. 📷",
    );
  }

  // Bookmarks
  if (/\b(bookmark|save|favorite|favourite|wishlist)\b/.test(msg)) {
    return respond(
      "To bookmark a college, sign in as a **Student** from the Sign In tab. Once logged in, you'll see a bookmark option in your Student Portal. 🔖",
    );
  }

  // Courses / Fees
  if (
    /\b(course|courses|fee|fees|duration|eligibility|program|syllabus)\b/.test(
      msg,
    )
  ) {
    return respond(
      "Head to the **Courses** tab to browse all available programs with fee structures, duration, and eligibility requirements. You can also visit any college's profile in the **Colleges** tab for their specific courses. 📚",
    );
  }

  // Colleges / Universities
  if (
    /\b(college|colleges|university|universities|institute|institution)\b/.test(
      msg,
    )
  ) {
    return respond(
      "The **Colleges** tab has a full directory of institutions including HIT and top-100 Indian universities ranked by uniRank. Tap any college to see departments, faculty, placement stats, and more. 🏫",
    );
  }

  // Admissions
  if (
    /\b(admission|admissions|apply|application|intake|enroll|enrolment)\b/.test(
      msg,
    )
  ) {
    return respond(
      "For admissions, visit the college's official website or call their admission helpline. In the **Colleges** tab, each college profile has contact details and website links. 📝",
    );
  }

  // Placement / Jobs
  if (
    /\b(placement|package|salary|recruiter|job|career|campus\s*placement)\b/.test(
      msg,
    )
  ) {
    return respond(
      "Check the **Placement** tab inside any college's profile. You'll see placement rates, highest and average packages, and top recruiters. 💼",
    );
  }

  // Faculty / Teachers
  if (
    /\b(faculty|professor|teacher|staff|lecturer|hod|head\s*of\s*department)\b/.test(
      msg,
    )
  ) {
    return respond(
      "Faculty details are listed under each college's profile in the **Colleges** tab. Tap a college and go to the **Faculty** tab. 👨‍🏫",
    );
  }

  // Hostel / Accommodation
  if (
    /\b(hostel|accommodation|stay|dormitory|boarding|pg|paying\s*guest)\b/.test(
      msg,
    )
  ) {
    return respond(
      "Hostel availability is listed under the **Facilities** section of each college profile. Contact the college directly for availability and booking details. 🏠",
    );
  }

  // Library / Labs / Facilities
  if (
    /\b(library|lab|sports|facilities|canteen|gym|cafeteria|wifi|internet)\b/.test(
      msg,
    )
  ) {
    return respond(
      "Campus facilities like library, labs, sports complex, and more are listed under each college's **Facilities** tab. 🏋️",
    );
  }

  // Sign In / Login
  if (
    /\b(login|sign\s*in|signin|register|account|signup|sign\s*up)\b/.test(msg)
  ) {
    return respond(
      "Use the **Sign In** tab to log in as a **Student** (to bookmark colleges) or as a **College Manager** (to list your institution). We use Internet Identity for secure, password-free login. 🔐",
    );
  }

  // Help / How does this work
  if (
    /\b(help|what\s*can\s*you\s*do|how\s*does\s*this\s*work|features|capabilities)\b/.test(
      msg,
    )
  ) {
    return respond(
      "I can help you with:\n• 🗺️ Finding classrooms and labs\n• 📚 Browsing courses and fees\n• 🏫 Exploring college profiles\n• 📝 Admission information\n• 📷 QR code scanning tips\n\nJust ask me anything!",
    );
  }

  // HIT / Hi-Tech
  if (/\b(hit|hi.?tech|hitech)\b/.test(msg)) {
    return respond(
      "**Hi-Tech Institute of Technology (HIT)** is located in Khordha, Odisha. Established in 2008, it offers B.Tech, MBA, and M.Tech programs across Civil, CSE, Electrical, and Mechanical departments. 📞 Contact: info@hit.ac.in | Website: hit.ac.in",
    );
  }

  // IIT / Top colleges
  if (/\b(iit|iim|nit|iisc|top\s*college|best\s*college|ranked)\b/.test(msg)) {
    return respond(
      "India's top-ranked institutions include **IIT Bombay** (#1), **IIT Madras** (#2), **IIT Kanpur** (#3), and **IISc Bangalore**. You can browse all **top 100 universities** in the Colleges tab's Rankings section. 🏆",
    );
  }

  // Goodbye / Thanks
  if (
    /\b(bye|goodbye|good\s*bye|thanks|thank\s*you|thank\s*u|cheers)\b/.test(msg)
  ) {
    return respond(
      "You're welcome! 😊 Feel free to ask anytime. Good luck with your campus journey!",
    );
  }

  // Default fallback
  return respond(
    "I'm not sure about that specific query, but I can help with campus navigation, courses, college info, and admissions. Try asking about a specific college, course, or location! 🤔",
  );
}

// ── Types ──────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

// ── Typing Indicator ───────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <Bot className="w-3.5 h-3.5 text-primary-foreground" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "oklch(var(--muted-foreground))" }}
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Message Bubble ─────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  // Simple markdown-like rendering: bold **text**
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: static rendering
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Handle newlines
      return part.split("\n").map((line, j, arr) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static rendering
        <span key={`${i}-${j}`}>
          {line}
          {j < arr.length - 1 && <br />}
        </span>
      ));
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Bot className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card border border-border text-foreground rounded-bl-sm"
        }`}
      >
        {renderText(message.text)}
      </div>
    </motion.div>
  );
}

// ── Main AIChatBot Component ───────────────────────────────

export function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi! 👋 I'm your Campus AI Assistant. Ask me about classrooms, courses, colleges, admissions, or anything about the campus!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages or typing state change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally triggering on message/typing change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await getBotResponse(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        type="button"
        className="fixed z-40 rounded-full shadow-lg flex items-center justify-center"
        style={{
          bottom: "calc(64px + env(safe-area-inset-bottom, 0px) + 16px)",
          right: "calc(50% - 215px + 16px)",
          width: 52,
          height: 52,
          background: "oklch(var(--primary))",
        }}
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Chat Assistant"
      >
        <MessageCircle className="w-5 h-5 text-primary-foreground" />
        {/* Pulsing green dot */}
        <span className="absolute top-0.5 right-0.5 w-3 h-3">
          <span className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping" />
          <span className="relative block w-3 h-3 rounded-full bg-green-500" />
        </span>
      </motion.button>

      {/* Chat Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="p-0 rounded-t-2xl border-border"
          style={{ height: "85dvh", maxWidth: 430, margin: "0 auto" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0"
            style={{ background: "oklch(var(--card))" }}
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-sm text-foreground">
                Campus AI Assistant
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">
                  Always online
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            style={{
              height: "calc(85dvh - 128px)",
              background: "oklch(var(--background))",
            }}
          >
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>
            {isTyping && <TypingIndicator />}
          </div>

          {/* Input bar */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-t border-border flex-shrink-0"
            style={{ background: "oklch(var(--card))" }}
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about campus…"
              className="flex-1 h-10 rounded-xl bg-background border-border text-sm"
              disabled={isTyping}
            />
            <Button
              type="button"
              size="icon"
              className="w-10 h-10 rounded-xl flex-shrink-0"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
