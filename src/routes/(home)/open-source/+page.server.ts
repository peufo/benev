import type { GithubIssue } from '$lib/types/github'
import { pageMetaTags } from '$lib/seo'

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
	updated_at: string
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

type GithubActivity = {
	openCount: number
	closedCount: number
	recentIssues: GithubIssue[]
	recentClosedIssues: GithubIssue[]
}

const EMPTY_ACTIVITY: GithubActivity = {
	openCount: 0,
	closedCount: 0,
	recentIssues: [],
	recentClosedIssues: [],
}

/**
 * L'API GitHub est limitée en débit et la page est indexable : sans cache, une rafale de crawl
 * suffit à servir une page vide. 15 minutes suffisent pour de l'activité de dépôt.
 */
const CACHE_TTL = 15 * 60 * 1000
let cache: { at: number; activity: GithubActivity } | null = null

export const load = async () => {
	return {
		...(await fetchGithubActivity()),
		metaTags: pageMetaTags({
			title: 'Open source',
			description:
				'benevio est open source : consulte le code, suis les évolutions en cours et propose des améliorations sur GitHub.',
		}),
	}
}

async function fetchGithubActivity(): Promise<GithubActivity> {
	if (cache && Date.now() - cache.at < CACHE_TTL) return cache.activity

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
			updatedAt: i.updated_at,
			author: {
				name: i.user.login,
				avatar: i.user.avatar_url,
				url: i.user.html_url,
			},
			labels: i.labels.map((l) => ({ name: l.name, color: l.color })),
		})

		const activity: GithubActivity = {
			openCount: openData.total_count ?? 0,
			closedCount: closedData.total_count ?? 0,
			recentIssues: issues.filter((i) => !i.pull_request).map(mapIssue),
			recentClosedIssues: closedIssues.filter((i) => !i.pull_request).map(mapIssue),
		}
		cache = { at: Date.now(), activity }
		return activity
	} catch {
		// On resert le dernier succès plutôt qu'une page vide, même expiré
		return cache?.activity ?? EMPTY_ACTIVITY
	}
}
