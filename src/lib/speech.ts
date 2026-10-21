/**
 * HealthGuide AI — Browser Speech Recognition Adapter
 *
 * Implements a standards-compliant speech recognition interface with support for
 * modern SpeechRecognition and webkitSpeechRecognition implementations.
 */

export interface SpeechRecognitionResultPayload {
  transcript: string;
  isFinal: boolean;
}

export interface SpeechRecognitionErrorPayload {
  code: 'not-allowed' | 'no-speech' | 'network' | 'audio-capture' | 'language-not-supported' | 'aborted' | 'unknown';
  message: string;
}

export interface SpeechSessionCallbacks {
  onStart?: () => void;
  onResult?: (payload: SpeechRecognitionResultPayload) => void;
  onError?: (payload: SpeechRecognitionErrorPayload) => void;
  onEnd?: () => void;
}

export interface SpeechRecognitionProvider {
  isSupported(): boolean;
  start(languageCode: string, callbacks: SpeechSessionCallbacks): boolean;
  stop(): void;
  abort(): void;
}

// Internal typing for Web Speech API
interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionAlternativeList {
  [index: number]: SpeechRecognitionResultItem;
  length: number;
  isFinal?: boolean;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionAlternativeList;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface WindowWithSpeechRecognition {
  SpeechRecognition?: new () => ISpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => ISpeechRecognitionInstance;
}

class BrowserWebSpeechProvider implements SpeechRecognitionProvider {
  private recognitionInstance: ISpeechRecognitionInstance | null = null;
  private isListeningActive = false;

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as WindowWithSpeechRecognition;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  public start(languageCode: string, callbacks: SpeechSessionCallbacks): boolean {
    if (!this.isSupported()) {
      callbacks.onError?.({
        code: 'unknown',
        message: 'Speech recognition is not supported in this browser. Please type your symptoms manually.',
      });
      return false;
    }

    try {
      this.abort(); // Clean up any active session

      const win = window as unknown as WindowWithSpeechRecognition;
      const SpeechRecognitionConstructor =
        win.SpeechRecognition || win.webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) return false;

      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = languageCode || 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        this.isListeningActive = true;
        callbacks.onStart?.();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const part = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            finalTranscript += part;
          } else {
            interimTranscript += part;
          }
        }

        const combined = (finalTranscript || interimTranscript).trim();
        if (combined) {
          callbacks.onResult?.({
            transcript: combined,
            isFinal: Boolean(finalTranscript),
          });
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const rawError = event.error || 'unknown';
        let code: SpeechRecognitionErrorPayload['code'] = 'unknown';
        let message = 'An unexpected speech recognition error occurred. Please type your symptoms.';

        switch (rawError) {
          case 'not-allowed':
          case 'service-not-allowed':
            code = 'not-allowed';
            message = 'Microphone permission was denied. Please allow microphone access in your browser settings or type your symptoms.';
            break;
          case 'no-speech':
            code = 'no-speech';
            message = 'No speech was detected. Please click the microphone again and speak clearly, or type your symptoms.';
            break;
          case 'audio-capture':
            code = 'audio-capture';
            message = 'No microphone device was detected. Please connect a microphone or use keyboard input.';
            break;
          case 'network':
            code = 'network';
            message = 'Speech recognition network connection failed. You can continue by typing your symptoms.';
            break;
          case 'language-not-supported':
            code = 'language-not-supported';
            message = 'Your browser does not currently bundle speech models for this language. Please type your symptoms directly.';
            break;
          case 'aborted':
            code = 'aborted';
            message = 'Voice input session was stopped.';
            break;
        }

        callbacks.onError?.({ code, message });
      };

      recognition.onend = () => {
        this.isListeningActive = false;
        callbacks.onEnd?.();
      };

      this.recognitionInstance = recognition;
      recognition.start();
      return true;
    } catch {
      callbacks.onError?.({
        code: 'unknown',
        message: 'Could not initialize microphone speech recognition. Please type your symptoms.',
      });
      return false;
    }
  }

  public stop(): void {
    if (this.recognitionInstance && this.isListeningActive) {
      try {
        this.recognitionInstance.stop();
      } catch {
        // Ignore stop error if already halted
      }
    }
    this.isListeningActive = false;
  }

  public abort(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.abort();
      } catch {
        // Ignore abort error
      }
      this.recognitionInstance = null;
    }
    this.isListeningActive = false;
  }
}

export const speechProvider: SpeechRecognitionProvider = new BrowserWebSpeechProvider();
