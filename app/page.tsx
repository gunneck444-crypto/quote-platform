'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function Home() {
  const [content, setContent] = useState('')
  const [work, setWork] = useState('')
  const [character, setCharacter] = useState('')
  const [category, setCategory] = useState('未分類')
  const [filterCategory, setFilterCategory] = useState('すべて')
  const [quotes, setQuotes] = useState<any[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [recommended, setRecommended] = useState<any[]>([])
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({})
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const fetchQuotes = async (filter = 'すべて') => {
    let query = supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
    if (filter !== 'すべて') {
      query = query.eq('category', filter)
    }
    const { data } = await query
    if (data) setQuotes(data)
  }

  useEffect(() => {
    fetchQuotes(filterCategory)
  }, [filterCategory])

  useEffect(() => {
    if (quotes.length === 0) return
    const fetchCounts = async () => {
      const { data } = await supabase
        .from('comments')
        .select('quote_id')
        .in('quote_id', quotes.map((q) => q.id))
      if (data) {
        const counts: Record<number, number> = {}
        data.forEach((c) => { counts[Number(c.quote_id)] = (counts[Number(c.quote_id)] || 0) + 1 })
        setCommentCounts(counts)
      }
    }
    fetchCounts()
  }, [quotes])

  const fetchBookmarks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('bookmarks')
      .select('quote_id')
      .eq('user_id', user.id)
if (data) setBookmarks(data.map((b) => Number(b.quote_id)))
  }

  const toggleBookmark = async (quoteId: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }
    if (bookmarks.includes(quoteId)) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('quote_id', quoteId)
      setBookmarks((prev) => prev.filter((id) => id !== quoteId))
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, quote_id: quoteId })
      setBookmarks((prev) => [...prev, quoteId])
    }
  }

  useEffect(() => {
    if (user) {
      fetchBookmarks()
    } else {
      setBookmarks([])
    }
  }, [user])

  const fetchRecommended = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (!prefs) return
    const { data } = await supabase
      .from('quotes')
      .select('*')
      .in('category', prefs.favorite_categories)
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setRecommended(data)
  }

  useEffect(() => {
    if (user) fetchRecommended()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase
      .from('quotes')
      .insert([{ content, work_title: work, character_name: character, category }])
    if (error) {
      alert('【封印失敗】' + error.message)
    } else {
      setContent(''); setWork(''); setCharacter('')
      fetchQuotes()
    }
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
          overflow-x: hidden;
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
          font-size: clamp(20px, 4vw, 32px);
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
        .header-divider span {
          color: #7a4fa0;
          font-size: 18px;
        }

        .form-card {
          background: linear-gradient(135deg, rgba(20, 10, 35, 0.9), rgba(10, 5, 20, 0.95));
          border: 1px solid rgba(120, 60, 180, 0.3);
          border-radius: 2px;
          padding: 32px;
          margin-bottom: 48px;
          box-shadow:
            0 0 40px rgba(100, 0, 160, 0.1),
            inset 0 1px 0 rgba(160, 80, 255, 0.1);
          position: relative;
        }

        .form-card::before {
          content: '✦';
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: #0a0a0f;
          padding: 0 12px;
          color: #7a3fa0;
          font-size: 14px;
        }

        .form-label {
          display: block;
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #7a4fa0;
          margin-bottom: 8px;
        }

        .form-input, .form-textarea {
          width: 100%;
          background: rgba(10, 5, 25, 0.8);
          border: 1px solid rgba(100, 50, 150, 0.4);
          border-radius: 1px;
          color: #d4c0f0;
          padding: 12px 16px;
          font-family: 'Noto Serif JP', serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .form-input:focus, .form-textarea:focus {
          border-color: rgba(160, 80, 255, 0.6);
          box-shadow: 0 0 15px rgba(120, 40, 200, 0.2);
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 16px;
        }

        .form-group {
          margin-bottom: 0;
        }

        .submit-btn {
          width: 100%;
          margin-top: 24px;
          padding: 14px;
          background: linear-gradient(135deg, #3a0060, #6a0090);
          border: 1px solid rgba(180, 100, 255, 0.4);
          color: #e8d5ff;
          font-family: 'Noto Serif JP', serif;
          font-size: 13px;
          letter-spacing: 4px;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
        }

        .submit-btn:hover {
          box-shadow: 0 0 30px rgba(160, 0, 255, 0.3);
          border-color: rgba(200, 120, 255, 0.6);
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
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          letter-spacing: 2px;
          color: #7a5aa0;
        }

        .quote-meta::before {
          content: '— ';
        }

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
          <h1 className="header-title">魂の言霊<br/>封印書庫</h1>
          <div className="header-divider"><span>✦</span></div>
          <div style={{ marginTop: '16px', fontSize: '12px', letterSpacing: '2px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <span style={{ color: '#7a4fa0' }}>{user.email}</span>
                <button
                  onClick={() => router.push('/bookmarks')}
                  style={{ background: 'none', border: '1px solid rgba(120,60,180,0.4)', color: '#a070d0', padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px', letterSpacing: '2px' }}
                >
                  栞一覧
                </button>
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: '1px solid rgba(120,60,180,0.4)', color: '#a070d0', padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px', letterSpacing: '2px' }}
                >
                  離脱する
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth')}
                style={{ background: 'none', border: '1px solid rgba(120,60,180,0.4)', color: '#a070d0', padding: '6px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px', letterSpacing: '3px' }}
              >
                ✦ 契約者としてログイン ✦
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-card">
          <div>
            <label className="form-label">言霊を刻め</label>
            <textarea
              className="form-textarea"
              placeholder="ここに言葉を封印せよ..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: '16px' }}>
            <label className="form-label">カテゴリ</label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="未分類">未分類</option>
              <option value="漫画・アニメ">漫画・アニメ</option>
              <option value="哲学・思想">哲学・思想</option>
              <option value="ビジネス・起業家">ビジネス・起業家</option>
              <option value="科学者">科学者</option>
              <option value="芸能・スポーツ">芸能・スポーツ</option>
              <option value="政治・歴史">政治・歴史</option>
              <option value="その他">その他</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">作品名</label>
              <input
                className="form-input"
                placeholder="禁書の名"
                value={work}
                onChange={(e) => setWork(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">使用者</label>
              <input
                className="form-input"
                placeholder="言霊の主"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="submit-btn">
            ✦ 封印を施す ✦
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
          {['すべて', '漫画・アニメ', '哲学・思想', 'ビジネス・起業家', '科学者', '芸能・スポーツ', '政治・歴史', '未分類', 'その他'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={{
                background: filterCategory === cat ? 'linear-gradient(135deg, #3a0060, #6a0090)' : 'none',
                border: '1px solid rgba(120,60,180,0.4)',
                color: filterCategory === cat ? '#e8d5ff' : '#7a4fa0',
                padding: '6px 14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '11px',
                letterSpacing: '2px',
                transition: 'all 0.3s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {user && recommended.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <div className="list-header">
              <span className="list-title">あなたへの言霊</span>
              <div className="list-line" />
            </div>
            {recommended.map((q) => (
              <div
                key={q.id}
                className="quote-card"
                style={{ borderLeftColor: 'rgba(220, 100, 100, 0.6)', cursor: 'pointer' }}
                onClick={() => router.push(`/quotes/${q.id}`)}
              >
                <div className="quote-symbol">❝</div>
                <p className="quote-content">{q.content}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="quote-meta">
                    {q.character_name}　／　{q.work_title}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(Number(q.id)) }}
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
            ))}
          </div>
        )}

        <div className="list-header">
          <span className="list-title">封印された言霊</span>
          <div className="list-line" />
        </div>

        {quotes.length === 0 ? (
          <div className="empty-state">— まだ言霊は封印されていない —</div>
        ) : (
          quotes.map((q) => (
            <div
              key={q.id}
              className="quote-card"
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/quotes/${q.id}`)}
            >
              <div className="quote-symbol">❝</div>
              <p className="quote-content">{q.content}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="quote-meta">
                    {q.character_name}　／　{q.work_title}
                  </div>
                  {commentCounts[Number(q.id)] > 0 && (
                    <span style={{ fontSize: '11px', letterSpacing: '1px', color: '#7a4fa0' }}>
                      💬 {commentCounts[Number(q.id)]}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleBookmark(Number(q.id)) }}
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