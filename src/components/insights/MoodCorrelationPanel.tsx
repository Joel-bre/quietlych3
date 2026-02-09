import { useState } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Smile, HelpCircle, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';

interface MoodAnalysis {
  primary_mood_drivers: string[];
  stress_signals: string[];
  behavioral_insights: {
    observations: string[];
  };
  the_laughter_effect: string;
  reflective_question: string;
}

interface AnalysisResult {
  analysis: MoodAnalysis;
  entriesAnalyzed: number;
  entriesWithMood: number;
}

type PeriodType = '7days' | '30days' | 'custom';

export function MoodCorrelationPanel() {
  const [period, setPeriod] = useState<PeriodType>('7days');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const getDateRange = (): { startDate: string; endDate: string } => {
    const today = new Date();
    
    if (period === 'custom' && dateRange?.from && dateRange?.to) {
      return {
        startDate: format(startOfDay(dateRange.from), 'yyyy-MM-dd'),
        endDate: format(endOfDay(dateRange.to), 'yyyy-MM-dd'),
      };
    }
    
    const days = period === '30days' ? 30 : 7;
    return {
      startDate: format(subDays(today, days), 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    };
  };

  const handleAnalyze = async () => {
    if (period === 'custom' && (!dateRange?.from || !dateRange?.to)) {
      toast.error('Please select a date range');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { startDate, endDate } = getDateRange();

      const data = await api.post<AnalysisResult & { error?: string; message?: string }>('/api/analyze', {
        type: 'mood-correlation',
        startDate,
        endDate,
      });

      if (data.error === 'insufficient_data') {
        toast.error(data.message || 'Not enough data');
        return;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze entries. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPeriodLabel = () => {
    if (period === 'custom' && dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
    }
    return period === '7days' ? 'Last 7 days' : 'Last 30 days';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            What Affects Your Mood?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Discover patterns between your daily activities and mood scores.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={period === '7days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('7days')}
            >
              7 days
            </Button>
            <Button
              variant={period === '30days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('30days')}
            >
              30 days
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={period === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('custom')}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Custom
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {period === 'custom' && dateRange?.from && dateRange?.to && (
            <p className="text-sm text-muted-foreground">
              Selected: {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
            </p>
          )}

          <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze My Mood Patterns'
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Analyzed {result.entriesAnalyzed} entries ({result.entriesWithMood} with mood ratings) • {getPeriodLabel()}
          </p>

          {result.analysis.primary_mood_drivers.length > 0 && (
            <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-green-700 dark:text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  Mood Boosters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.analysis.primary_mood_drivers.map((driver, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">↑</span>
                      <span>{driver}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.analysis.stress_signals.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  Early Warning Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.analysis.stress_signals.map((signal, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.analysis.behavioral_insights.observations.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.analysis.behavioral_insights.observations.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">📊</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.analysis.the_laughter_effect && (
            <Card className="border-pink-200 dark:border-pink-900 bg-pink-50/50 dark:bg-pink-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-pink-700 dark:text-pink-400">
                  <Smile className="h-4 w-4" />
                  The Laughter Effect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic">"{result.analysis.the_laughter_effect}"</p>
              </CardContent>
            </Card>
          )}

          {result.analysis.reflective_question && (
            <Card className="border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-purple-700 dark:text-purple-400">
                  <HelpCircle className="h-4 w-4" />
                  Reflect on This
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">"{result.analysis.reflective_question}"</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
