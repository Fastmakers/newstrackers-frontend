import { Fragment, type ReactNode } from 'react';

/** **bold**, *italic*, `code` 인라인 처리 */
export function renderInline(text: string): ReactNode[] {
  // **bold**, `code` 처리
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <mark key={i} style={{ backgroundColor: '#FEF9C3', fontWeight: 700, color: '#2B2E34', padding: '0 2px', borderRadius: '3px', fontStyle: 'normal' }}>{part.slice(2, -2)}</mark>;
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
  baseSize?: number;  // px, default 15
  baseColor?: string; // default #2B2E34
}

/** 마크다운 블록 렌더링 (heading, list, paragraph, hr) */
export function renderMarkdown(markdown: string, opts: MdOptions = {}): ReactNode[] {
  const { baseSize = 15, baseColor = '#2B2E34' } = opts;
  const lines = markdown.split('\n');
  const nodes: ReactNode[] = [];
  let listItems: Array<{ text: string; numbered: boolean; index: number }> = [];
  let listCounter = 0;

  const flushList = () => {
    if (!listItems.length) return;
    const isNum = listItems[0].numbered;
    const key = `list-${nodes.length}`;
    nodes.push(
      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '4px 0' }}>
        {listItems.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            {isNum ? (
              <span style={{
                width: '20px', height: '20px', minWidth: '20px', borderRadius: '50%',
                backgroundColor: '#EEF2FF', color: '#4F46E5',
                fontSize: '11px', fontWeight: 700, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {item.index}
              </span>
            ) : (
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#616161', marginTop: '8px', flexShrink: 0, display: 'block' }} />
            )}
            <span style={{ fontSize: `${baseSize}px`, color: baseColor, lineHeight: 1.7 }}>{renderInline(item.text)}</span>
          </div>
        ))}
      </div>
    );
    listItems = [];
    listCounter = 0;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      nodes.push(<div key={`sp-${nodes.length}`} style={{ height: '6px' }} />);
      continue;
    }

    if (/^---+$/.test(line)) {
      flushList();
      nodes.push(<div key={`hr-${nodes.length}`} style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '10px 0' }} />);
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
        fontSize: level === 1 ? '18px' : level === 2 ? '16px' : `${baseSize + 1}px`,
      };
      nodes.push(<p key={`h-${nodes.length}`} style={styles}>{renderInline(hm[2])}</p>);
      continue;
    }

    const dm = line.match(/^[-*•]\s+(.+)$/);
    if (dm) {
      listItems.push({ text: dm[1], numbered: false, index: 0 });
      continue;
    }

    const nm = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (nm) {
      listCounter++;
      listItems.push({ text: nm[2], numbered: true, index: listCounter });
      continue;
    }

    flushList();
    nodes.push(
      <p key={`p-${nodes.length}`} style={{ fontSize: `${baseSize}px`, color: baseColor, lineHeight: 1.75, margin: '2px 0' }}>
        {renderInline(line)}
      </p>
    );
  }

  flushList();
  return nodes;
}
