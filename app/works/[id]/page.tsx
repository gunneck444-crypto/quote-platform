'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function WorkDetailPage() {
  const [work, setWork] = useState<any>(null)
  const [quotes, setQuotes] = useState<any[]>([])
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  useEffect(() => {
    const init = async () => {
      const { data: workData } = await supabase
        .from('works')
        .select('*')
        .eq('id', id)
        .single()
      if (workData) setWork(workData)

      const { data: quotesData } = await supabase
        .from('quotes')
        .select('*, characters(id, name)')
        .eq('work_id', id)
        .order('created_at', { ascending: false })
      if (quotesData) setQuotes(quotesData)
    }
    init()
  }, [id])

  if (!work) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Noto+Serif+JP:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; color: #c9b8e8; font-family: 'Noto Serif JP', serif; min-height: 100vh; }
        .bg-layer {
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse at 20% 50%, rgba(80, 0, 120, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(120, 0, 60, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 90%, rgba(0, 40, 100, 0.15) 0%, transparent 60%);
          pointer-events: none; z-index: 0;
        }
        .container { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; padding: 48px 24px; }
        .back-btn {
          background: none; border: 1px solid rgba(120,60,180,0.4); color: #a070d0;
          padding: 6px 16px; cursor: pointer; font-family: inherit; font-size: 11px;
          letter-spacing: 2px; margin-bottom: 48px; display: inline-block;
        }
        .info-card {
          background: linear-gradient(160deg, rgba(18, 8, 30, 0.95), rgba(8, 4, 18, 0.98));
          border: 1px solid rgba(80, 30, 130, 0.4);
          border-left: 2px solid rgba(140, 60, 220, 0.6);
          padding: 32px 40px; margin-bottom: 48px; position: relative;
        }
        .info-card::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, rgba(160, 80, 255, 0.4), transparent);
        }
        .eyebrow { font-size: 10px; letter-spacing: 5px; color: #5a3a7a; text-transform: uppercase; margin-bottom: 12px; }
        .title { font-family: 'Cinzel Decorative', serif; font-size: clamp(16px, 3vw, 24px); color: #e8d5ff; margin-bottom: 16px; }
        .description { font-size: 14px; line-height: 1.8; color: #a090c0; margin-bottom: 16px; }
        .category-badge {
          display: inline-block; padding: 4px 12px;
          border: 1px solid rgba(120,60,180,0.4); font-size: 11px; letter-spacing: 2px; color: #7a4fa0;
        }
        .external-link {
          display: inline-block; margin-top: 12px; font-size: 11px; letter-spacing: 2px;
          color: #8060b0; text-decoration: none; border-bottom: 1px solid rgba(120,60,180,0.3);
        }
        .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .section-title { font-family: 'Cinzel Decorative', serif; font-size: 13px; letter-spacing: 3px; color: #a070d0; white-space: nowrap; }
        .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(100, 40, 160, 0.6), transparent); }
        .quote-card {
          background: linear-gradient(160deg, rgba(18, 8, 30, 0.95), rgba(8, 4, 18, 0.98));
          border: 1px solid rgba(80, 30, 130, 0.4); border-left: 2px solid rgba(140, 60, 220, 0.6);
          padding: 24px 32px; margin-bottom: 16px; cursor: pointer; transition: all 0.3s; position: relative;
        }
        .quote-card::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, rgba(160, 80, 255, 0.4), transparent);
        }
        .quote-card:hover { border-left-color: rgba(200, 100, 255, 0.8); transform: translateX(3px); }
        .quote-content { font-size: 15px; line-height: 1.9; color: #ddd0f5; font-style: italic; margin-bottom: 12px; }
        .quote-meta { font-size: 11px; letter-spacing: 2px; color: #7a5aa0; }
        .quote-meta::before { content: '— '; }
        .char-link { color: #a070d0; cursor: pointer; }
        .char-link:hover { text-decoration: underline; }
        .empty-state { text-align: center; padding: 40px; color: #4a2a6a; font-size: 13px; letter-spacing: 3px; }
      `}</style>

      <div className="bg-layer" />
      <div className="container">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '48px' }}>
          <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => router.back()}>← 戻る</button>
          <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => router.push('/')}>ホーム</button>
        </div>

        <div className="info-card">
          <div className="eyebrow">Work</div>
          <h1 className="title">{work.title}</h1>
          {work.description && <p className="description">{work.description}</p>}
          {work.category && <span className="category-badge">{work.category}</span>}
          {work.external_link && (
            <a className="external-link" href={work.external_link} target="_blank" rel="noopener noreferrer">
              外部リンク →
            </a>
          )}
        </div>

        <div className="section-header">
          <span className="section-title">この作品の言霊</span>
          <div className="section-line" />
        </div>

        {quotes.length === 0 ? (
          <div className="empty-state">— 言霊はまだない —</div>
        ) : (
          quotes.map((q) => (
            <div key={q.id} className="quote-card" onClick={() => router.push(`/quotes/${q.id}`)}>
              <p className="quote-content">{q.content}</p>
              <div className="quote-meta">
                <span
                  className="char-link"
                  onClick={(e) => { e.stopPropagation(); if (q.character_id) router.push(`/characters/${q.character_id}`) }}
                >
                  {q.characters?.name || q.character_name}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
