'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function QuoteDetailPage() {
  const [quote, setQuote] = useState<any>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', id)
        .single()
      if (data) setQuote(data)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('view_history').insert({ user_id: user.id, quote_id: id })

      const { data: bm } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('quote_id', id)
        .single()
      setBookmarked(!!bm)
    }
    init()
  }, [id])

  const toggleBookmark = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }
    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('quote_id', id)
      setBookmarked(false)
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, quote_id: id })
      setBookmarked(true)
    }
  }

  if (!quote) return null

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
        .back-btn {
          background: none;
          border: 1px solid rgba(120,60,180,0.4);
          color: #a070d0;
          padding: 6px 16px;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 2px;
          margin-bottom: 48px;
          display: inline-block;
        }
        .detail-card {
          background: linear-gradient(160deg, rgba(18, 8, 30, 0.95), rgba(8, 4, 18, 0.98));
          border: 1px solid rgba(80, 30, 130, 0.4);
          border-left: 2px solid rgba(140, 60, 220, 0.6);
          padding: 40px 48px;
          position: relative;
        }
        .detail-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, rgba(160, 80, 255, 0.4), transparent);
        }
        .quote-symbol {
          font-size: 40px;
          color: rgba(120, 50, 200, 0.4);
          font-family: serif;
          line-height: 1;
          margin-bottom: 16px;
        }
        .quote-content {
          font-size: 20px;
          line-height: 2;
          color: #ddd0f5;
          font-style: italic;
          margin-bottom: 32px;
          text-shadow: 0 0 20px rgba(160, 80, 255, 0.15);
        }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(100, 40, 160, 0.4), transparent);
          margin-bottom: 24px;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .meta-info { display: flex; flex-direction: column; gap: 8px; }
        .meta-label {
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #5a3a7a;
        }
        .meta-value {
          font-size: 14px;
          letter-spacing: 2px;
          color: #b090d0;
        }
        .category-badge {
          display: inline-block;
          margin-top: 16px;
          padding: 4px 12px;
          border: 1px solid rgba(120,60,180,0.4);
          font-size: 11px;
          letter-spacing: 2px;
          color: #7a4fa0;
        }
      `}</style>

      <div className="bg-layer" />
      <div className="container">
        <button className="back-btn" onClick={() => router.back()}>
          ← 戻る
        </button>

        <div className="detail-card">
          <div className="quote-symbol">❝</div>
          <p className="quote-content">{quote.content}</p>
          <div className="divider" />
          <div className="meta-row">
            <div className="meta-info">
              <div>
                <div className="meta-label">使用者</div>
                <div className="meta-value">{quote.character_name}</div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <div className="meta-label">作品</div>
                <div className="meta-value">{quote.work_title}</div>
              </div>
              <div className="category-badge">{quote.category}</div>
            </div>
            <button
              onClick={toggleBookmark}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '28px',
                opacity: bookmarked ? 1 : 0.2,
                transition: 'opacity 0.3s',
                alignSelf: 'flex-start',
              }}
            >
              🔖
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
