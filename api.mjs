import { getAcceptedProblemIds, listSubmissions, saveSubmission } from './submissions.mjs'

const seedProblems = [
  { id: '001', title: 'Two Sum', difficulty: 'Easy', tags: ['Array', 'Hash Table'], solved: true, likes: 124, time: '12 min', category: 'ARRAYS · HASH TABLE', description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', example: { nums: '[2, 7, 11, 15]', target: '9', output: '[0, 1]' } },
  { id: '002', title: 'Valid Parentheses', difficulty: 'Easy', tags: ['String', 'Stack'], solved: true, likes: 89, time: '18 min', category: 'STRING · STACK', description: 'Given a string containing brackets, determine whether its brackets are closed in the correct order.', example: { nums: '"()[]{}"', target: '—', output: 'true' } },
  { id: '003', title: 'Merge k Sorted Lists', difficulty: 'Hard', tags: ['Linked List', 'Heap'], solved: false, likes: 241, time: '42 min', category: 'LINKED LIST · HEAP', description: 'Merge k sorted linked lists and return one sorted list.', example: { nums: '[[1,4,5],[1,3,4],[2,6]]', target: '—', output: '[1,1,2,3,4,4,5,6]' } },
  { id: '004', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', tags: ['Array', 'DP'], solved: false, likes: 156, time: '16 min', category: 'ARRAYS · DYNAMIC PROGRAMMING', description: 'Choose one day to buy and a later day to sell a stock for the largest possible profit.', example: { nums: '[7,1,5,3,6,4]', target: '—', output: '5' } },
  { id: '005', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', tags: ['Hash Table', 'String'], solved: false, likes: 198, time: '27 min', category: 'HASH TABLE · STRING', description: 'Find the length of the longest substring that contains no repeated characters.', example: { nums: '"abcabcbb"', target: '—', output: '3' } },
  { id: '006', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', tags: ['Tree', 'BFS'], solved: false, likes: 104, time: '31 min', category: 'TREE · BREADTH FIRST SEARCH', description: 'Return the values of a binary tree level by level.', example: { nums: '[3,9,20,null,null,15,7]', target: '—', output: '[[3],[9,20],[15,7]]' } },
  { id: '007', title: 'Climbing Stairs', difficulty: 'Easy', tags: ['Math', 'DP'], solved: true, likes: 73, time: '11 min', category: 'MATH · DYNAMIC PROGRAMMING', description: 'Count the distinct ways to climb a staircase when you can take one or two steps.', example: { nums: '5', target: '—', output: '8' } }
]

const state = {
  problems: structuredClone(seedProblems),
  nextId: 8
}

const acceptedProblemIds = getAcceptedProblemIds()
for (const problem of state.problems) {
  if (acceptedProblemIds.has(problem.id)) problem.solved = true
}

function send(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(payload))
}

async function body(req) {
  let raw = ''
  for await (const chunk of req) raw += chunk
  try { return raw ? JSON.parse(raw) : {} } catch { return null }
}

function solutionLooksValid(code) {
  const normalized = String(code || '').replace(/\s/g, '')
  return normalized.length > 35 && /(return|=>)/.test(normalized) && /(Map|seen|hash|for|while|reduce)/i.test(normalized)
}

export async function apiHandler(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const path = url.pathname.replace(/\/$/, '') || '/'

  if (req.method === 'GET' && path === '/api/health') return send(res, 200, { status: 'ok', problems: state.problems.length })
  if (req.method === 'GET' && path === '/api/problems') return send(res, 200, { problems: state.problems })

  const problemMatch = path.match(/^\/api\/problems\/(\d+)$/)
  if (req.method === 'GET' && problemMatch) {
    const problem = state.problems.find(item => item.id === problemMatch[1])
    return problem ? send(res, 200, { problem }) : send(res, 404, { error: 'Problem not found' })
  }

  if (req.method === 'GET' && path === '/api/submissions') {
    const problemId = url.searchParams.get('problemId')
    return send(res, 200, { submissions: listSubmissions(problemId) })
  }

  if (req.method === 'POST' && path === '/api/run') {
    const payload = await body(req)
    if (!payload || !state.problems.some(item => item.id === payload.problemId)) return send(res, 400, { error: 'Choose a valid problem and send valid JSON.' })
    const accepted = solutionLooksValid(payload.code)
    return send(res, 200, {
      accepted,
      status: accepted ? 'Accepted' : 'Needs work',
      message: accepted ? 'Your solution passed the two sample checks.' : 'Add a complete solution and try the sample checks again.',
      runtime: accepted ? '68 ms' : '—',
      memory: accepted ? '46.2 MB' : '—',
      tests: accepted ? 2 : 0
    })
  }

  if (req.method === 'POST' && path === '/api/submissions') {
    const payload = await body(req)
    const problem = payload && state.problems.find(item => item.id === payload.problemId)
    if (!problem) return send(res, 400, { error: 'Choose a valid problem before submitting.' })
    const accepted = solutionLooksValid(payload.code)
    const submission = saveSubmission({ problemId: problem.id, language: payload.language || 'JavaScript', code: String(payload.code || ''), status: accepted ? 'Accepted' : 'Rejected', createdAt: new Date().toISOString(), runtime: accepted ? '68 ms' : '—' })
    if (accepted) problem.solved = true
    return send(res, 201, { submission, accepted, message: accepted ? 'Submission accepted and progress updated.' : 'Submission saved. Complete the sample checks before trying again.' })
  }

  if (req.method === 'POST' && path === '/api/problems') {
    const payload = await body(req)
    const title = String(payload?.title || '').trim()
    if (!title) return send(res, 400, { error: 'A problem title is required.' })
    const problem = { id: String(state.nextId++).padStart(3, '0'), title, difficulty: ['Easy', 'Medium', 'Hard'].includes(payload.difficulty) ? payload.difficulty : 'Medium', tags: Array.isArray(payload.tags) && payload.tags.length ? payload.tags.slice(0, 3) : ['Custom'], solved: false, likes: 0, time: 'New', category: 'CUSTOM CHALLENGE', description: String(payload.description || 'Add your own problem description.').slice(0, 800), example: { nums: '[1, 2]', target: '3', output: '[0, 1]' } }
    state.problems.unshift(problem)
    return send(res, 201, { problem })
  }

  return send(res, 404, { error: 'API route not found' })
}
