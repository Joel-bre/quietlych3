import { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, subMonths } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles, MessageSquare, Loader2, Send, Calendar, ArrowRight, FileText, Bot, Info, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const quickRanges = [
  { label: 'Last 7 days', value: '7days', getStart: () => subDays(new Date(), 7), getEnd: () => new Date() },
  { label: 'Last 14 days', value: '14days', getStart: () => subDays(new Date(), 14), getEnd: () => new Date() },
  { label: 'Last 30 days', value: '30days', getStart: () => subDays(new Date(), 30), getEnd: () => new Date() },
  { label: 'This month', value: 'thisMonth', getStart: () => startOfMonth(new Date()), getEnd: () => new Date() },
];

export function AIInsightsPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 8));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [entryCount, setEntryCount] = useState(0);
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [qaLoading, setQaLoading] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      if (!user) return;
      
      try {
        const startStr = format(startDate, 'yyyy-MM-dd');
        const endStr = format(endDate, 'yyyy-MM-dd');
        const entries = await api.get<any[]>(`/api/entries?startDate=${startStr}&endDate=${endStr}`);
        setEntryCount(entries?.length || 0);
      } catch (error) {
        console.error('Error fetching count:', error);
      }
    };
    
    fetchCount();
  }, [startDate, endDate, user]);

  const handleQuickRange = (range: typeof quickRanges[0]) => {
    setStartDate(range.getStart());
    setEndDate(range.getEnd());
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    setSummary('');

    try {
      const data = await api.post<{ summary?: string }>('/api/analyze', {
        type: 'summary',
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });

      setSummary(data?.summary || 'No insights available for this period.');
    } catch (error: any) {
      console.error('Summary error:', error);
      toast({
        title: 'Error generating summary',
        description: error.message || 'Could not generate insights. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    setQaLoading(true);
    setAnswer('');

    try {
      const data = await api.post<{ answer?: string }>('/api/analyze', {
        type: 'question',
        question: question.trim(),
      });

      setAnswer(data?.answer || 'I could not find an answer based on your journal entries.');
    } catch (error: any) {
      console.error('Q&A error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not process your question. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">AI Insights</h1>
          <p className="text-sm text-muted-foreground">Discover patterns in your reflections</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-card/50">
          <TabsTrigger value="summary" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="qa" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="h-4 w-4" />
            Q&A
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4 pt-4">
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-primary" />
                Select Date Range
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex-1 rounded-lg bg-muted/50 p-3 text-left hover:bg-muted/70 transition-colors">
                      <span className="text-xs text-muted-foreground">From</span>
                      <p className="font-medium text-sm sm:text-base">{format(startDate, 'MMM d, yyyy')}</p>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      disabled={(date) => date > endDate || date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 hidden sm:block" />

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex-1 rounded-lg bg-muted/50 p-3 text-left hover:bg-muted/70 transition-colors">
                      <span className="text-xs text-muted-foreground">To</span>
                      <p className="font-medium text-sm sm:text-base">{format(endDate, 'MMM d, yyyy')}</p>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      disabled={(date) => date < startDate || date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {quickRanges.map((range) => (
                  <Button
                    key={range.value}
                    variant="outline"
                    size="sm"
                    className="rounded-full border-primary/30 text-xs hover:bg-primary/10 hover:border-primary"
                    onClick={() => handleQuickRange(range)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={generateSummary}
            disabled={summaryLoading || entryCount === 0}
            className="w-full h-12 text-base gap-2"
          >
            {summaryLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate AI Summary
                <span className="ml-1 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
                  {entryCount} entries
                </span>
              </>
            )}
          </Button>

          {summary ? (
            <Card className="border-border/50 bg-card/80 animate-fade-in">
              <CardContent className="p-4">
                <h4 className="mb-3 font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Your Insights
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3 [&_strong]:text-foreground [&_strong]:font-semibold [&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:text-base [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:first:mt-0 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:text-sm [&_h3]:mt-4 [&_h3]:mb-2">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 bg-card/80">
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-7 w-7 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">AI-Powered Insights</h4>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Select a date range and generate a summary to discover patterns, themes, and insights from your journal entries.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>Analyzed securely on Swiss servers -- never stored or used for AI training</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="qa" className="space-y-4 pt-4">
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Ask questions about your journal entries. For example:
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {[
                    'What made me happy recently?',
                    'What challenges kept recurring?',
                    'What am I grateful for most?',
                  ].map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      className="rounded-full border-primary/30 text-xs hover:bg-primary/10 hover:border-primary whitespace-nowrap flex-shrink-0"
                      onClick={() => setQuestion(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>

              <Textarea
                placeholder="Ask a question about your journal..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[100px] resize-none bg-muted/50"
                disabled={qaLoading}
              />

              <Button
                onClick={askQuestion}
                disabled={qaLoading || !question.trim()}
                className="w-full h-12 text-base gap-2"
              >
                {qaLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Ask Question
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {answer && (
            <Card className="border-border/50 bg-card/80 animate-fade-in">
              <CardContent className="p-4">
                <h4 className="mb-3 font-medium flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  Answer
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3 [&_strong]:text-foreground [&_strong]:font-semibold [&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:text-base [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:first:mt-0 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:text-sm [&_h3]:mt-4 [&_h3]:mb-2">
                  <ReactMarkdown>{answer}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
