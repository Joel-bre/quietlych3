import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoodAnalyticsPanel } from '@/components/insights/MoodAnalyticsPanel';
import { AIInsightsPanel } from '@/components/insights/AIInsightsPanel';
import { MoodCorrelationPanel } from '@/components/insights/MoodCorrelationPanel';
import { BarChart3, Sparkles, Brain } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="mood-correlation" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Mood Drivers
          </TabsTrigger>
          <TabsTrigger value="mood" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Charts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai">
          <AIInsightsPanel />
        </TabsContent>
        
        <TabsContent value="mood-correlation">
          <MoodCorrelationPanel />
        </TabsContent>
        
        <TabsContent value="mood">
          <MoodAnalyticsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
