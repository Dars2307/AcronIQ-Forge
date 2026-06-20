import { useState, useRef, useEffect } from "react";
import { useListConversations, getListConversationsQueryKey, useListMessages, getListMessagesQueryKey, useSendMessage, useCreateConversation, useListProjects, getListProjectsQueryKey, useCreateTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { MessageSquare, Send, Plus, TerminalSquare, Search, User, Bot, Loader2, Sparkles, Code2, Bug, Zap, FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PROMPT_TEMPLATES = [
  { icon: Bug, label: "Fix TypeScript errors", prompt: "Fix all TypeScript errors in the project. Analyse the codebase, identify type errors, and generate fixes." },
  { icon: Sparkles, label: "Create dashboard", prompt: "Create a user management dashboard with CRUD operations, filtering, and pagination." },
  { icon: Code2, label: "Refactor module", prompt: "Refactor the authentication module to improve maintainability and add better error handling." },
  { icon: Zap, label: "Optimize performance", prompt: "Optimize the application performance by identifying bottlenecks and implementing caching strategies." },
  { icon: FileText, label: "Generate documentation", prompt: "Generate comprehensive documentation for all API endpoints including request/response schemas." },
  { icon: TerminalSquare, label: "Upgrade dependencies", prompt: "Upgrade all dependencies to their latest compatible versions and fix any breaking changes." },
];

export default function Chat() {
  const queryClient = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newProjectId, setNewProjectId] = useState<string>("none");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: isLoadingConvs } = useListConversations({
    query: { queryKey: getListConversationsQueryKey() }
  });

  const { data: projects } = useListProjects({
    query: { queryKey: getListProjectsQueryKey() }
  });

  const { data: messages, isLoading: isLoadingMsgs } = useListMessages(activeConvId!, {
    query: { 
      queryKey: getListMessagesQueryKey(activeConvId!),
      enabled: !!activeConvId
    }
  });

  const createConv = useCreateConversation();
  const sendMessage = useSendMessage();
  const createTask = useCreateTask();

  // Set initial active conversation
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMessage.isPending]);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createConv.mutate({ 
      data: { 
        title: newTitle, 
        projectId: newProjectId === "none" ? null : parseInt(newProjectId, 10) 
      } 
    }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
        setActiveConvId(data.id);
        setIsNewOpen(false);
        setNewTitle("");
        setNewProjectId("none");
      }
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeConvId) return;

    // Optimistically add message
    const msgText = message;
    setMessage("");

    sendMessage.mutate({ 
      id: activeConvId,
      data: { content: msgText } 
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(activeConvId) });
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
      }
    });
  };

  const handlePromptTemplate = (template: typeof PROMPT_TEMPLATES[0]) => {
    setMessage(template.prompt);
  };

  const handleCreateTask = () => {
    if (!message.trim() || !activeConv?.projectId) return;
    
    createTask.mutate({
      data: {
        projectId: activeConv.projectId,
        prompt: message,
        type: "prompt"
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        setMessage("");
      }
    });
  };

  const activeConv = conversations?.find(c => c.id === activeConvId);

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-border/50 flex flex-col bg-sidebar/30">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-mono font-bold text-primary tracking-tight">Conversations</h2>
          <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>New Conversation</DialogTitle>
                <DialogDescription>Start a new thread with the Forge agent.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic / Title</label>
                  <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Memory leak in cache module" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link to Project (Optional)</label>
                  <Select value={newProjectId} onValueChange={setNewProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific project</SelectItem>
                      {projects?.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button onClick={handleCreate} disabled={!newTitle.trim() || createConv.isPending}>
                  {createConv.isPending ? "Creating..." : "Start Chat"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {isLoadingConvs ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 bg-muted/30 animate-pulse rounded-md mx-2 my-1"></div>)
            ) : conversations && conversations.length > 0 ? (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-md transition-colors border",
                    activeConvId === conv.id 
                      ? "bg-secondary border-border/50 shadow-sm" 
                      : "bg-transparent border-transparent hover:bg-secondary/50"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm truncate pr-2">{conv.title}</span>
                    <span className="text-[10px] text-muted-foreground font-mono mt-0.5 whitespace-nowrap">
                      {format(new Date(conv.createdAt), 'MMM d')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {conv.projectName && (
                      <span className="text-[10px] font-mono text-muted-foreground bg-background px-1 rounded border border-border/50 inline-flex items-center">
                        <TerminalSquare className="h-2.5 w-2.5 mr-1" /> {conv.projectName}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground inline-flex items-center">
                      <MessageSquare className="h-2.5 w-2.5 mr-1" /> {conv.messageCount}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center p-4 text-muted-foreground text-sm">
                No conversations yet.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="h-14 border-b border-border/50 flex items-center px-6 bg-card">
              <div>
                <h3 className="font-semibold text-sm">{activeConv.title}</h3>
                {activeConv.projectName && (
                  <p className="text-xs text-muted-foreground font-mono flex items-center">
                    Context: {activeConv.projectName}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
              {isLoadingMsgs ? (
                 <div className="flex justify-center py-10">
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                 </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-6 max-w-3xl mx-auto pb-10">
                  {messages.map(msg => (
                    <div key={msg.id} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                        msg.role === 'user' ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border/50"
                      )}>
                        {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-chart-3" />}
                      </div>
                      <div className={cn(
                        "rounded-lg p-4 max-w-[85%] text-sm",
                        msg.role === 'user' 
                          ? "bg-secondary text-foreground" 
                          : "bg-card border border-border/50 text-foreground font-mono"
                      )}>
                        <div className="whitespace-pre-wrap break-words leading-relaxed">
                          {msg.content}
                        </div>
                        <div className={cn("text-[10px] mt-2 opacity-50 font-mono", msg.role === 'user' ? "text-right" : "text-left")}>
                          {format(new Date(msg.createdAt), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))}
                  {sendMessage.isPending && (
                    <div className="flex gap-4 flex-row">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-card text-foreground border-border/50">
                        <Bot className="h-4 w-4 text-chart-3 animate-pulse" />
                      </div>
                      <div className="rounded-lg p-4 bg-card border border-border/50 text-foreground">
                        <div className="flex gap-1 items-center h-5">
                          <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
                          <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-6 max-w-2xl mx-auto text-center px-6">
                  <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center mb-2">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">How can Forge assist you?</h3>
                  <p className="text-sm">
                    Ask the agent to review code, explain an issue, or generate a fix for the selected project.
                  </p>
                  
                  {/* Quick Prompt Templates */}
                  <div className="w-full pt-4">
                    <p className="text-xs font-medium text-muted-foreground mb-3">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      {PROMPT_TEMPLATES.slice(0, 4).map((template) => {
                        const Icon = template.icon;
                        return (
                          <button
                            key={template.label}
                            onClick={() => handlePromptTemplate(template)}
                            className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-left"
                          >
                            <Icon className="h-4 w-4 text-violet-400 shrink-0" />
                            <span className="text-xs font-medium">{template.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50 bg-background">
              <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-end gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message Forge agent..."
                    className="pr-12 py-6 bg-card border-border/50 focus-visible:ring-1 shadow-sm"
                    disabled={sendMessage.isPending}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="absolute right-1.5 bottom-1.5 h-9 w-9" 
                    disabled={!message.trim() || sendMessage.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {activeConv?.projectId && message.trim() && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCreateTask}
                    disabled={createTask.isPending}
                    className="h-9 px-3"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Create Task
                  </Button>
                )}
              </form>
              <div className="text-center mt-2 text-[10px] text-muted-foreground font-mono">
                AI Agent responses may be imperfect. Verify critical code changes.
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="mx-auto h-10 w-10 opacity-20 mb-4" />
              <p>Select a conversation or start a new one.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
