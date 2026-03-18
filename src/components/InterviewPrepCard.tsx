import { useState } from "react";
import { ChevronDown, ChevronUp, Target, Lightbulb } from "lucide-react";

const strip = (t: string) =>
  t
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .trim();

interface Question {
  number: number;
  question: string;
  background: string;
  answerDirection: string;
}

function parseInterviewQuestions(content: string): Question[] {
  const matches = Array.from(content.matchAll(/Q(\d+)[\.\．]\s*(.+)/g));
  if (!matches.length) return [];

  return matches.map((m, i) => {
    const number = parseInt(m[1], 10);
    const question = m[2].trim();
    const from = (m.index ?? 0) + m[0].length;
    const to =
      i < matches.length - 1
        ? (matches[i + 1].index ?? content.length)
        : content.length;
    const rest = content.slice(from, to).trim();

    const answerIdx = rest.search(/핵심\s*답변\s*방향/);
    let background = "";
    let answerDirection = "";

    if (answerIdx === -1) {
      background = rest;
    } else {
      background = rest.slice(0, answerIdx).trim();
      answerDirection = rest
        .slice(answerIdx)
        .replace(/^핵심\s*답변\s*방향\s*[:：]\s*/, "")
        .trim();
    }

    return {
      number,
      question: strip(question),
      background: strip(background),
      answerDirection: strip(answerDirection),
    };
  });
}

function QuestionCard({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderRadius: "12px",
        border: `1px solid ${open ? "#D1D5DB" : "#E5E7EB"}`,
        overflow: "hidden",
        transition: "border-color 0.15s",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%",
          padding: "16px 20px",
          background: open ? "#F8FAFC" : "#ffffff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
          textAlign: "left",
          transition: "background 0.15s",
        }}
      >
        <span
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#9CA3AF",
            flexShrink: 0,
            marginTop: "2px",
            minWidth: "24px",
          }}
        >
          Q{q.number}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 600,
              // color: "#2B2E34",
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {q.question}
          </p>
          {q.background && (
            <p
              style={{
                fontSize: "12px",
                color: "#9CA3AF",
                margin: "6px 0 0",
                lineHeight: 1.6,
              }}
            >
              {q.background}
            </p>
          )}
        </div>
        {open ? (
          <ChevronUp
            style={{
              width: 16,
              height: 16,
              color: "#FF7A00",
              flexShrink: 0,
              marginTop: "3px",
            }}
          />
        ) : (
          <ChevronDown
            style={{
              width: 16,
              height: 16,
              color: "#9CA3AF",
              flexShrink: 0,
              marginTop: "3px",
            }}
          />
        )}
      </button>

      {open && q.answerDirection && (
        <div style={{ padding: "12px 16px" }}>
          <div
            style={{
              backgroundColor: "#FFF3E8",
              borderRadius: "15px",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "10px",
              }}
            >
              <Lightbulb style={{ width: 20, height: 18, color: "#FF7A00" }} />
              <span
                style={{ fontSize: "15px", fontWeight: 700, color: "#FF7A00" }}
              >
                핵심 답변 방향
              </span>
            </div>
            <p
              style={{
                fontSize: "12px",
                // color: "#2B2E34",
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {q.answerDirection}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function hasInterviewQuestions(content: string): boolean {
  return /Q\d+[\.\．]/.test(content);
}

export function InterviewPrepCard({ content }: { content: string }) {
  const questions = parseInterviewQuestions(content);
  if (!questions.length) return null;

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "28px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#9CA3AF",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          INTERVIEW PREP
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🗒️</span>
          <p
            style={{
              fontWeight: 700,
              fontSize: "18px",
              color: "#2B2E34",
              margin: 0,
            }}
          >
            면접 준비 포인트
          </p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {questions.map((q) => (
          <QuestionCard key={q.number} q={q} />
        ))}
      </div>
    </div>
  );
}
