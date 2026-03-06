import { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { UploadSection } from './components/UploadSection';
import { IndustryAnalysis } from './components/IndustryAnalysis';
import { ResumeReview } from './components/ResumeReview';
import { SwotAnalysis } from './components/SwotAnalysis';
import { FinalReportSummary } from './components/FinalReportSummary';
import { Download } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis'>('upload');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const reportExportRef = useRef<HTMLDivElement | null>(null);
  const cancelAnalysisRef = useRef<(() => void) | null>(null);

  const handleAnalysisComplete = (data: any) => { setAnalysisData(data); setActiveTab('analysis'); };

  const handleTabClick = (tab: 'upload' | 'analysis') => {
    if (tab === activeTab) return;
    if (isAnalyzing) {
      const confirmed = window.confirm('분석이 취소됩니다. 계속하시겠습니까?');
      if (!confirmed) return;
      cancelAnalysisRef.current?.();
    }
    setActiveTab(tab);
  };

  const api = analysisData?.apiResponse ?? analysisData ?? {};
  const profile = api.resume_profile ?? {};
  const slug = (v: string) => v.trim().replace(/\s+/g, '-').replace(/[^\w\-가-힣]/g, '').slice(0, 40) || 'report';

  const handleExportPdf = async () => {
    if (!reportExportRef.current) return;
    try {
      setIsExportingPdf(true);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 12, pageW = 210, pageH = 297;
      const printW = pageW - margin * 2;
      const maxH = pageH - margin * 2;
      let curY = margin;
      let isFirstSection = true;

      const sections = Array.from(reportExportRef.current.children) as HTMLElement[];
      for (const section of sections) {
        const dataUrl = await toPng(section, { cacheBust: true, pixelRatio: 2, backgroundColor: '#F5F6FA' });
        const img = await new Promise<HTMLImageElement>((res, rej) => {
          const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataUrl;
        });
        const imgH = (img.height * printW) / img.width;

        // 현재 페이지에 안 들어가면 새 페이지로
        if (!isFirstSection && curY + imgH > pageH - margin) {
          pdf.addPage();
          curY = margin;
        }

        // 단일 섹션이 한 페이지를 넘는 경우 — 기계적으로 분할
        if (imgH > maxH) {
          let remaining = imgH;
          let srcY = 0;
          while (remaining > 0) {
            const sliceH = Math.min(remaining, maxH - curY + margin);
            const sliceRatio = sliceH / imgH;
            const srcSliceH = Math.round(img.height * sliceRatio);
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = srcSliceH;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, -Math.round(srcY));
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, curY, printW, sliceH, undefined, 'FAST');
            srcY += srcSliceH;
            remaining -= sliceH;
            curY += sliceH;
            if (remaining > 0) { pdf.addPage(); curY = margin; }
          }
        } else {
          pdf.addImage(dataUrl, 'PNG', margin, curY, printW, imgH, undefined, 'FAST');
          curY += imgH + 4;
        }
        isFirstSection = false;
      }

      const burl = URL.createObjectURL(pdf.output('blob'));
      const a = document.createElement('a'); a.href = burl; a.download = `${new Date().toISOString().slice(0, 10)}-${slug(profile.company || 'company')}-report.pdf`;
      document.body.appendChild(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(burl), 1000);
    } catch (e) { window.alert('PDF 생성 중 오류가 발생했습니다.'); console.error(e); }
    finally { setIsExportingPdf(false); }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(api, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `${new Date().toISOString().slice(0, 10)}-${slug(profile.company || 'company')}-full.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F6FA', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '0 28px' }}>
          <div style={{ paddingTop: '20px', paddingBottom: '0' }}>
            <h1 style={{ fontWeight: 800, fontSize: '20px', color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>AI 취업 전략 리포트</h1>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>자소서 기반 맞춤형 면접 전략을 분석합니다</p>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', marginTop: '12px' }}>
            {(['upload', 'analysis'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button key={tab} onClick={() => handleTabClick(tab)} style={{
                  padding: '10px 4px', marginRight: '28px', fontSize: '14px', fontWeight: isActive ? 700 : 400,
                  color: isActive ? '#111827' : '#9CA3AF',
                  background: 'none', border: 'none',
                  borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {tab === 'upload' ? '자소서 업로드' : '분석 결과'}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '980px', margin: '0 auto', padding: '28px 28px 80px' }}>
        {activeTab === 'upload' ? (
          <UploadSection
            onAnalysisComplete={handleAnalysisComplete}
            onAnalyzingChange={(analyzing, cancel) => {
              setIsAnalyzing(analyzing);
              cancelAnalysisRef.current = cancel ?? null;
            }}
          />
        ) : (
          <div ref={reportExportRef} id="report-export-root" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(profile.company || profile.job_title) && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
                  {[{ label: '지원 기업', val: profile.company }, { label: '직무', val: profile.job_title }, { label: '산업', val: profile.industry }]
                    .filter(i => i.val).map(item => (
                      <div key={item.label}>
                        <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '2px', fontWeight: 500 }}>{item.label}</p>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{item.val}</p>
                      </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[{ label: isExportingPdf ? '생성 중...' : 'PDF', fn: handleExportPdf, dis: isExportingPdf }, { label: 'JSON', fn: handleExportJson, dis: false }].map(b => (
                    <button key={b.label} onClick={b.fn} disabled={b.dis} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#4B5563', backgroundColor: '#F3F4F6', border: 'none', cursor: 'pointer' }}>
                      <Download style={{ width: '13px', height: '13px' }} />{b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <ResumeReview data={analysisData} />
            <IndustryAnalysis data={analysisData} />
            <SwotAnalysis data={analysisData} />
            <FinalReportSummary data={analysisData} />
          </div>
        )}
      </main>
    </div>
  );
}
