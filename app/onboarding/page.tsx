'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const MOODS = ['背中を押してほしい', '静かに沁みる言葉', '笑いたい', '深く考えたい', '燃えたい']
const CATEGORIES = ['漫画・アニメ', '哲学・思想', 'ビジネス・起業家', '科学者', '芸能・スポーツ', '政治・歴史', 'その他']

export default function OnboardingPage() {
  const [mood, setMood] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (data) router.push('/')
    }
    check()
  }, [router])

  const toggleCategory = (cat: string) => {
    setFavorites((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const handleSubmit = async () => {
    if (!mood || favorites.length === 0) {
      alert('気分とジャンルを選択してください')
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('user_preferences').upsert({
      user_id: user.id,
      mood,
      favorite_categories: favorites,
    })
    router.push('/')
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
            radial-gradient(ellipse at 20% 50%, rgba(80,0,120,0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(120,0,60,0.12) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }
        .container {
          position: relative;
          z-index: 1;
          max-width: 560px;
          margin: 0 auto;
          padding: 64px 24px;
        }
        .header {
          text-align: center;
          margin-bottom: 48px;
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
          font-size: 22px;
          color: #e8d5ff;
          text-shadow: 0 0 20px rgba(160,80,255,0.6);
          margin-bottom: 12px;
        }
        .header-sub {
          font-size: 13px;
          color: #7a5aa0;
          letter-spacing: 2px;
        }
        .section {
          margin-bottom: 40px;
        }
        .section-label {
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #7a4fa0;
          margin-bottom: 16px;
        }
        .options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .option-btn {
          background: none;
          border: 1px solid rgba(120,60,180,0.4);
          color: #7a4fa0;
          padding: 10px 18px;
          cursor: pointer;
          fontFamily: inherit;
          font-size: 13px;
          letter-spacing: 1px;
          transition: all 0.3s;
          font-family: 'Noto Serif JP', serif;
        }
        .option-btn.selected {
          background: linear-gradient(135deg, #3a0060, #6a0090);
          border-color: rgba(180,100,255,0.4);
          color: #e8d5ff;
          box-shadow: 0 0 15px rgba(120,0,200,0.2);
        }
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #3a0060, #6a0090);
          border: 1px solid rgba(180,100,255,0.4);
          color: #e8d5ff;
          font-family: 'Noto Serif JP', serif;
          font-size: 13px;
          letter-spacing: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .submit-btn:hover {
          box-shadow: 0 0 30px rgba(160,0,255,0.3);
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="bg-layer" />
      <div className="container">
        <div className="header">
          <div className="header-eyebrow">First Covenant</div>
          <h1 className="header-title">最初の契約</h1>
          <p className="header-sub">汝の魂の声を聞かせよ</p>
        </div>

        <div className="section">
          <div className="section-label">今の気分</div>
          <div className="options">
            {MOODS.map((m) => (
              <button
                key={m}
                className={`option-btn ${mood === m ? 'selected' : ''}`}
                onClick={() => setMood(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-label">好きなジャンル（複数選択可）</div>
          <div className="options">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`option-btn ${favorites.includes(cat) ? 'selected' : ''}`}
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          ✦ 契約を完遂する ✦
        </button>
      </div>
    </>
  )
}