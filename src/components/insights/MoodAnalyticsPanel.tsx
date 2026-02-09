import { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { CalendarIcon, TrendingUp, Calendar, Flame, Trophy } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMoodData } from '@/hooks/useMoodData';
import { cn } from '@/lib/utils';

const quickRanges = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This month', days: 0 },
  { label: 'Last month', days: -1 },
];

const MOOD_COLORS = [
  'hsl(0, 70%, 50%)',    // 1 - red
  'hsl(30, 70%, 50%)',   // 2 - orange
  'hsl(50, 70%, 50%)',   // 3 - yellow
  'hsl(80, 60%, 45%)',   // 4 - lime
  'hsl(140, 60%, 40%)',  // 5 - green
];

export function MoodAnalyticsPanel() {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { data, isLoading } = useMoodData(startDate, endDate);

  const handleQuickRange = (range: typeof quickRanges[0]) => {
    const today = new Date();
    if (range.days > 0) {
      setStartDate(subDays(today, range.days));
      setEndDate(today);
    } else if (range.days === 0) {
      setStartDate(startOfMonth(today));
      setEndDate(endOfMonth(today));
    } else {
      const lastMonth = subMonths(today, 1);
      setStartDate(startOfMonth(lastMonth));
      setEndDate(endOfMonth(lastMonth));
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-2 shadow-lg">
          <p className="text-sm font-medium">{format(new Date(data.date), 'MMM d, yyyy')}</p>
          <p className="text-lg">{data.emoji} {data.mood}/5</p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-2 shadow-lg">
          <p className="text-lg">{data.emoji} {data.label}</p>
          <p className="text-sm text-muted-foreground">{data.count} days</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selection */}
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(startDate, 'MMM d')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarPicker mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} />
          </PopoverContent>
        </Popover>
        <span className="text-muted-foreground">to</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(endDate, 'MMM d')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarPicker mode="single" selected={endDate} onSelect={(d) => d && setEndDate(d)} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickRanges.map((range) => (
          <Button
            key={range.label}
            variant="secondary"
            size="sm"
            onClick={() => handleQuickRange(range)}
          >
            {range.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : !data || data.stats.totalDays === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No mood data for this period.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start logging your mood in journal entries to see trends here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.stats.averageEmoji} {data.stats.average}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Days Tracked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.totalDays}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.currentStreak} days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Best Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.bestStreak} days</div>
              </CardContent>
            </Card>
          </div>

          {/* Line Chart - Mood Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Mood Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.timeline}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      domain={[1, 5]} 
                      ticks={[1, 2, 3, 4, 5]}
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={(props: any) => {
                        const color = MOOD_COLORS[props.payload.mood - 1];
                        return (
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={5}
                            fill={color}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        );
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - Mood Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.distribution}>
                    <XAxis 
                      dataKey="emoji" 
                      tick={{ fontSize: 20 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip content={<BarTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {data.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.mood - 1]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
