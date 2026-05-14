<script lang="ts">
	import dayjs from '$lib/dayjs'
	import type { GithubIssue } from '$lib/types/github'
	import { MessageSquare } from 'lucide-svelte'

	export let issues: GithubIssue[]
	export let title: string
	export let titleHref: string | undefined = undefined
	export let showNewIssueButton = false
	export let showDescription = true
	export let showLabels = true
</script>

{#if issues.length > 0}
	<div class="flex flex-col gap-4 max-w-3xl">
		<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
			<div>
				{#if titleHref}
					<a
						href={titleHref}
						target="_blank"
						rel="noopener noreferrer"
						class="block text-xl font-semibold text-base-content/90 hover:text-primary transition-colors"
					>
						{title}
					</a>
				{:else}
					<h3 class="text-sm font-semibold text-base-content/50 uppercase tracking-wider">
						{title}
					</h3>
				{/if}
			</div>
			{#if showNewIssueButton}
				<a
					href="https://github.com/peufo/benev/issues/new"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-sm btn-primary shrink-0"
				>
					Ouvrir un sujet
				</a>
			{/if}
		</div>

		<div
			class="divide-y divide-base-200 border border-base-200 rounded-xl overflow-hidden bg-base-100 shadow-sm"
		>
			{#each issues as issue}
				<a
					href={issue.url}
					target="_blank"
					rel="noopener noreferrer"
					class="group block px-5 py-4 hover:bg-base-200/40 transition-colors"
				>
					<div class="flex items-baseline gap-2">
						<span class="text-xs font-mono shrink-0 text-base-content/40">
							#{issue.number}
						</span>
						<span
							class="text-sm font-medium transition-colors text-base-content/90 group-hover:text-primary"
						>
							{issue.title}
						</span>
					</div>

					<div
						class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xstext-base-content/50"
					>
						<span class="flex items-center gap-1.5">
							<img
								src={issue.author.avatar}
								alt="Avatar de {issue.author.name}"
								class="w-4 h-4 rounded-full"
							/>
							{issue.author.name}
						</span>
						<span>·</span>
						<span>{dayjs(issue.createdAt).fromNow()}</span>
						{#if issue.comments > 0}
							<span>·</span>
							<span class="inline-flex items-center gap-1">
								<MessageSquare size={12} />
								{issue.comments}
							</span>
						{/if}
					</div>

					{#if showDescription && issue.description}
						<p
							class="mt-2 text-sm text-base-content/60 whitespace-pre-line line-clamp-2 leading-relaxed"
						>
							{issue.description}
						</p>
					{/if}

					{#if showLabels && issue.labels.length > 0}
						<div class="flex flex-wrap gap-1.5 mt-2">
							{#each issue.labels as label}
								<span
									class="badge border-0 text-base-content/70"
									style="background-color: #{label.color}30;"
								>
									{label.name}
								</span>
							{/each}
						</div>
					{/if}
				</a>
			{/each}
		</div>
	</div>
{/if}
