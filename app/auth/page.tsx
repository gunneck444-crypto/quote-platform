'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage('【封印解除失敗】' + error.message)
      } else {
        router.push('/')
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage('【契約失敗】' + error.message)
      } else {
        setMessage('確認メールを送信しました。メールを確認してください。')
      }
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
          max-width: 420px;
          margin: 0 auto;
          padding: 80px 24px;
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
        }
        .form-card {
          background: linear-gradient(135deg, rgba(20,10,35,0.9), rgba(10,5,20,0.95));
          border: 1px solid rgba(120,60,180,0.3);
          padding: 32px;
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
        }
        .form-label {
          display: block;
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #7a4fa0;
          margin-bottom: 8px;
        }
        .form-input {
          width: 100%;
          background: rgba(10,5,25,0.8);
          border: 1px solid rgba(100,50,150,0.4);
          color: #d4c0f0;
          padding: 12px 16px;
          font-family: 'Noto Serif JP', serif;
          font-size: 14px;
          outline: none;
          margin-bottom: 20px;
          transition: border-color 0.3s;
        }
        .form-input:focus {
          border-color: rgba(160,80,255,0.6);
          box-shadow: 0 0 15px rgba(120,40,200,0.2);
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
        .toggle-btn {
          width: 100%;
          margin-top: 16px;
          background: none;
          border: none;
          color: #7a4fa0;
          font-family: 'Noto Serif JP', serif;
          font-size: 12px;
          letter-spacing: 2px;
          cursor: pointer;
          text-decoration: underline;
        }
        .message {
          margin-top: 16px;
          font-size: 12px;
          color: #a080c0;
          text-align: center;
          letter-spacing: 1px;
        }
      `}</style>

      <div className="bg-layer" />
      <div className="container">
        <div className="header">
          <div className="header-eyebrow">Gate of Covenant</div>
          <h1 className="header-title">{isLogin ? '契約者の刻印' : '新たな契約'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="form-card">
          <div>
            <label className="form-label">召喚符（メールアドレス）</label>
            <input
              className="form-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="form-label">封印の鍵（パスワード）</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            ✦ {isLogin ? '封印を解く' : '契約を結ぶ'} ✦
          </button>
          <button type="button" className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? '新たに契約を結ぶ →' : '既に契約済みの者はこちら →'}
          </button>
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </>
  )
}