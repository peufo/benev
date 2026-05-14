export interface GithubIssueLabel {
	name: string
	color: string
}

export interface GithubIssueAuthor {
	name: string
	avatar: string
	url: string
}

export interface GithubIssue {
	number: number
	title: string
	url: string
	description: string | null
	comments: number
	createdAt: string
	updatedAt: string
	author: GithubIssueAuthor
	labels: GithubIssueLabel[]
}
