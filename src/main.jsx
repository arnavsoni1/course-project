import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const problems = [
  { id: '001', title: 'Two Sum', difficulty: 'Easy', tags: ['Array', 'Hash Table'], solved: true, likes: 124, time: '12 min' },
  { id: '002', title: 'Valid Parentheses', difficulty: 'Easy', tags: ['String', 'Stack'], solved: true, likes: 89, time: '18 min' },
  { id: '003', title: 'Merge k Sorted Lists', difficulty: 'Hard', tags: ['Linked List', 'Heap'], solved: false, likes: 241, time: '42 min' },
  { id: '004', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', tags: ['Array', 'DP'], solved: false, likes: 156, time: '16 min' },
  { id: '005', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', tags: ['Hash Table', 'String'], solved: false, likes: 198, time: '27 min' },
  { id: '006', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', tags: ['Tree', 'BFS'], solved: false, likes: 104, time: '31 min' },
  { id: '007', title: 'Climbing Stairs', difficulty: 'Easy', tags: ['Math', 'DP'], solved: true, likes: 73, time: '11 min' },
]

const code = `function twoSum(nums, target) {
  const seen = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }

    seen.set(nums[i], i);
  }
}`

function Icon({ children, size = 18 }) { return <span className="icon" style={{ fontSize: size }}>{children}</span> }

function App() {
  const [activeProblem, setActiveProblem] = useState(problems[0])
  const [activeNav, setActiveNav] = useState('Problems')
  const [filter, setFilter] = useState('All problems')
  const [search, setSearch] = useState('')
  const [language, setLanguage] = useState('JavaScript')
  const [activeTab, setActiveTab] = useState('Description')
  const [ran, setRan] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editableCode, setEditableCode] = useState(code)

  const visibleProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All problems' || p.difficulty === filter || (filter === 'Solved' && p.solved)
    return matchesSearch && matchesFilter
  })

  const copyCode = () => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1300) }

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><span>{'</>'}</span></div><span>codegrid</span><span className="beta">BETA</span></div>
      <nav className="main-nav">{['Problems', 'Discuss', 'Contests'].map(item => <button className={activeNav === item ? 'active' : ''} onClick={() => setActiveNav(item)} key={item}>{item}</button>)}</nav>
      <div className="top-actions"><button className="streak"><span className="flame">✦</span> 3 day streak</button><button className="icon-button"><Icon>⌘</Icon></button><button className="avatar">AR</button></div>
    </header>

    <main className="workspace">
      <aside className="problem-panel">
        <div className="panel-header"><div><div className="eyebrow">Practice room</div><h1>Problems</h1></div><button className="new-button"><Icon>＋</Icon> Create</button></div>
        <div className="search-wrap"><Icon>⌕</Icon><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems" /><kbd>⌘ K</kbd></div>
        <div className="filter-row">{['All problems', 'Easy', 'Medium', 'Hard', 'Solved'].map(item => <button key={item} onClick={() => setFilter(item)} className={filter === item ? 'selected' : ''}>{item === 'Solved' && <span className="check-small">✓</span>}{item}</button>)}</div>
        <div className="list-meta"><span>{visibleProblems.length} problems</span><button>Recently updated <span>⌄</span></button></div>
        <div className="problem-list">{visibleProblems.map(p => <button className={`problem-item ${activeProblem.id === p.id ? 'current' : ''}`} onClick={() => { setActiveProblem(p); setRan(false); setSubmitted(false) }} key={p.id}>
          <div className="problem-number">{p.solved ? <span className="solved">✓</span> : p.id}</div><div className="problem-info"><div className="problem-title">{p.title}</div><div className="problem-tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div></div><div className={`difficulty ${p.difficulty.toLowerCase()}`}>{p.difficulty}</div>
        </button>)}</div>
        <div className="panel-footer"><div className="progress-label"><span>Your progress</span><strong>3 / 50</strong></div><div className="progress"><span style={{ width: '12%' }} /></div><p>Keep going, you're on a roll.</p></div>
      </aside>

      <section className="challenge-panel">
        <div className="challenge-top"><div className="breadcrumbs"><span>Problems</span><i>/</i><strong>{activeProblem.title}</strong></div><div className="challenge-actions"><button onClick={() => setActiveTab('Discussion')}><Icon>☷</Icon> Discuss</button><button onClick={copyCode}><Icon>⧉</Icon> {copied ? 'Copied' : 'Share'}</button><button className="dots">•••</button></div></div>
        <div className="challenge-tabs">{['Description', 'Solutions', 'Submissions'].map(t => <button key={t} onClick={() => setActiveTab(t)} className={activeTab === t ? 'active' : ''}>{t}{t === 'Solutions' && <span className="tab-count">12</span>}</button>)}</div>
        {activeTab === 'Description' ? <div className="description scroll-area">
          <div className="title-line"><div><div className="problem-kicker">ARRAYS · HASH TABLE</div><h2>{activeProblem.title}</h2><div className="meta-line"><span className={`difficulty ${activeProblem.difficulty.toLowerCase()}`}>{activeProblem.difficulty}</span><span>♡ {activeProblem.likes}</span><span>◷ {activeProblem.time}</span></div></div><button className="bookmark">♧</button></div>
          <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers</em> such that they add up to <code>target</code>.</p>
          <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p><p>You can return the answer in any order.</p>
          <div className="callout"><Icon>✦</Icon><div><strong>Think about it</strong><span>Can you solve this in better than O(n²) time?</span></div></div>
          <h3>Example 1</h3><div className="example"><div><span>Input:</span> nums = [2, 7, 11, 15], target = 9</div><div><span>Output:</span> [0, 1]</div><div><span>Explanation:</span> Because nums[0] + nums[1] == 9, we return [0, 1].</div></div>
          <h3>Constraints</h3><ul><li>2 ≤ nums.length ≤ 10<sup>4</sup></li><li>-10<sup>9</sup> ≤ nums[i] ≤ 10<sup>9</sup></li><li>-10<sup>9</sup> ≤ target ≤ 10<sup>9</sup></li></ul>
        </div> : <div className="empty-tab"><div className="empty-icon">{activeTab === 'Solutions' ? '✦' : '◌'}</div><h2>{activeTab}</h2><p>{activeTab === 'Solutions' ? 'Community solutions will appear here.' : 'Your submission history is waiting for you.'}</p></div>}
        <div className="discussion-bar"><div className="online-dots"><span /><span /><span /></div><span>128 people are solving this right now</span><button>Join the conversation <Icon>→</Icon></button></div>
      </section>

      <section className="editor-panel">
        <div className="editor-head"><div className="file-tab"><span className="js-icon">JS</span> solution.js <button>×</button></div><div className="editor-tools"><select value={language} onChange={e => setLanguage(e.target.value)}><option>JavaScript</option><option>Python</option><option>TypeScript</option></select><button onClick={copyCode}>⧉</button><button>⚙</button></div></div>
        <textarea className="editor-textarea" value={editableCode} onChange={e => setEditableCode(e.target.value)} spellCheck="false"></textarea>
        <div className="test-panel"><div className="test-head"><div><button className="test-tab active">Testcase</button><button className="test-tab">Test Result</button></div><button className="collapse">⌄</button></div><div className="test-input"><label>nums <span>ⓘ</span></label><div>[2, 7, 11, 15]</div><label>target <span>ⓘ</span></label><div>9</div></div>{ran && <div className="result"><span>✓</span> Accepted <small>Runtime: 68 ms · Memory: 46.2 MB</small></div>}</div>
      </section>
    </main>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
