import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const starterCode = `function twoSum(nums, target) {
  const seen = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
}`

function Icon({ children, size = 18 }) { return <span className="icon" style={{ fontSize: size }}>{children}</span> }

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'The server could not complete that request.')
  return payload
}

function App() {
  const [problems, setProblems] = useState([])
  const [activeProblem, setActiveProblem] = useState(null)
  const [activeNav, setActiveNav] = useState('Problems')
  const [filter, setFilter] = useState('All problems')
  const [search, setSearch] = useState('')
  const [language, setLanguage] = useState('JavaScript')
  const [activeTab, setActiveTab] = useState('Description')
  const [testTab, setTestTab] = useState('Testcase')
  const [editableCode, setEditableCode] = useState(starterCode)
  const [runResult, setRunResult] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [newProblem, setNewProblem] = useState({ title: '', difficulty: 'Medium', tags: 'Custom, Array', description: '' })

  useEffect(() => {
    api('/api/problems').then(({ problems: loaded }) => {
      setProblems(loaded)
      setActiveProblem(loaded[0] || null)
    }).catch(error => setNotice(error.message))
  }, [])

  useEffect(() => {
    if (activeTab !== 'Submissions' || !activeProblem) return
    api(`/api/submissions?problemId=${activeProblem.id}`).then(({ submissions: loaded }) => setSubmissions(loaded)).catch(error => setNotice(error.message))
  }, [activeTab, activeProblem])

  const visibleProblems = useMemo(() => problems.filter(problem => {
    const query = search.toLowerCase()
    return (problem.title.toLowerCase().includes(query) || problem.tags.join(' ').toLowerCase().includes(query)) &&
      (filter === 'All problems' || problem.difficulty === filter || (filter === 'Solved' && problem.solved))
  }), [problems, filter, search])

  const solved = problems.filter(problem => problem.solved).length
  const selectProblem = problem => {
    setActiveProblem(problem)
    setActiveTab('Description')
    setRunResult(null)
    setTestTab('Testcase')
  }

  const runCode = async () => {
    if (!activeProblem) return
    setIsRunning(true); setRunResult(null); setNotice('')
    try {
      const result = await api('/api/run', { method: 'POST', body: JSON.stringify({ problemId: activeProblem.id, code: editableCode, language }) })
      setRunResult(result); setTestTab('Test Result')
    } catch (error) { setNotice(error.message) } finally { setIsRunning(false) }
  }

  const submitCode = async () => {
    if (!activeProblem) return
    setIsSubmitting(true); setNotice('')
    try {
      const result = await api('/api/submissions', { method: 'POST', body: JSON.stringify({ problemId: activeProblem.id, code: editableCode, language }) })
      setNotice(result.message)
      if (result.accepted) {
        setProblems(current => current.map(problem => problem.id === activeProblem.id ? { ...problem, solved: true } : problem))
        setActiveProblem(current => ({ ...current, solved: true }))
        setRunResult({ accepted: true, status: 'Accepted', message: result.message, runtime: result.submission.runtime, memory: '46.2 MB', tests: 2 })
        setTestTab('Test Result')
      }
      if (activeTab === 'Submissions') setSubmissions(current => [result.submission, ...current])
    } catch (error) { setNotice(error.message) } finally { setIsSubmitting(false) }
  }

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(editableCode); setNotice('Solution copied to your clipboard.') } catch { setNotice('Copy is unavailable in this browser.') }
  }

  const createProblem = async event => {
    event.preventDefault()
    try {
      const { problem } = await api('/api/problems', { method: 'POST', body: JSON.stringify({ ...newProblem, tags: newProblem.tags.split(',').map(tag => tag.trim()).filter(Boolean) }) })
      setProblems(current => [problem, ...current]); setActiveProblem(problem); setShowCreate(false); setNewProblem({ title: '', difficulty: 'Medium', tags: 'Custom, Array', description: '' }); setNotice('Custom problem created.')
    } catch (error) { setNotice(error.message) }
  }

  if (!activeProblem) return <div className="loading-screen">Loading your practice room… {notice && <small>{notice}</small>}</div>

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><span>{'</>'}</span></div><span>codegrid</span><span className="beta">BETA</span></div>
      <nav className="main-nav">{['Problems', 'Discuss', 'Contests'].map(item => <button className={activeNav === item ? 'active' : ''} onClick={() => { setActiveNav(item); setNotice(`${item} is being prepared for the next release.`) }} key={item}>{item}</button>)}</nav>
      <div className="top-actions"><button className="streak"><span className="flame">✦</span> {solved} solved</button><button className="icon-button" onClick={() => setNotice('Keyboard shortcuts are coming soon.')}><Icon>⌘</Icon></button><button className="avatar">AR</button></div>
    </header>

    <main className="workspace">
      <aside className="problem-panel">
        <div className="panel-header"><div><div className="eyebrow">Practice room</div><h1>Problems</h1></div><button className="new-button" onClick={() => setShowCreate(true)}><Icon>＋</Icon> Create</button></div>
        <div className="search-wrap"><Icon>⌕</Icon><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search problems" /><kbd>⌘ K</kbd></div>
        <div className="filter-row">{['All problems', 'Easy', 'Medium', 'Hard', 'Solved'].map(item => <button key={item} onClick={() => setFilter(item)} className={filter === item ? 'selected' : ''}>{item === 'Solved' && <span className="check-small">✓</span>}{item}</button>)}</div>
        <div className="list-meta"><span>{visibleProblems.length} problems</span><button onClick={() => setNotice('Problems are ordered by their most recent update.')}>Recently updated <span>⌄</span></button></div>
        <div className="problem-list">{visibleProblems.map(problem => <button className={`problem-item ${activeProblem.id === problem.id ? 'current' : ''}`} onClick={() => selectProblem(problem)} key={problem.id}>
          <div className="problem-number">{problem.solved ? <span className="solved">✓</span> : problem.id}</div><div className="problem-info"><div className="problem-title">{problem.title}</div><div className="problem-tags">{problem.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div><div className={`difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</div>
        </button>)}</div>
        <div className="panel-footer"><div className="progress-label"><span>Your progress</span><strong>{solved} / {problems.length}</strong></div><div className="progress"><span style={{ width: `${problems.length ? Math.round(solved / problems.length * 100) : 0}%` }} /></div><p>Keep going, you're on a roll.</p></div>
      </aside>

      <section className="challenge-panel">
        <div className="challenge-top"><div className="breadcrumbs"><span>Problems</span><i>/</i><strong>{activeProblem.title}</strong></div><div className="challenge-actions"><button onClick={() => setNotice('Discussion opens with a connected community service.')}><Icon>☷</Icon> Discuss</button><button onClick={copyCode}><Icon>⧉</Icon> Share</button><button className="dots" onClick={() => setNotice('More workspace actions are coming soon.')}>•••</button></div></div>
        <div className="challenge-tabs">{['Description', 'Solutions', 'Submissions'].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'active' : ''}>{tab}{tab === 'Solutions' && <span className="tab-count">12</span>}</button>)}</div>
        {activeTab === 'Description' && <div className="description scroll-area">
          <div className="title-line"><div><div className="problem-kicker">{activeProblem.category}</div><h2>{activeProblem.title}</h2><div className="meta-line"><span className={`difficulty ${activeProblem.difficulty.toLowerCase()}`}>{activeProblem.difficulty}</span><span>♡ {activeProblem.likes}</span><span>◷ {activeProblem.time}</span></div></div><button className="bookmark" onClick={() => setNotice('Problem saved to your bookmarks.')}>♧</button></div>
          <p>{activeProblem.description}</p><p>You may assume each input has one valid answer. Return the answer in any order.</p>
          <div className="callout"><Icon>✦</Icon><div><strong>Think about it</strong><span>Can you solve this in better than O(n²) time?</span></div></div>
          <h3>Example 1</h3><div className="example"><div><span>Input:</span> nums = {activeProblem.example.nums}{activeProblem.example.target !== '—' && `, target = ${activeProblem.example.target}`}</div><div><span>Output:</span> {activeProblem.example.output}</div><div><span>Explanation:</span> Use the sample case to test your approach.</div></div>
          <h3>Constraints</h3><ul><li>Use a solution that handles the given input shape.</li><li>Keep the implementation readable and efficient.</li><li>Run sample tests before submitting.</li></ul>
        </div>}
        {activeTab === 'Solutions' && <div className="empty-tab"><div className="empty-icon">✦</div><h2>Community solutions</h2><p>Solution sharing will appear here once a community service is connected.</p></div>}
        {activeTab === 'Submissions' && <div className="submissions scroll-area">{submissions.length ? submissions.map(submission => <div className="submission" key={submission.id}><strong className={submission.status === 'Accepted' ? 'accepted' : 'rejected'}>{submission.status}</strong><span>{submission.language}</span><span>{submission.runtime}</span><time>{new Date(submission.createdAt).toLocaleString()}</time></div>) : <div className="empty-tab"><div className="empty-icon">◌</div><h2>No submissions yet</h2><p>Submit your solution to create a history here.</p></div>}</div>}
        <div className="discussion-bar"><div className="online-dots"><span /><span /><span /></div><span>128 people are solving this right now</span><button onClick={() => setNotice('Discussion opens with a connected community service.')}>Join the conversation <Icon>→</Icon></button></div>
      </section>

      <section className="editor-panel">
        <div className="editor-head"><div className="file-tab"><span className="js-icon">{language === 'Python' ? 'PY' : language === 'TypeScript' ? 'TS' : 'JS'}</span> solution.{language === 'Python' ? 'py' : language === 'TypeScript' ? 'ts' : 'js'} <button onClick={() => setEditableCode('')}>×</button></div><div className="editor-tools"><select value={language} onChange={event => setLanguage(event.target.value)}><option>JavaScript</option><option>Python</option><option>TypeScript</option></select><button onClick={copyCode}>⧉</button><button onClick={() => setNotice('Editor settings are saved locally in this session.')}>⚙</button></div></div>
        <textarea aria-label="Solution editor" className="editor-textarea" value={editableCode} onChange={event => setEditableCode(event.target.value)} spellCheck="false" />
        <div className="test-panel"><div className="test-head"><div><button className={`test-tab ${testTab === 'Testcase' ? 'active' : ''}`} onClick={() => setTestTab('Testcase')}>Testcase</button><button className={`test-tab ${testTab === 'Test Result' ? 'active' : ''}`} onClick={() => setTestTab('Test Result')}>Test Result</button></div><button className="collapse">⌄</button></div>
          {testTab === 'Testcase' ? <div className="test-input"><label>nums <span>ⓘ</span></label><div>{activeProblem.example.nums}</div><label>target <span>ⓘ</span></label><div>{activeProblem.example.target}</div></div> : <div className={`result ${runResult?.accepted ? '' : 'failed'}`}>{runResult ? <><span>{runResult.accepted ? '✓' : '×'}</span> {runResult.status} <small>{runResult.message} {runResult.accepted && `· Runtime: ${runResult.runtime} · Memory: ${runResult.memory}`}</small></> : <span>Run your code to see a result.</span>}</div>}
        </div>
        <div className="run-bar"><span className="notice">{notice}</span><button className="run-button" onClick={runCode} disabled={isRunning}>{isRunning ? 'Running…' : 'Run'}</button><button className="submit-button" onClick={submitCode} disabled={isSubmitting}>{isSubmitting ? 'Submitting…' : 'Submit'}</button></div>
      </section>
    </main>

    {showCreate && <div className="modal-backdrop" role="presentation"><form className="create-modal" onSubmit={createProblem}><div><div className="eyebrow">Custom challenge</div><h2>Create a problem</h2></div><label>Title<input autoFocus value={newProblem.title} onChange={event => setNewProblem(current => ({ ...current, title: event.target.value }))} placeholder="e.g. Pair with target sum" required /></label><label>Difficulty<select value={newProblem.difficulty} onChange={event => setNewProblem(current => ({ ...current, difficulty: event.target.value }))}><option>Easy</option><option>Medium</option><option>Hard</option></select></label><label>Tags<input value={newProblem.tags} onChange={event => setNewProblem(current => ({ ...current, tags: event.target.value }))} placeholder="Array, Hash Table" /></label><label>Description<textarea value={newProblem.description} onChange={event => setNewProblem(current => ({ ...current, description: event.target.value }))} placeholder="What should the solver do?" /></label><div className="modal-actions"><button type="button" className="run-button" onClick={() => setShowCreate(false)}>Cancel</button><button className="submit-button">Create problem</button></div></form></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
