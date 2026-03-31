import { useState, useEffect } from 'react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export default function Quiz({ section }: { section: string }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/quiz/${section}.json`)
      .then((r) => r.json())
      .then(setQuestions)
      .catch(() => setQuestions([]));
  }, [section]);

  if (questions.length === 0) {
    return <p style={{ color: 'var(--sl-color-gray-3)' }}>퀴즈를 불러오는 중...</p>;
  }

  if (finished) {
    return (
      <div style={{ padding: '1.5rem', border: '1px solid var(--sl-color-gray-5)', borderRadius: '0.5rem', background: 'var(--sl-color-gray-7)' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--sl-color-white)' }}>퀴즈 완료!</h3>
        <p style={{ fontSize: '1.25rem', color: 'var(--sl-color-white)' }}>
          {questions.length}문제 중 <strong>{score}</strong>문제 정답
        </p>
        <p style={{ color: 'var(--sl-color-gray-3)' }}>
          정답률: {Math.round((score / questions.length) * 100)}%
        </p>
        <button
          onClick={() => { setCurrent(0); setSelected(null); setShowResult(false); setScore(0); setFinished(false); }}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--sl-color-accent)', color: 'var(--sl-color-black)', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600 }}
        >
          다시 풀기
        </button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div style={{ padding: '1.5rem', border: '1px solid var(--sl-color-gray-5)', borderRadius: '0.5rem', background: 'var(--sl-color-gray-7)' }}>
      <p style={{ color: 'var(--sl-color-gray-3)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
        {current + 1} / {questions.length}
      </p>
      <h4 style={{ margin: '0 0 1rem 0', color: 'var(--sl-color-white)' }}>{q.question}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {q.options.map((opt, i) => {
          let bg = 'var(--sl-color-gray-6)';
          if (showResult && i === q.answer) bg = '#22863a';
          else if (showResult && i === selected && i !== q.answer) bg = '#cb2431';
          else if (!showResult && i === selected) bg = 'var(--sl-color-gray-4)';

          return (
            <button
              key={i}
              onClick={() => { if (!showResult) setSelected(i); }}
              style={{ padding: '0.75rem 1rem', background: bg, color: 'var(--sl-color-white)', border: '1px solid var(--sl-color-gray-5)', borderRadius: '0.375rem', cursor: showResult ? 'default' : 'pointer', textAlign: 'left', transition: 'background 0.2s' }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {showResult && (
        <p style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--sl-color-gray-6)', borderRadius: '0.375rem', color: 'var(--sl-color-gray-2)', fontSize: '0.9rem' }}>
          {q.explanation}
        </p>
      )}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        {!showResult ? (
          <button
            disabled={selected === null}
            onClick={() => { setShowResult(true); if (selected === q.answer) setScore((s) => s + 1); }}
            style={{ padding: '0.5rem 1rem', background: selected !== null ? 'var(--sl-color-accent)' : 'var(--sl-color-gray-5)', color: selected !== null ? 'var(--sl-color-black)' : 'var(--sl-color-gray-3)', border: 'none', borderRadius: '0.25rem', cursor: selected !== null ? 'pointer' : 'not-allowed', fontWeight: 600 }}
          >
            정답 확인
          </button>
        ) : (
          <button
            onClick={() => {
              if (current + 1 < questions.length) {
                setCurrent((c) => c + 1);
                setSelected(null);
                setShowResult(false);
              } else {
                setFinished(true);
              }
            }}
            style={{ padding: '0.5rem 1rem', background: 'var(--sl-color-accent)', color: 'var(--sl-color-black)', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600 }}
          >
            {current + 1 < questions.length ? '다음 문제' : '결과 보기'}
          </button>
        )}
      </div>
    </div>
  );
}
