import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const databasePath = resolve(process.env.CODEGRID_DB_PATH || 'data/codegrid.sqlite')
mkdirSync(dirname(databasePath), { recursive: true })

const database = new DatabaseSync(databasePath)
database.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id TEXT NOT NULL,
    language TEXT NOT NULL,
    code TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    runtime TEXT NOT NULL
  )
`)

const selectColumns = 'id, problem_id AS problemId, language, status, created_at AS createdAt, runtime'
const allSubmissions = database.prepare(`SELECT ${selectColumns} FROM submissions ORDER BY id DESC`)
const problemSubmissions = database.prepare(`SELECT ${selectColumns} FROM submissions WHERE problem_id = ? ORDER BY id DESC`)
const insertSubmission = database.prepare('INSERT INTO submissions (problem_id, language, code, status, created_at, runtime) VALUES (?, ?, ?, ?, ?, ?)')
const acceptedProblems = database.prepare("SELECT DISTINCT problem_id AS problemId FROM submissions WHERE status = 'Accepted'")

function formatSubmission(row) {
  return { ...row, id: String(row.id).padStart(4, '0') }
}

export function listSubmissions(problemId) {
  return (problemId ? problemSubmissions.all(problemId) : allSubmissions.all()).map(formatSubmission)
}

export function saveSubmission({ problemId, language, code, status, createdAt, runtime }) {
  const { lastInsertRowid } = insertSubmission.run(problemId, language, code, status, createdAt, runtime)
  return formatSubmission({ id: lastInsertRowid, problemId, language, status, createdAt, runtime })
}

export function getAcceptedProblemIds() {
  return new Set(acceptedProblems.all().map(row => row.problemId))
}
