'use client'
import { useState, useEffect } from 'react'
// エラーを確実に回避するため、直接パスを指定しました
import { supabase } from '../lib/supabase'

export default function Home() {
  const [content, setContent] = useState('')
  const [work, setWork] = useState('')
  const [character, setCharacter] = useState('')
  const [quotes, setQuotes] = useState<any[]>([])

  const fetchQuotes = async () => {
    const { data } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setQuotes(data)
  }

  useEffect(() => {
    fetchQuotes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase
      .from('quotes')
      .insert([{ content, work_title: work, character_name: character }])

    if (error) {
      alert('エラーが発生しました: ' + error.message)
    } else {
      setContent(''); setWork(''); setCharacter('')
      fetchQuotes()
    }
  }

  return (
    <main className="p-8 text-black min-h-screen bg-white font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">セリフ・名言プラットフォーム</h1>
        
        <form onSubmit={handleSubmit} className="mb-12 space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <textarea 
            className="border border-gray-300 p-3 w-full rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="セリフ本文を入力" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <input className="border border-gray-300 p-3 w-full rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="作品名" value={work} onChange={(e) => setWork(e.target.value)} required />
            <input className="border border-gray-300 p-3 w-full rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="キャラクター名" value={character} onChange={(e) => setCharacter(e.target.value)} required />
          </div>
          <button className="bg-blue-600 text-white p-3 w-full rounded-md font-bold hover:bg-blue-700 shadow-md">投稿する</button>
        </form>

        <div className="space-y-6">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2">投稿一覧</h2>
          {quotes.map((q) => (
            <div key={q.id} className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white italic">
              <p className="text-xl mb-4 text-black">「{q.content}」</p>
              <p className="text-right text-gray-600 not-italic font-medium text-black">― {q.character_name} ({q.work_title})</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}