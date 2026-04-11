"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAuthToken } from '@/lib/pipeline/getAuthToken';
import type { PipelineAction, PipelineState } from '@/lib/pipeline/types';

const MAX_RETRIES = 3;
const RATE_LIMIT_DELAY_S = 30;

interface GeneratingStepProps {
  dispatch: React.Dispatch<PipelineAction>;
  locale: string;
  state: PipelineState;
  userId: string;
  onComplete: () => void;
}

export function GeneratingStep({ dispatch, locale, state, userId, onComplete }: GeneratingStepProps) {
  const kn = locale === 'kn';
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      startGeneration();
    }
    return () => abortRef.current?.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startGeneration(attempt = 1) {
    setError('');
    setStreamText('');

    if (!state.caseSummary || !state.officerAnswers) {
      setError(kn ? 'ಮಾಹಿತಿ ಕಾಣೆಯಾಗಿದೆ / Data missing' : 'Data missing. Please go back.');
      return;
    }

    abortRef.current = new AbortController();

    try {
      const token = await getAuthToken();
      if (!token) {
        setError(kn ? 'ಸೆಷನ್ ಮುಕ್ತಾಯ. ಮರುಲಾಗಿನ್ ಮಾಡಿ / Session expired. Please login.' : 'Session expired. Please login.');
        return;
      }

      const response = await fetch('/api/pipeline/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          caseType: state.caseType,
          caseSummary: state.caseSummary,
          officerAnswers: state.officerAnswers,
          userId,
          sessionOrderCount: state.sessionOrderCount + 1,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let guardrailScore = 0;
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (currentEvent === 'chunk' && data.text) {
                fullText += data.text;
                setStreamText(prev => prev + data.text);
              }

              if (currentEvent === 'correction' && data.text) {
                // Corrected text replaces the streamed text
                fullText = data.text;
                setStreamText(data.text);
              }

              if (currentEvent === 'done') {
                guardrailScore = data.guardrailScore ?? guardrailScore;
                dispatch({
                  type: 'SET_GENERATED_TEXT',
                  text: fullText,
                  guardrailScore,
                  modelUsed: data.modelUsed ?? undefined,
                  inputTokens: data.inputTokens ?? null,
                  outputTokens: data.outputTokens ?? null,
                });
                onComplete();
                return;
              }

              if (currentEvent === 'error') {
                if (data.code === 'NO_CREDITS') {
                  setError(kn
                    ? 'ಕ್ರೆಡಿಟ್‌ಗಳು ಖಾಲಿಯಾಗಿವೆ. ದಯವಿಟ್ಟು ರೀಚಾರ್ಜ್ ಮಾಡಿ'
                    : 'No credits remaining. Please recharge.'
                  );
                } else if (data.code === 'RATE_LIMIT_DAILY') {
                  setError(data.message || (kn ? 'ಇಂದಿನ ಮಿತಿ ತಲುಪಿದೆ' : 'Daily limit reached'));
                } else {
                  throw new Error(data.message || 'Generation failed');
                }
                return;
              }
            } catch (parseErr) {
              // Skip malformed SSE data lines
            }
          } else if (line === '') {
            // Empty line resets event type
            currentEvent = '';
          }
        }
      }

      // Stream ended without a done event — use what we have
      if (fullText.trim()) {
        dispatch({ type: 'SET_GENERATED_TEXT', text: fullText, guardrailScore });
        onComplete();
      } else {
        throw new Error('Empty response from AI');
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;

      const message = (err as Error).message ?? '';
      const isRateLimit = message.includes('429') || message.includes('rate limit') || message.includes('30 seconds');

      if (isRateLimit && attempt < MAX_RETRIES) {
        // Auto-retry after countdown
        setRetryCount(attempt);
        let remaining = RATE_LIMIT_DELAY_S;
        setCountdown(remaining);
        const timer = setInterval(() => {
          remaining -= 1;
          setCountdown(remaining);
          if (remaining <= 0) {
            clearInterval(timer);
            startGeneration(attempt + 1);
          }
        }, 1000);
      } else if (attempt < MAX_RETRIES && !isRateLimit) {
        // Non-rate-limit error — show retry button
        setError(message || (kn
          ? 'ಆದೇಶ ರಚನೆ ವಿಫಲವಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ'
          : 'Generation failed. Please retry.'
        ));
      } else {
        // All retries exhausted
        setError(kn
          ? 'ಎಲ್ಲಾ ಪ್ರಯತ್ನಗಳು ವಿಫಲವಾಗಿವೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ / All attempts failed. Please try again later.'
          : 'All attempts failed. Please try again later. / ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.'
        );
      }
    }
  }

  // Rate limit countdown
  if (countdown > 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <Loader2 className="h-8 w-8 mx-auto text-amber-500 animate-spin" />
          <p className="text-sm font-medium text-amber-700">
            {kn
              ? `ದಯವಿಟ್ಟು ${countdown} ಸೆಕೆಂಡ್ ನಿರೀಕ್ಷಿಸಿ...`
              : `Please wait ${countdown} seconds...`}
          </p>
          <p className="text-xs text-gray-400">
            {kn ? `ಪ್ರಯತ್ನ ${retryCount}/${MAX_RETRIES}` : `Attempt ${retryCount}/${MAX_RETRIES}`}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="py-8 space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {retryCount < MAX_RETRIES && (
            <button
              onClick={() => { hasStarted.current = false; startGeneration(retryCount + 1); }}
              className="w-full py-3 px-4 btn-primary rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {kn ? 'ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ' : 'Retry'}
            </button>
          )}
          {retryCount >= MAX_RETRIES && (
            <button
              onClick={() => { hasStarted.current = false; setRetryCount(0); startGeneration(1); }}
              className="w-full py-3 px-4 btn-primary rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {kn ? 'ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ' : 'Try Again'}
            </button>
          )}
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 'questions' })}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            {kn ? 'ಹಿಂದೆ ಹೋಗಿ' : 'Go back'}
          </button>
        </CardContent>
      </Card>
    );
  }

  // Generating state
  return (
    <Card>
      <CardContent className="py-8 space-y-5">
        {/* Main spinner + status */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex">
            <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-800">
              {kn ? 'ಆದೇಶ ರಚಿಸಲಾಗುತ್ತಿದೆ...' : 'Drafting your order...'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {kn ? 'AI ಸರಕಾರಿ ಕನ್ನಡದಲ್ಲಿ ಬರೆಯುತ್ತಿದೆ' : 'AI is writing in Sarakari Kannada'}
            </p>
          </div>
        </div>

        {/* Live word count progress bar */}
        {streamText && (() => {
          const words = streamText.split(/\s+/).filter(Boolean).length;
          const target = 650;
          const pct = Math.min(100, Math.round((words / target) * 100));
          return (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{kn ? `${words} ಪದಗಳು ರಚಿಸಲಾಗಿದೆ` : `${words} words drafted`}</span>
                <span>{kn ? `ಗುರಿ ~${target}` : `Target ~${target}`}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })()}

        {/* Steps checklist */}
        <div className="space-y-2 text-sm">
          {[
            { done: true,  label: kn ? '✓ ಪ್ರಕರಣ ವಿವರ ಸ್ವೀಕರಿಸಲಾಗಿದೆ' : '✓ Case details received' },
            { done: true,  label: kn ? '✓ ಉಲ್ಲೇಖ ಆದೇಶಗಳು ಲೋಡ್ ಆಗಿವೆ' : '✓ Reference orders loaded' },
            { done: streamText.length > 0, label: kn ? (streamText.length > 0 ? '✓ ಆದೇಶ ರಚಿಸಲಾಗುತ್ತಿದೆ' : '⏳ ಆದೇಶ ರಚಿಸಲಾಗುತ್ತಿದೆ') : (streamText.length > 0 ? '✓ Drafting order' : '⏳ Drafting order') },
            { done: false, label: kn ? '⏳ ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ' : '⏳ Quality check' },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-2 ${item.done ? 'text-green-700' : 'text-gray-400'}`}>
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center">
          {kn ? 'ದಯವಿಟ್ಟು ಕಾಯಿರಿ — 30-60 ಸೆಕೆಂಡ್ ತೆಗೆದುಕೊಳ್ಳಬಹುದು' : 'Please wait — this may take 30-60 seconds'}
        </p>
      </CardContent>
    </Card>
  );
}
