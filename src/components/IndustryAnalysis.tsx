import { Fragment, type ReactNode, useState } from 'react';
import { TrendingUp, Newspaper, AlertCircle, CheckCircle } from 'lucide-react';

interface IndustryAnalysisProps {
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

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
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

function parseAnalysisSections(markdown: string): Array<{ title: string; body: string }> {
  const trimmed = markdown.trim();
  if (!trimmed) return [];

  const sections: Array<{ title: string; body: string }> = [];
  const headingRegex = /^###\s+(.*)$/gm;
  const matches = Array.from(trimmed.matchAll(headingRegex));

  if (matches.length === 0) {
    return [{ title: 'AI 종합 분석', body: trimmed }];
  }

  matches.forEach((match, index) => {
    const title = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = index < matches.length - 1 ? (matches[index + 1].index ?? trimmed.length) : trimmed.length;
    const body = trimmed.slice(start, end).trim();
    sections.push({ title, body });
  });

  return sections;
}

function toKstDate(iso: string) {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function IndustryAnalysis({ data }: IndustryAnalysisProps) {
  const [showAllNews, setShowAllNews] = useState(false);
  const apiResponse = data?.apiResponse ?? data ?? {};
  const resumeProfile = apiResponse.resume_profile ?? {};
  const matchedNews = Array.isArray(apiResponse.matched_news) ? apiResponse.matched_news : [];
  const analysisSections = parseAnalysisSections(apiResponse.relevance_analysis || '');
  const visibleNews = showAllNews ? matchedNews : matchedNews.slice(0, 3);

  const keyInsights = [
    `${resumeProfile.industry || '목표 산업'} 관련 매칭 뉴스 ${apiResponse.matched_news_count ?? matchedNews.length ?? 0}건 수집`,
    `${resumeProfile.company || '목표 기업'} 지원 기준으로 산업 연관 기사 선별`,
    `보유 스킬 ${Array.isArray(resumeProfile.skills) ? resumeProfile.skills.length : 0}개 기반 적합도 분석`,
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-xl">산업 동향 분석</h2>
          <p className="text-sm text-slate-600">{resumeProfile.industry || '산업'} 맞춤 뉴스/트렌드 분석</p>
        </div>
      </div>

      <div className="mb-5 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-slate-900 mb-3">핵심 인사이트</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {keyInsights.map((text, index) => (
            <div key={index} className="flex items-start gap-2">
              {index === 1 ? (
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-sm text-slate-700">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          관련 뉴스 분석 ({matchedNews.length}건)
        </h3>

        {matchedNews.length === 0 && (
          <div className="border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
            매칭된 뉴스 데이터가 없습니다.
          </div>
        )}

        {visibleNews.map((trend: any, index: number) => {
          const similarity = typeof trend.distance === 'number' ? Math.max(0, Math.min(100, Math.round((1 - trend.distance) * 100))) : null;

          return (
            <a
              key={`${trend.id || index}`}
              href={trend.url}
              target="_blank"
              rel="noreferrer"
              className="block border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2 gap-3">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 mb-1">{trend.title || '제목 없음'}</h4>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span>{trend.job_category || '뉴스'}</span>
                    <span>•</span>
                    <span>{toKstDate(trend.published_at)}</span>
                  </div>
                </div>
                {similarity !== null && (
                  <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-blue-700">유사도</span>
                    <span className="font-bold text-blue-900">{similarity}%</span>
                  </div>
                )}
              </div>

              {trend.url && <p className="text-xs text-blue-700 break-all">{trend.url}</p>}
            </a>
          );
        })}

        {matchedNews.length > 3 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAllNews((prev) => !prev)}
              className="text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              {showAllNews ? '기사 접기' : `기사 더 보기 (+${matchedNews.length - 3})`}
            </button>
          </div>
        )}
      </div>

      {apiResponse.relevance_analysis && (
        <div className="mt-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="font-medium text-slate-900 mb-2">AI 종합 분석</h4>
          <p className="text-xs text-slate-500 mb-3">핵심 요약을 먼저 보고, 필요한 섹션만 펼쳐서 확인하세요.</p>
          <div className="space-y-2">
            {analysisSections.map((section, index) => (
              <details key={`${section.title}-${index}`} className="group rounded-lg border border-slate-200 bg-white">
                <summary className="list-none cursor-pointer px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-2xl font-bold text-slate-900 leading-tight">{section.title}</p>
                    </div>
                    <span className="text-xs font-medium text-blue-700 group-open:hidden">펼치기</span>
                    <span className="text-xs font-medium text-blue-700 hidden group-open:inline">접기</span>
                  </div>
                </summary>
                <div className="border-t border-slate-200 px-4 py-3">
                  <div className="space-y-2">{renderMarkdownText(section.body)}</div>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
