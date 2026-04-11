"use client";

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateAnswers } from '@/lib/pipeline/validateAnswers';
import type { PipelineAction, OfficerAnswers, OrderOutcome } from '@/lib/pipeline/types';

interface QuestionsStepProps {
  dispatch: React.Dispatch<PipelineAction>;
  locale: string;
  aiQuestions: string[];
  officerName: string;
  isSimplePath: boolean;
}

export function QuestionsStep({
  dispatch,
  locale,
  aiQuestions,
  officerName,
  isSimplePath,
}: QuestionsStepProps) {
  const kn = locale === 'kn';

  const [outcome, setOutcome] = useState<OrderOutcome | ''>('');
  const [officerNameVal, setOfficerNameVal] = useState(officerName);
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split('T')[0]); // default today
  const [relatedCases, setRelatedCases] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [caseDetailsText, setCaseDetailsText] = useState(''); // for simple path
  const [errors, setErrors] = useState<string[]>([]);

  const aiQuestion = aiQuestions[0] ?? (kn
    ? 'ಈ ಪ್ರಕರಣದ ಬಗ್ಗೆ ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ಇದ್ದರೆ ನಮೂದಿಸಿ'
    : 'Any additional details about this case?'
  );

  function handleSubmit() {
    // For simple path, validate that case details are filled
    if (isSimplePath && !caseDetailsText.trim()) {
      setErrors([kn ? 'ಪ್ರಕರಣ ವಿವರಗಳು / Case Details' : 'Case Details / ಪ್ರಕರಣ ವಿವರಗಳು']);
      return;
    }

    const answers: Partial<OfficerAnswers> = {
      outcome: outcome as OrderOutcome,
      officerName: officerNameVal,
      orderDate,
      relatedCases: relatedCases || undefined,
      // For simple path, case details go into aiQuestionAnswer so Sarvam can use them
      aiQuestionAnswer: isSimplePath ? caseDetailsText : aiAnswer,
    };

    const validation = validateAnswers(answers);
    if (!validation.valid) {
      setErrors(validation.missingFields);
      return;
    }

    setErrors([]);
    dispatch({
      type: 'SET_ANSWERS',
      answers: answers as OfficerAnswers,
    });
  }

  const OUTCOMES: { value: OrderOutcome; labelEn: string; labelKn: string }[] = [
    { value: 'Allowed',   labelEn: 'Allowed',   labelKn: 'ಪುರಸ್ಕರಿಸಿದೆ' },
    { value: 'Dismissed', labelEn: 'Dismissed', labelKn: 'ವಜಾಗೊಳಿಸಿದೆ' },
    { value: 'Remanded',  labelEn: 'Remanded',  labelKn: 'ಮರಳಿ ಕಳುಹಿಸಲಾಗಿದೆ' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {kn ? 'ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ' : 'Answer a few questions'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {kn ? 'ದಯವಿಟ್ಟು ಈ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬಿಸಿ: ' : 'Please fill in: '}
              {errors.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Simple path: text form instead of file upload */}
        {isSimplePath && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {kn ? 'ಪ್ರಕರಣ ವಿವರಗಳು *' : 'Case Details *'}
            </label>
            <textarea
              value={caseDetailsText}
              onChange={e => setCaseDetailsText(e.target.value)}
              rows={4}
              placeholder={kn ? 'ಪ್ರಕರಣ ಸಂಖ್ಯೆ, ಪಕ್ಷಕಾರರ ಹೆಸರು, ಸರ್ವೆ ನಂಬರ್...' : 'Case number, party names, survey number...'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
        )}

        {/* Q1: Outcome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {kn ? 'ತೀರ್ಪು ಏನು? *' : 'What is the outcome? *'}
          </label>
          <div className="flex gap-2">
            {OUTCOMES.map(o => (
              <button
                key={o.value}
                onClick={() => setOutcome(o.value)}
                className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  outcome === o.value
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <span className="block">{kn ? o.labelKn : o.labelEn}</span>
                <span className="block text-xs text-gray-400">{kn ? o.labelEn : o.labelKn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Q2: Officer name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {kn ? 'ಅಧ್ಯಕ್ಷ ಅಧಿಕಾರಿ ಹೆಸರು *' : 'Presiding Officer Name *'}
          </label>
          <input
            type="text"
            value={officerNameVal}
            onChange={e => setOfficerNameVal(e.target.value)}
            placeholder={kn ? 'ನಿಮ್ಮ ಹೆಸರು ನಮೂದಿಸಿ' : 'Enter your name'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          {!officerNameVal && (
            <p className="text-xs text-amber-600 mt-1">
              {kn ? 'ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ಹೆಸರು ಸೇರಿಸಿ — ಪ್ರತಿ ಬಾರಿ ತುಂಬಿಸುವ ಅಗತ್ಯ ಇರುವುದಿಲ್ಲ' : 'Add your name in profile to auto-fill this every time'}
            </p>
          )}
        </div>

        {/* Q3: Order date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {kn ? 'ಆದೇಶ ದಿನಾಂಕ *' : 'Order Date *'}
          </label>
          <input
            type="date"
            value={orderDate}
            onChange={e => setOrderDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Q4: Related cases (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {kn ? 'ಸಂಬಂಧಿತ ಹಿಂದಿನ ಪ್ರಕರಣಗಳು (ಐಚ್ಛಿಕ)' : 'Related Previous Cases (Optional)'}
          </label>
          <input
            type="text"
            value={relatedCases}
            onChange={e => setRelatedCases(e.target.value)}
            placeholder={kn ? 'ಉದಾ: ಅಪೀಲು 11/2018-19' : 'e.g. Appeal 11/2018-19'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Q5: AI-generated case-specific question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {aiQuestion}
          </label>
          <input
            type="text"
            value={aiAnswer}
            onChange={e => setAiAnswer(e.target.value)}
            placeholder={kn ? 'ಉತ್ತರ ನಮೂದಿಸಿ...' : 'Enter your answer...'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3.5 px-4 btn-primary rounded-lg font-medium text-base transition-colors"
        >
          {kn ? 'ಆದೇಶ ರಚಿಸಿ →' : 'Generate Order →'}
        </button>
      </CardContent>
    </Card>
  );
}
