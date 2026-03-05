'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function BookmarksPage() {
  const [user, setUser] = useState<User | null>(null)
  const [bookmarkedQuotes, setBookmarkedQuotes] = useState<any[]>([])
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth')
        return
      }
      setUser(data.user)
    })
  }, [router])

  useEffect(() => {
    if (!user) return
    const fetchBookmarks = async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('quote_id, quotes(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data) {
        setBookmarkedQuotes(data.map((b: any) => b.quotes).filter(Boolean))
        setBookmarks(data.map((b: any) => Number(b.quote_id)))
      }
    }
    fetchBookmarks()
  }, [user])

  const toggleBookmark = async (quoteId: number) => {
    if (!user) return
    await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('quote_id', quoteId)
    setBookmarks((prev) => prev.filter((id) => id !== quoteId))
    setBookmarkedQuotes((prev) => prev.filter((q) => Number(q.id) !== quoteId))
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Noto+Serif+JP:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #0a0a0f;
          color: #c9b8e8;
          font-family: 'Noto Serif JP', serif;
          min-height: 100vh;
        }
        .bg-layer {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 50%, rgba(80, 0, 120, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(120, 0, 60, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 90%, rgba(0, 40, 100, 0.15) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
        .container {
          position: relative;
          z-index: 1;
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 24px;
        }
        .header {
          text-align: center;
          margin-bottom: 56px;
        }
        .header-eyebrow {
          font-size: 11px;
          letter-spacing: 6px;
          text-transform: uppercase;
          color: #7a4fa0;
          margin-bottom: 16px;
        }
        .header-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: clamp(20px, 4vw, 28px);
          color: #e8d5ff;
          text-shadow:
            0 0 20px rgba(160, 80, 255, 0.6),
            0 0 60px rgba(160, 80, 255, 0.2);
          line-height: 1.4;
          margin-bottom: 12px;
        }
        .header-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 20px;
        }
        .header-divider::before,
        .header-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #5a2080, transparent);
        }
        .header-divider span { color: #7a4fa0; font-size: 18px; }
        .back-btn {
          display: inline-block;
          margin-bottom: 32px;
          background: none;
          border: 1px solid rgba(120,60,180,0.4);
          color: #a070d0;
          padding: 6px 16px;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 2px;
        }
        .list-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }
        .list-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 14px;
          letter-spacing: 3px;
          color: #a070d0;
          white-space: nowrap;
        }
        .list-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(100, 40, 160, 0.6), transparent);
        }
        .quote-card {
          background: linear-gradient(160deg, rgba(18, 8, 30, 0.95), rgba(8, 4, 18, 0.98));
          border: 1px solid rgba(80, 30, 130, 0.4);
          border-left: 2px solid rgba(140, 60, 220, 0.6);
          padding: 28px 32px;
          margin-bottom: 20px;
          position: relative;
          transition: all 0.3s;
        }
        .quote-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, rgba(160, 80, 255, 0.4), transparent);
        }
        .quote-card:hover {
          border-left-color: rgba(200, 100, 255, 0.8);
          box-shadow: 0 0 25px rgba(100, 0, 180, 0.15);
          transform: translateX(3px);
        }
        .quote-symbol {
          font-size: 28px;
          color: rgba(120, 50, 200, 0.4);
          font-family: serif;
          line-height: 1;
          margin-bottom: 10px;
        }
        .quote-content {
          font-size: 17px;
          line-height: 1.9;
          color: #ddd0f5;
          font-style: italic;
          margin-bottom: 16px;
          text-shadow: 0 0 20px rgba(160, 80, 255, 0.15);
        }
        .quote-meta {
          font-size: 11px;
          letter-spacing: 2px;
          color: #7a5aa0;
        }
        .quote-meta::before { content: '— '; }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #4a2a6a;
          font-size: 13px;
          letter-spacing: 3px;
        }
      `}</style>

      <div className="bg-layer" />
      <div className="container">
        <div className="header">
          <div className="header-eyebrow">Grimoire of Eternal Words</div>
          <h1 className="header-title">封印された栞</h1>
          <div className="header-divider"><span>✦</span></div>
        </div>

        <button className="back-btn" onClick={() => router.push('/')}>
          ← 書庫に戻る
        </button>

        <div className="list-header">
          <span className="list-title">あなたの栞</span>
          <div className="list-line" />
        </div>

        {bookmarkedQuotes.length === 0 ? (
          <div className="empty-state">— まだ栞は挟まれていない —</div>
        ) : (
          bookmarkedQuotes.map((q) => (
            <div key={q.id} className="quote-card">
              <div className="quote-symbol">❝</div>
              <p className="quote-content">{q.content}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="quote-meta">
                  {q.character_name}　／　{q.work_title}
                </div>
                <button
                  onClick={() => toggleBookmark(Number(q.id))}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    opacity: bookmarks.includes(Number(q.id)) ? 1 : 0.2,
                    transition: 'opacity 0.3s',
                  }}
                >
                  🔖
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
