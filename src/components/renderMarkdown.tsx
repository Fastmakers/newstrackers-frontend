import { Fragment, type ReactNode } from 'react';

/** **bold**, *italic*, `code` 인라인 처리 */
export function renderInline(text: string, highlightBg = '#FEF9C3'): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <mark key={i} style={{ backgroundColor: highlightBg, fontWeight: 700, color: '#2B2E34', padding: '0 2px', borderRadius: '3px', fontStyle: 'normal' }}>{part.slice(2, -2)}</mark>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={{ backgroundColor: '#F3F4F6', color: '#2B2E34', padding: '1px 5px', borderRadius: '4px', fontSize: '0.9em', fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

interface MdOptions {
  baseSize?: number;             // px, default 15
  baseColor?: string;            // default #2B2E34
  numStyle?: 'circle' | 'card' | 'simple'; // default 'circle'
  bulletAsNumber?: boolean;      // 불릿(-)을 번호 뱃지로 렌더링
  simpleBadgeBg?: string;        // simple 뱃지 배경색 (default #F3F4F6)
  simpleBadgeColor?: string;     // simple 뱃지 글자색 (default #6B7280)
  bulletColor?: string;          // card 스타일 불릿 색상 (default #FF7A00)
  highlightBg?: string;          // **bold** 하이라이트 배경색 (default #FEF9C3)
  sectionBg?: string | ((title: string) => string | undefined); // ## 헤딩 이후 내용을 박스로 감쌈
  sectionHeader?: (title: string) => ReactNode | undefined;     // 박스 상단에 주입할 헤더
}

/** 마크다운 블록 렌더링 (heading, list, paragraph, hr) */
export function renderMarkdown(markdown: string, opts: MdOptions = {}): ReactNode[] {
  const { baseSize = 15, baseColor = '#2B2E34', numStyle = 'circle', bulletAsNumber = false, simpleBadgeBg = '#F3F4F6', simpleBadgeColor = '#6B7280', bulletColor = '#FF7A00', highlightBg = '#FEF9C3', sectionBg, sectionHeader } = opts;
  const lines = markdown.split('\n');
  const nodes: ReactNode[] = [];

  // sectionBg 사용 시 현재 섹션 내용을 따로 수집
  let sectionBuffer: ReactNode[] = [];
  let inSection = false;
  let currentSectionTitle = '';

  const resolveBg = (title: string): string | undefined =>
    typeof sectionBg === 'function' ? sectionBg(title) : sectionBg;

  const target = (node: ReactNode) => {
    if (inSection && resolveBg(currentSectionTitle)) sectionBuffer.push(node);
    else nodes.push(node);
  };

  const flushSection = () => {
    const bg = resolveBg(currentSectionTitle);
    if (inSection && bg && sectionBuffer.length > 0) {
      const header = sectionHeader?.(currentSectionTitle);
      nodes.push(
        <div key={`sec-box-${nodes.length}`} style={{
          backgroundColor: bg,
          borderRadius: '12px',
          padding: '14px 18px',
          marginTop: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {header}
          {sectionBuffer}
        </div>
      );
    }
    sectionBuffer = [];
  };

  let listItems: Array<{ text: string; numbered: boolean; index: number }> = [];
  let listCounter = 0;

  const flushList = () => {
    if (!listItems.length) return;
    const isNum = listItems[0].numbered;
    const key = `list-${nodes.length}-${sectionBuffer.length}`;
    const node = (
      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: isNum && numStyle === 'card' ? '6px' : isNum && numStyle === 'simple' ? '20px' : '8px', margin: '4px 0' }}>
        {listItems.map((item, i) => {
          const dashIdx = item.text.indexOf(' — ');
          const colonIdx = dashIdx === -1 ? item.text.indexOf(': ') : -1;
          const hasDash = dashIdx !== -1;
          const hasColon = colonIdx !== -1;
          const title = hasDash ? item.text.slice(0, dashIdx) : hasColon ? item.text.slice(0, colonIdx) : null;
          const body  = hasDash ? item.text.slice(dashIdx + 3) : hasColon ? item.text.slice(colonIdx + 2) : item.text;

          if (isNum && numStyle === 'simple') {
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <span style={{
                  width: '28px', height: '28px', minWidth: '28px', borderRadius: '50%',
                  backgroundColor: simpleBadgeBg, color: simpleBadgeColor,
                  fontSize: '14px', fontWeight: 700, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px',
                }}>
                  {item.index}
                </span>
                <span style={{ fontSize: `${baseSize}px`, color: baseColor, lineHeight: 1.65, paddingTop: '4px' }}>{renderInline(body, highlightBg)}</span>
              </div>
            );
          }

          if (isNum && numStyle === 'card') {
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '10px',
                border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF',
              }}>
                <span style={{
                  width: '26px', height: '26px', minWidth: '26px', borderRadius: '8px',
                  backgroundColor: '#F3F4F6', color: '#6B7280',
                  fontSize: '13px', fontWeight: 700, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {item.index}
                </span>
                {(hasDash || hasColon) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: `${baseSize}px`, fontWeight: 700, color: '#1F2937', lineHeight: 1.5 }}>{renderInline(title!, highlightBg)}</span>
                    <span style={{ fontSize: `${baseSize - 1}px`, color: '#6B7280', lineHeight: 1.6 }}>{renderInline(body, highlightBg)}</span>
                  </div>
                ) : (
                  <span style={{ fontSize: `${baseSize}px`, color: '#1F2937', lineHeight: 1.6 }}>{renderInline(body, highlightBg)}</span>
                )}
              </div>
            );
          }

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              {isNum ? (
                <span style={{
                  width: '28px', height: '28px', minWidth: '28px', borderRadius: '50%',
                  backgroundColor: '#FF7A00', color: '#ffffff',
                  fontSize: '13px', fontWeight: 700, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {item.index}
                </span>
              ) : numStyle === 'card' ? (
                <span style={{ width: '9px', height: '9px', minWidth: '9px', borderRadius: '50%', backgroundColor: bulletColor, marginTop: '6px', flexShrink: 0, display: 'block' }} />
              ) : (
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#616161', marginTop: '8px', flexShrink: 0, display: 'block' }} />
              )}
              {(hasDash || hasColon) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: `${baseSize}px`, fontWeight: 700, color: baseColor, lineHeight: 1.5 }}>{renderInline(title!, highlightBg)}</span>
                  <span style={{ fontSize: `${baseSize - 1}px`, color: '#4E5968', lineHeight: 1.7 }}>{renderInline(body, highlightBg)}</span>
                </div>
              ) : (
                <span style={{ fontSize: `${baseSize}px`, color: baseColor, lineHeight: 1.7 }}>{renderInline(body, highlightBg)}</span>
              )}
            </div>
          );
        })}
      </div>
    );
    target(node);
    listItems = [];
    listCounter = 0;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      target(<div key={`sp-${nodes.length}-${sectionBuffer.length}`} style={{ height: '6px' }} />);
      continue;
    }

    if (/^---+$/.test(line)) {
      flushList();
      target(<div key={`hr-${nodes.length}-${sectionBuffer.length}`} style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '10px 0' }} />);
      continue;
    }

    const hm = line.match(/^(#{1,6})\s+(.+)$/);
    if (hm) {
      flushList();
      const level = hm[1].length;
      const styles: React.CSSProperties = {
        fontWeight: 700,
        color: '#2B2E34',
        margin: '14px 0 6px',
        fontSize: level === 1 ? '26px' : level === 2 ? '19px' : `${baseSize + 2}px`,
      };
      if (level >= 2) {
        // 새 ## 섹션 시작 시 이전 섹션 박스 flush
        if (sectionBg) {
          flushSection();
          currentSectionTitle = hm[2];
          inSection = true;
        }
        nodes.push(
          <div key={`h-${nodes.length}`} style={{ margin: '14px 0 6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ ...styles, margin: 0, whiteSpace: 'nowrap' }}>
              {renderInline(hm[2], highlightBg)}
            </span>
            <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, #FED7AA, transparent)' }} />
          </div>
        );
      } else {
        if (sectionBg) { flushSection(); inSection = false; }
        nodes.push(<p key={`h-${nodes.length}`} style={styles}>{renderInline(hm[2], highlightBg)}</p>);
      }
      continue;
    }

    const dm = line.match(/^[-*•]\s+(.+)$/);
    if (dm) {
      if (bulletAsNumber) {
        listCounter++;
        listItems.push({ text: dm[1], numbered: true, index: listCounter });
      } else {
        listItems.push({ text: dm[1], numbered: false, index: 0 });
      }
      continue;
    }

    const nm = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (nm) {
      listCounter++;
      listItems.push({ text: nm[2], numbered: true, index: listCounter });
      continue;
    }

    flushList();
    target(
      <p key={`p-${nodes.length}-${sectionBuffer.length}`} style={{ fontSize: `${baseSize}px`, color: baseColor, lineHeight: 1.75, margin: '2px 0' }}>
        {renderInline(line, highlightBg)}
      </p>
    );
  }

  flushList();
  flushSection();
  return nodes;
}
