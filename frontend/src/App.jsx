import { useEffect, useState } from 'react'
import {
  Ghost, Sparkles, Copy, Download, RefreshCw, ShieldCheck,
  CircleAlert, BookOpen, WandSparkles
} from 'lucide-react'
import './App.css'

const API = import.meta.env.DEV ? 'http://127.0.0.1:5000/api' : '/.netlify/functions'

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [genre, setGenre] = useState('Supernatural')
  const [length, setLength] = useState('Short')
  const [story, setStory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('ghostwriter-theme') === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('ghostwriter-theme', theme)
    } catch {
      // Theme still works for this session if storage is unavailable.
    }
  }, [theme])

  async function generate(continueStory = false) {
    if (!prompt.trim()) {
      setError('Give your nightmare a starting point first.')
      return
    }
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`${API}/story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(), genre, length,
          previous_story: continueStory ? story : '',
        }),
      })
      let data
      try {
        data = await response.json()
      } catch {
        throw new Error('The server returned an unreadable response. Please try again.')
      }
      if (!response.ok) throw new Error(data.error || `Story generation failed (HTTP ${response.status}).`)
      if (typeof data.story !== 'string' || !data.story.trim()) {
        throw new Error('The AI returned an empty story. Please try again.')
      }
      setStory(continueStory && story ? `${story}\n\n${data.story}` : data.story)
    } catch (err) {
      setError(err.message || 'Could not reach the AI service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function copyStory() {
    try {
      await navigator.clipboard.writeText(story)
      setNotice('Story copied to clipboard.')
    } catch {
      setError('Clipboard access failed. Select and copy the story manually.')
    }
  }

  function downloadStory() {
    const blobUrl = URL.createObjectURL(new Blob([story], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = 'ghostwriter-story.txt'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
    setNotice('Story download started.')
  }

  return (
    <main className={`app-shell theme-${theme}`}>
      <header className="topbar">
        <div className="topbar-left">
          <button
            className={`pumpkin-toggle ${theme === 'light' ? 'is-glowing' : ''}`}
            type="button"
            onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={theme === 'light'}
            title={theme === 'light' ? 'Pumpkin glow: Light mode' : 'Pumpkin asleep: Dark mode'}
          >
            🎃
          </button>
          <a className="brand" href="#" aria-label="GhostWriter AI home">
          <span className="brand-mark"><Ghost size={22} /></span>
            <span>GHOSTWRITER<span className="accent">.AI</span></span>
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow"><span /> YOUR IMAGINATION. YOUR NIGHTMARE.</div>
        <h1>Stories from the<br /><em>other side.</em></h1>
        <p className="subtitle">
          One idea. A thousand dark possibilities. Let Gemini
          bring your next nightmare to life.
        </p>
        <div className="hero-note"><ShieldCheck size={15} /> Generated securely through our hosted AI backend.</div>
      </section>

      <section className="workspace">
        <div className="panel manuscript">
          <div className="manuscript-header">
            <div className="section-title"><BookOpen size={16} /><span>THE MANUSCRIPT</span></div>
            {story && <div className="story-actions">
              <button title="Copy story" aria-label="Copy story" onClick={copyStory}><Copy size={16} /></button>
              <button title="Download story" aria-label="Download story" onClick={downloadStory}><Download size={16} /></button>
            </div>}
          </div>
          {loading && !story ? (
            <div className="empty-state">
              <div className="loading-orb"><Ghost size={32} /></div>
              <h2>Something is stirring.</h2>
              <p>Gemini is writing your story. The first request may take a moment.</p>
            </div>
          ) : story ? (
            <div className="story-output">
              <article className="story-text" aria-live="polite">{story}</article>
              <button className="continue-button" onClick={() => generate(true)} disabled={loading}>
                {loading ? <RefreshCw size={15} className="spin" /> : <Sparkles size={15} />}
                {loading ? 'CONTINUING…' : 'CONTINUE THE STORY'}
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <div className="ghost-art"><Ghost size={46} strokeWidth={1.1} /></div>
              <h2>The page is waiting.</h2>
              <p>Every nightmare begins with a single thought.</p>
              <span className="empty-rule" />
              <span className="empty-caption">YOUR STORY WILL APPEAR HERE</span>
            </div>
          )}
        </div>

        <div className="panel controls">
          <div className="section-title"><WandSparkles size={16} /><span>CREATE YOUR NIGHTMARE</span></div>
          <label htmlFor="prompt">STORY SEED <span className="optional">({prompt.length}/1000)</span></label>
          <textarea
            id="prompt" value={prompt} maxLength={1000}
            onChange={event => setPrompt(event.target.value)}
            placeholder="A student receives a message from a computer that has been unplugged for years..."
          />
          <div className="field-row">
            <div className="field">
              <label htmlFor="genre">HORROR STYLE</label>
              <select id="genre" value={genre} onChange={event => setGenre(event.target.value)}>
                {['Supernatural', 'Psychological', 'Cosmic', 'Gothic', 'Tech Horror'].map(item =>
                  <option key={item} value={item}>{item}</option>
                )}
              </select>
            </div>
            <div className="field">
              <label htmlFor="length">STORY LENGTH</label>
              <select id="length" value={length} onChange={event => setLength(event.target.value)}>
                {['Short', 'Medium', 'Long'].map(item =>
                  <option key={item} value={item}>{item}</option>
                )}
              </select>
            </div>
          </div>
          <button className="generate-button" onClick={() => generate()} disabled={loading}>
            {loading ? <RefreshCw size={17} className="spin" /> : <Sparkles size={17} />}
            {loading ? 'WRITING YOUR NIGHTMARE…' : 'GENERATE STORY'}
          </button>
          <div className="engine-note"><span className="engine-icon"><CircleAlert size={14} /></span>
            Powered by hosted AI. Provider limits may apply.
          </div>
          {error && <p className="feedback error" role="alert">{error}</p>}
          {notice && <p className="feedback success" role="status">{notice}</p>}
        </div>
      </section>

      <footer>
        <span>GHOSTWRITER.AI</span>
        <span className="footer-center">MADE IN THE DARK <span>✳</span></span>
      </footer>
    </main>
  )
}
