import { Fragment, type ReactNode } from 'react';
import { FileText } from 'lucide-react';

interface FinalReportSummaryProps {
  data: any;
}

function renderInlineBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function renderMarkdownText(markdown: string): ReactNode[] {
  const lines = markdown.split('\n');
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    nodes.push(
      <ul key={`list-${nodes.length}`} className="list-disc pl-5 space-y-1.5 text-sm text-slate-700 leading-relaxed">
        {listItems.map((item, index) => (
          <li key={index}>{renderInlineBold(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      nodes.push(<div key={`spacer-${nodes.length}`} className="h-2" />);
      return;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const text = heading[2];
      if (level <= 2) {
        nodes.push(
          <h4 key={`h-${nodes.length}`} className="text-base font-bold text-slate-900 mt-1">
            {renderInlineBold(text)}
          </h4>
        );
      } else {
        nodes.push(
          <h5 key={`h-${nodes.length}`} className="text-sm font-semibold text-slate-800 mt-1">
            {renderInlineBold(text)}
          </h5>
        );
      }
      return;
    }

    const dashList = line.match(/^[-*]\s+(.*)$/);
    if (dashList) {
      listItems.push(dashList[1]);
      return;
    }

    const numberedList = line.match(/^\d+\.\s+(.*)$/);
    if (numberedList) {
      listItems.push(numberedList[1]);
      return;
    }

    flushList();
    nodes.push(
      <p key={`p-${nodes.length}`} className="text-sm text-slate-700 leading-relaxed">
        {renderInlineBold(line)}
      </p>
    );
  });

  flushList();
  return nodes;
}

function extractSection(report: string, startKeyword: string, nextKeyword?: string): string {
  const escapedStart = startKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startPattern = new RegExp(`(?:^|\\n)(?:##\\s*)?\\d+\\.\\s*${escapedStart}[^\\n]*`, 'm');
  const startMatch = report.match(startPattern);
  if (!startMatch || startMatch.index === undefined) return '';

  const startOffset = startMatch[0].startsWith('\n') ? 1 : 0;
  const startIndex = startMatch.index + startOffset;

  if (!nextKeyword) {
    return report.slice(startIndex).trim();
  }

  const escapedNext = nextKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const nextPattern = new RegExp(`\\n(?:##\\s*)?\\d+\\.\\s*${escapedNext}[^\\n]*`, 'm');
  const rest = report.slice(startIndex + 1);
  const nextMatch = rest.match(nextPattern);

  if (!nextMatch || nextMatch.index === undefined) {
    return report.slice(startIndex).trim();
  }

  const endIndex = startIndex + 1 + nextMatch.index;
  return report.slice(startIndex, endIndex).trim();
}

export function FinalReportSummary({ data }: FinalReportSummaryProps) {
  const apiResponse = data?.apiResponse ?? data ?? {};
  const finalReport = typeof apiResponse.final_report === 'string' ? apiResponse.final_report : '';

  const interviewSection = extractSection(finalReport, '면접 준비 포인트', '최종 권고사항');
  const recommendationSection = extractSection(finalReport, '최종 권고사항');
  const focusedSections = [interviewSection, recommendationSection].filter(Boolean);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-indigo-700" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-xl">면접 준비 포인트 및 최종 권고사항</h2>
          <p className="text-sm text-slate-600">원문 리포트에서 핵심 실행 파트만 추출했습니다.</p>
        </div>
      </div>

      {focusedSections.length > 0 ? (
        <div className="space-y-4">
          {focusedSections.map((section, index) => (
            <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
              {renderMarkdownText(section)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-600">표시할 최종 리포트 요약 데이터가 없습니다.</p>
      )}
    </div>
  );
}
