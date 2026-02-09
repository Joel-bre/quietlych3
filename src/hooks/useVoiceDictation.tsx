import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

export function useVoiceDictation() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async (fieldId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setActiveField(fieldId);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Microphone access denied',
        description: 'Please allow microphone access to use voice dictation.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsRecording(false);
        setIsTranscribing(true);

        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];

            try {
              const data = await api.post<{ text: string }>('/api/transcribe', { audio: base64Audio });
              setIsTranscribing(false);
              setActiveField(null);
              resolve(data?.text || null);
            } catch (error) {
              throw error;
            }
          };
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            title: 'Transcription failed',
            description: 'Could not transcribe your audio. Please try again.',
            variant: 'destructive',
          });
          setIsTranscribing(false);
          setActiveField(null);
          resolve(null);
        }

        mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.stop();
    });
  }, [isRecording, toast]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
    setIsTranscribing(false);
    setActiveField(null);
  }, [isRecording]);

  return {
    isRecording,
    isTranscribing,
    activeField,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
