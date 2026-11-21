import { useEffect, useState } from 'react'
import {
  Ghost, Sparkles, Copy, Download, RefreshCw, ShieldCheck,
  CircleAlert, BookOpen, WandSparkles, Bookmark, Library, Trash2
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
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [savedStories, setSavedStories] = useState(() => { try { const v = JSON.parse(localStorage.getItem('ghostwriter-library') || '[]'); return Array.isArray(v) ? v : [] } catch { return [] } })
  const [language, setLanguage] = useState(() => {
    try { return localStorage.getItem('ghostwriter-language') === 'hi' ? 'hi' : 'en' } catch { return 'en' }
  })
  const labels = language === 'hi' ? {
    tagline: 'आपकी कल्पना। आपका डरावना सपना।', manuscript: 'आपकी कहानी', create: 'अपना डरावना सपना बनाएँ',
    seed: 'कहानी का विचार', placeholder: 'एक छात्र को ऐसे कंप्यूटर से संदेश मिलता है जो सालों से बंद पड़ा है...',
    genre: 'डर की शैली', length: 'कहानी की लंबाई', generate: 'कहानी बनाएँ', generating: 'कहानी लिखी जा रही है…',
    continuing: 'आगे लिखा जा रहा है…', continue: 'कहानी आगे बढ़ाएँ', empty: 'पहले अपनी कहानी का विचार लिखें।',
    copied: 'कहानी कॉपी हो गई।', downloaded: 'कहानी डाउनलोड शुरू हो गई।',
    options: ['अलौकिक', 'मनोवैज्ञानिक', 'कॉस्मिक', 'गॉथिक', 'टेक हॉरर'], lengths: ['छोटी', 'मध्यम', 'लंबी']
  } : {
    tagline: '{labels.tagline}', manuscript: 'THE MANUSCRIPT', create: 'CREATE YOUR NIGHTMARE',
    seed: 'STORY SEED', placeholder: 'A student receives a message from a computer that has been unplugged for years...',
    genre: 'HORROR STYLE', length: 'STORY LENGTH', generate: 'GENERATE STORY', generating: 'WRITING YOUR NIGHTMARE…',
    continuing: 'CONTINUING…', continue: 'CONTINUE THE STORY', empty: 'Give your nightmare a starting point first.',
    copied: 'Story copied to clipboard.', downloaded: 'Story download started.',
    options: ['Supernatural', 'Psychological', 'Cosmic', 'Gothic', 'Tech Horror'], lengths: ['Short', 'Medium', 'Long']
  }
  useEffect(() => {
    document.documentElement.lang = language
    try { localStorage.setItem('ghostwriter-language', language) } catch {}
  }, [language])
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

  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const footerTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(currentTime)

  const footerDate = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(currentTime)

  async function generate(continueStory = false) {
    if (!prompt.trim()) {
      setError(labels.empty)
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
          prompt: prompt.trim(), genre, length, language,
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

  function saveStory() {
    if (!story.trim()) return
    const entry = { id: Date.now(), title: story.split(/\n/)[0].replace(/^#+\s*/, '').slice(0, 80) || prompt.slice(0, 80) || 'Untitled story', story, prompt, genre, length, language, savedAt: new Date().toISOString() }
    setSavedStories(current => [entry, ...current])
    setNotice(language === 'hi' ? 'कहानी आपकी लाइब्रेरी में सेव हो गई।' : 'Story saved to your library.')
  }
  function loadStory(entry) { setStory(entry.story); setPrompt(entry.prompt || ''); setGenre(entry.genre || 'Supernatural'); setLength(entry.length || 'Short'); setLanguage(entry.language || 'en'); setLibraryOpen(false); setError(''); setNotice(language === 'hi' ? 'सेव की गई कहानी खोली गई।' : 'Saved story opened.') }
  function deleteStory(id) { setSavedStories(current => current.filter(entry => entry.id !== id)) }

  async function copyStory() {
    try {
      await navigator.clipboard.writeText(story)
      setNotice(labels.copied)
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
    setNotice(labels.downloaded)
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
            <span className="pumpkin-image" aria-hidden="true" />
          </button>
          <a className="brand" href="#" aria-label="GhostWriter AI home">
          <span className="brand-mark"><Ghost size={22} /></span>
            <span>GHOSTWRITER<span className="accent">.AI</span></span>
          </a>
        </div>
<button className="library-toggle" type="button" onClick={() => setLibraryOpen(v => !v)}><Library size={15} /> {language === 'hi' ? 'लाइब्रेरी' : 'Library'} <span>{savedStories.length}</span></button>
        <div className="language-switch" role="group" aria-label="Choose language"><button type="button" className={language === 'en' ? 'active' : ''} aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button><button type="button" className={language === 'hi' ? 'active' : ''} aria-pressed={language === 'hi'} onClick={() => setLanguage('hi')}>हिन्दी</button></div>
      </header>
      {libraryOpen && <section className="library-panel panel">
        <div className="library-heading"><div className="section-title"><Library size={16}/><span>{language === 'hi' ? 'आपकी कहानी लाइब्रेरी' : 'YOUR STORY LIBRARY'}</span></div><button className="library-close" onClick={() => setLibraryOpen(false)}>{language === 'hi' ? 'बंद करें' : 'Close'}</button></div>
        {savedStories.length === 0 ? <div className="library-empty">{language === 'hi' ? 'अभी कोई कहानी सेव नहीं है। कहानी लिखें और Save Story दबाएँ।' : 'No saved stories yet. Generate a story and click Save Story.'}</div> : <div className="library-list">{savedStories.map(entry => <article className="library-item" key={entry.id}><div className="library-item-main"><button className="library-story-title" onClick={() => loadStory(entry)}>{entry.title || (language === 'hi' ? 'शीर्षक रहित कहानी' : 'Untitled story')}</button><div className="library-meta">{entry.genre} · {entry.length} · {entry.language === 'hi' ? 'हिन्दी' : 'EN'} · {new Date(entry.savedAt).toLocaleDateString()}</div><p>{entry.prompt}</p></div><div className="library-item-actions"><button onClick={() => loadStory(entry)} title={language === 'hi' ? 'खोलें' : 'Open'}><BookOpen size={15}/></button><button className="delete-story" onClick={() => deleteStory(entry.id)} title={language === 'hi' ? 'हटाएँ' : 'Delete'}><Trash2 size={15}/></button></div></article>)}</div>}
      </section>}

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
            <div className="section-title"><BookOpen size={16} /><span>{labels.manuscript}</span></div>
            {story && <div className="story-actions"><button title="Save story" aria-label="Save story" onClick={saveStory}><Bookmark size={16}/></button>
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
                {loading ? labels.continuing : labels.continue}
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
          <div className="section-title"><WandSparkles size={16} /><span>{labels.create}</span></div>
          <label htmlFor="prompt">{labels.seed} <span className="optional">({prompt.length}/1000)</span></label>
          <textarea
            id="prompt" value={prompt} maxLength={1000}
            onChange={event => setPrompt(event.target.value)}
            placeholder={labels.placeholder}
          />
          <div className="field-row">
            <div className="field">
              <label htmlFor="genre">{labels.genre}</label>
              <select id="genre" value={genre} onChange={event => setGenre(event.target.value)}>
                {['Supernatural', 'Psychological', 'Cosmic', 'Gothic', 'Tech Horror'].map(item =>
                  <option key={item} value={item}>{labels.options[['Supernatural','Psychological','Cosmic','Gothic','Tech Horror'].indexOf(item)]}</option>
                )}
              </select>
            </div>
            <div className="field">
              <label htmlFor="length">{labels.length}</label>
              <select id="length" value={length} onChange={event => setLength(event.target.value)}>
                {['Short', 'Medium', 'Long'].map(item =>
                  <option key={item} value={item}>{labels.lengths[['Short','Medium','Long'].indexOf(item)]}</option>
                )}
              </select>
            </div>
          </div>
          <button className="generate-button" onClick={() => generate()} disabled={loading}>
            {loading ? <RefreshCw size={17} className="spin" /> : <Sparkles size={17} />}
            {loading ? labels.generating : labels.generate}
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
        <span className="footer-clock" aria-label={`India time ${footerTime}, ${footerDate}`}>
          <span className="clock-indicator" aria-hidden="true" />
          <time>{footerTime}</time>
          <span className="clock-date">{footerDate} · IST</span>
        </span>
      </footer>
    </main>
  )
}
