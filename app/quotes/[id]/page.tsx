'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function QuoteDetailPage() {
  const [quote, setQuote] = useState<any>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
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
      setCurrentUser(user)
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
    fetchComments()
  }, [id])

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('quote_id', id)
      .order('created_at', { ascending: true })
    if (data) setComments(data)
  }

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

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }
    if (!commentText.trim()) return
    await supabase.from('comments').insert({ user_id: user.id, quote_id: id, content: commentText.trim() })
    setCommentText('')
    fetchComments()
  }

  const deleteComment = async (commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
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
        .section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 48px 0 24px;
        }
        .section-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 13px;
          letter-spacing: 3px;
          color: #a070d0;
          white-space: nowrap;
        }
        .section-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(100, 40, 160, 0.6), transparent);
        }
        .comment-item {
          background: rgba(15, 5, 25, 0.8);
          border: 1px solid rgba(80, 30, 130, 0.3);
          padding: 16px 20px;
          margin-bottom: 12px;
          position: relative;
        }
        .comment-content {
          font-size: 14px;
          line-height: 1.8;
          color: #c0a8e0;
        }
        .comment-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }
        .comment-date {
          font-size: 10px;
          letter-spacing: 2px;
          color: #4a2a6a;
        }
        .delete-btn {
          background: none;
          border: none;
          color: #5a2a5a;
          cursor: pointer;
          font-size: 11px;
          letter-spacing: 2px;
          font-family: inherit;
        }
        .delete-btn:hover { color: #c06080; }
        .comment-form {
          margin-top: 8px;
        }
        .comment-input {
          width: 100%;
          background: rgba(10, 5, 25, 0.8);
          border: 1px solid rgba(100, 50, 150, 0.4);
          color: #d4c0f0;
          padding: 12px 16px;
          font-family: 'Noto Serif JP', serif;
          font-size: 14px;
          outline: none;
          resize: vertical;
          min-height: 80px;
        }
        .comment-input:focus {
          border-color: rgba(160, 80, 255, 0.6);
        }
        .submit-btn {
          margin-top: 12px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #3a0060, #6a0090);
          border: 1px solid rgba(180, 100, 255, 0.4);
          color: #e8d5ff;
          font-family: inherit;
          font-size: 12px;
          letter-spacing: 3px;
          cursor: pointer;
        }
        .login-prompt {
          font-size: 12px;
          letter-spacing: 2px;
          color: #4a2a6a;
          padding: 16px 0;
        }
        .empty-state {
          font-size: 12px;
          letter-spacing: 3px;
          color: #4a2a6a;
          padding: 24px 0;
          text-align: center;
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

        <div className="section-header">
          <span className="section-title">解釈・コメント</span>
          <div className="section-line" />
        </div>

        {comments.length === 0 ? (
          <div className="empty-state">— まだコメントはない —</div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment-item">
              <p className="comment-content">{c.content}</p>
              <div className="comment-footer">
                <span className="comment-date">
                  {new Date(c.created_at).toLocaleDateString('ja-JP')}
                </span>
                {currentUser?.id === c.user_id && (
                  <button className="delete-btn" onClick={() => deleteComment(c.id)}>
                    削除
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        <div className="comment-form">
          {currentUser ? (
            <form onSubmit={submitComment}>
              <textarea
                className="comment-input"
                placeholder="この言葉への解釈や感想を残す..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button type="submit" className="submit-btn">
                ✦ 刻む ✦
              </button>
            </form>
          ) : (
            <p className="login-prompt">
              コメントするには{' '}
              <span
                onClick={() => router.push('/auth')}
                style={{ color: '#a070d0', cursor: 'pointer', letterSpacing: '2px' }}
              >
                ログイン
              </span>
              {' '}が必要です
            </p>
          )}
        </div>
      </div>
    </>
  )
}
