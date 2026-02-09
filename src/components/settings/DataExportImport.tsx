import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const entrySchema = z.object({
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  how_do_you_feel: z.string().nullable().optional(),
  achievements: z.string().nullable().optional(),
  learnings: z.string().nullable().optional(),
  grateful_for: z.string().nullable().optional(),
  challenges: z.string().nullable().optional(),
  something_funny: z.string().nullable().optional(),
  general_notes: z.string().nullable().optional(),
  mood_rating: z.number().min(1).max(5).nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const importSchema = z.object({
  version: z.string().optional(),
  exportedAt: z.string().optional(),
  entryCount: z.number().optional(),
  entries: z.array(entrySchema),
});

type ImportData = z.infer<typeof importSchema>;

interface JournalEntry {
  entryDate: string;
  howDoYouFeel: string | null;
  achievements: string | null;
  learnings: string | null;
  gratefulFor: string | null;
  challenges: string | null;
  somethingFunny: string | null;
  generalNotes: string | null;
  moodRating: number | null;
  createdAt: string;
  updatedAt: string;
}

export function DataExportImport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [entryCount, setEntryCount] = useState<number | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    data: ImportData;
    existingDates: Set<string>;
  } | null>(null);

  useEffect(() => {
    if (user) {
      api.get<{ entryDate: string }[]>('/api/entries/dates')
        .then((data) => {
          setEntryCount(data?.length ?? 0);
        })
        .catch(() => setEntryCount(0));
    }
  }, [user]);

  const handleExport = async () => {
    if (!user) return;

    setExporting(true);
    try {
      const entries = await api.get<JournalEntry[]>('/api/entries');

      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        entryCount: entries?.length ?? 0,
        entries: (entries ?? []).map(e => ({
          entry_date: e.entryDate,
          how_do_you_feel: e.howDoYouFeel,
          achievements: e.achievements,
          learnings: e.learnings,
          grateful_for: e.gratefulFor,
          challenges: e.challenges,
          something_funny: e.somethingFunny,
          general_notes: e.generalNotes,
          mood_rating: e.moodRating,
          created_at: e.createdAt,
          updated_at: e.updatedAt,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quietly-journal-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: `Successfully exported ${entries?.length ?? 0} journal entries.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export your journal entries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    event.target.value = '';

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const parseResult = importSchema.safeParse(json);
      if (!parseResult.success) {
        toast({
          title: 'Invalid File Format',
          description: 'The selected file does not match the expected format.',
          variant: 'destructive',
        });
        return;
      }

      const importData = parseResult.data;

      if (importData.entries.length === 0) {
        toast({
          title: 'No Entries Found',
          description: 'The selected file does not contain any journal entries.',
          variant: 'destructive',
        });
        return;
      }

      const existingEntries = await api.get<{ entryDate: string }[]>('/api/entries/dates');
      const existingDates = new Set(existingEntries?.map((e) => e.entryDate) ?? []);

      setPendingImport({ data: importData, existingDates });
      setConfirmDialogOpen(true);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error instanceof SyntaxError
          ? 'The selected file is not valid JSON.'
          : 'Failed to read the import file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmImport = async () => {
    if (!pendingImport || !user) return;

    setConfirmDialogOpen(false);
    setImporting(true);

    const { data: importData, existingDates } = pendingImport;

    try {
      const newEntries = importData.entries.filter(
        (entry) => !existingDates.has(entry.entry_date)
      );
      const skippedCount = importData.entries.length - newEntries.length;

      if (newEntries.length === 0) {
        toast({
          title: 'No New Entries',
          description: `All ${skippedCount} entries already exist in your journal.`,
        });
        return;
      }

      for (const entry of newEntries) {
        await api.post('/api/entries', {
          entryDate: entry.entry_date,
          howDoYouFeel: entry.how_do_you_feel ?? null,
          achievements: entry.achievements ?? null,
          learnings: entry.learnings ?? null,
          gratefulFor: entry.grateful_for ?? null,
          challenges: entry.challenges ?? null,
          somethingFunny: entry.something_funny ?? null,
          generalNotes: entry.general_notes ?? null,
          moodRating: entry.mood_rating ?? null,
        });
      }

      setEntryCount((prev) => (prev ?? 0) + newEntries.length);

      toast({
        title: 'Import Complete',
        description: `Imported ${newEntries.length} entries${skippedCount > 0 ? `, skipped ${skippedCount} duplicates` : ''}.`,
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: 'Failed to import journal entries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
      setPendingImport(null);
    }
  };

  const newEntriesCount = pendingImport
    ? pendingImport.data.entries.filter(
        (e) => !pendingImport.existingDates.has(e.entry_date)
      ).length
    : 0;
  const duplicatesCount = pendingImport
    ? pendingImport.data.entries.length - newEntriesCount
    : 0;

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exporting || importing}
          className="flex-1"
        >
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Entries
              {entryCount !== null && (
                <span className="ml-1 text-muted-foreground">({entryCount})</span>
              )}
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleImportClick}
          disabled={exporting || importing}
          className="flex-1"
        >
          {importing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Import Entries
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Import</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to import <strong>{newEntriesCount}</strong> new journal{' '}
                {newEntriesCount === 1 ? 'entry' : 'entries'}.
              </p>
              {duplicatesCount > 0 && (
                <p className="text-muted-foreground">
                  {duplicatesCount} {duplicatesCount === 1 ? 'entry' : 'entries'} will be
                  skipped (already exist).
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingImport(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>
              Import {newEntriesCount} {newEntriesCount === 1 ? 'Entry' : 'Entries'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
