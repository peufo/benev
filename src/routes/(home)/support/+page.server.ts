import type { GithubIssue } from '$lib/types/github'

interface GitHubApiLabel {
	name: string
	color: string
}

interface GitHubApiUser {
	login: string
	avatar_url: string
	html_url: string
}

interface GitHubApiIssue {
	number: number
	title: string
	html_url: string
	body: string | null
	comments: number
	created_at: string
	user: GitHubApiUser
	labels: GitHubApiLabel[]
	pull_request?: unknown
}

interface SearchResult {
	total_count: number
}

function truncate(text: string | null, maxLength = 360): string | null {
	if (!text) return null
	const cleaned = text.replace(/\n{2,}/g, '\n').trim()
	if (cleaned.length <= maxLength) return cleaned
	return cleaned.slice(0, maxLength).trimEnd() + '...'
}

export const load = async () => {
	try {
		const [openRes, closedRes, issuesRes, closedIssuesRes] = await Promise.all([
			fetch('https://api.github.com/search/issues?q=repo:peufo/benev+is:issue+state:open'),
			fetch('https://api.github.com/search/issues?q=repo:peufo/benev+is:issue+state:closed'),
			fetch(
				'https://api.github.com/repos/peufo/benev/issues?state=open&per_page=6&sort=created&direction=desc'
			),
			fetch(
				'https://api.github.com/repos/peufo/benev/issues?state=closed&per_page=5&sort=updated&direction=desc'
			),
		])

		const openData: SearchResult = openRes.ok ? await openRes.json() : { total_count: 0 }
		const closedData: SearchResult = closedRes.ok ? await closedRes.json() : { total_count: 0 }
		const issues: GitHubApiIssue[] = issuesRes.ok ? await issuesRes.json() : []
		const closedIssues: GitHubApiIssue[] = closedIssuesRes.ok ? await closedIssuesRes.json() : []

		const mapIssue = (i: GitHubApiIssue): GithubIssue => ({
			number: i.number,
			title: i.title,
			url: i.html_url,
			description: truncate(i.body),
			comments: i.comments,
			createdAt: i.created_at,
			author: {
				name: i.user.login,
				avatar: i.user.avatar_url,
				url: i.user.html_url,
			},
			labels: i.labels.map((l) => ({ name: l.name, color: l.color })),
		})

		return {
			openCount: openData.total_count ?? 0,
			closedCount: closedData.total_count ?? 0,
			recentIssues: issues.filter((i) => !i.pull_request).map(mapIssue),
			recentClosedIssues: closedIssues.filter((i) => !i.pull_request).map(mapIssue),
		} satisfies { openCount: number; closedCount: number; recentIssues: GithubIssue[]; recentClosedIssues: GithubIssue[] }
	} catch {
		return { openCount: 0, closedCount: 0, recentIssues: [], recentClosedIssues: [] }
	}
}
