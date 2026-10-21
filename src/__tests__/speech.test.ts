import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { speechProvider } from '@/lib/speech';

describe('Speech Recognition Adapter', () => {
  const originalWindow = global.window;

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  describe('Unsupported / Server-Side Environment', () => {
    beforeEach(() => {
      delete (globalThis as { window?: unknown }).window;
    });

    it('reports isSupported as false when window is undefined', () => {
      expect(speechProvider.isSupported()).toBe(false);
    });

    it('calls onError callback when attempting to start without browser support', () => {
      const onError = vi.fn();
      const success = speechProvider.start('en-IN', { onError });

      expect(success).toBe(false);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'unknown',
          message: expect.stringContaining('not supported'),
        })
      );
    });

    it('safely handles stop and abort without throwing', () => {
      expect(() => speechProvider.stop()).not.toThrow();
      expect(() => speechProvider.abort()).not.toThrow();
    });
  });

  describe('Mocked Browser Web Speech API Environment', () => {
    interface MockSpeechRecognitionInstance {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      maxAlternatives: number;
      start: ReturnType<typeof vi.fn>;
      stop: ReturnType<typeof vi.fn>;
      abort: ReturnType<typeof vi.fn>;
      onstart: (() => void) | null;
      onresult: ((event: unknown) => void) | null;
      onerror: ((event: unknown) => void) | null;
      onend: (() => void) | null;
    }

    let mockRecognitionInstance: MockSpeechRecognitionInstance;

    beforeEach(() => {
      mockRecognitionInstance = {
        lang: '',
        continuous: false,
        interimResults: false,
        maxAlternatives: 1,
        start: vi.fn(),
        stop: vi.fn(),
        abort: vi.fn(),
        onstart: null,
        onresult: null,
        onerror: null,
        onend: null,
      };

      const MockSpeechRecognition = vi.fn().mockImplementation(() => mockRecognitionInstance);

      (globalThis as { window?: unknown }).window = {
        SpeechRecognition: MockSpeechRecognition,
      };
    });

    it('reports isSupported as true when SpeechRecognition exists on window', () => {
      expect(speechProvider.isSupported()).toBe(true);
    });

    it('initializes recognition with specified language and continuous mode', () => {
      const onStart = vi.fn();
      const success = speechProvider.start('hi-IN', { onStart });

      expect(success).toBe(true);
      expect(mockRecognitionInstance.lang).toBe('hi-IN');
      expect(mockRecognitionInstance.continuous).toBe(true);
      expect(mockRecognitionInstance.interimResults).toBe(true);
      expect(mockRecognitionInstance.start).toHaveBeenCalled();

      // Trigger start event
      mockRecognitionInstance.onstart?.();
      expect(onStart).toHaveBeenCalled();
    });

    it('handles speech recognition transcription results correctly', () => {
      const onResult = vi.fn();
      speechProvider.start('ta-IN', { onResult });

      // Simulate a final speech recognition event
      const mockEvent = {
        resultIndex: 0,
        results: [
          Object.assign([{ transcript: 'தலைவலி மற்றும் காய்ச்சல்' }], { isFinal: true }),
        ],
      };

      mockRecognitionInstance.onresult?.(mockEvent);

      expect(onResult).toHaveBeenCalledWith({
        transcript: 'தலைவலி மற்றும் காய்ச்சல்',
        isFinal: true,
      });
    });

    it('translates permission denial error into helpful user message', () => {
      const onError = vi.fn();
      speechProvider.start('en-IN', { onError });

      mockRecognitionInstance.onerror?.({ error: 'not-allowed' });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'not-allowed',
          message: expect.stringContaining('Microphone permission was denied'),
        })
      );
    });

    it('translates no-speech timeout error into clear retry message', () => {
      const onError = vi.fn();
      speechProvider.start('en-IN', { onError });

      mockRecognitionInstance.onerror?.({ error: 'no-speech' });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'no-speech',
          message: expect.stringContaining('No speech was detected'),
        })
      );
    });

    it('translates unsupported language error gracefully', () => {
      const onError = vi.fn();
      speechProvider.start('brx-IN', { onError });

      mockRecognitionInstance.onerror?.({ error: 'language-not-supported' });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'language-not-supported',
          message: expect.stringContaining('speech models'),
        })
      );
    });

    it('stops and aborts recognition cleanly', () => {
      speechProvider.start('en-IN', {});
      // Simulate session started
      mockRecognitionInstance.onstart?.();

      speechProvider.stop();
      expect(mockRecognitionInstance.stop).toHaveBeenCalled();

      speechProvider.abort();
      expect(mockRecognitionInstance.abort).toHaveBeenCalled();
    });
  });
});
