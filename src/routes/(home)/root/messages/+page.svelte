<script lang="ts">
	import type { Component } from 'svelte'
	import { CheckIcon, ClockIcon, MailIcon, OctagonAlertIcon, type IconProps } from '@lucide/svelte'
	import type { Message, MessageState } from '@prisma/client'
	import { invalidateAll } from '$app/navigation'
	import { InputOptionInParam } from '$lib/fuma-legacy'
	import { DropDown, tip } from 'fuma'
	import { Pagination } from 'fuma'
	import { useNotify } from '$lib/notify'
	import { setMessageState } from './message.remote'

	let { data } = $props()

	const statesMap: Record<
		MessageState,
		{ state: MessageState; label: string; icon: Component<IconProps>; class: string }
	> = {
		waitOnAgent: {
			state: 'waitOnAgent',
			label: 'A traité',
			icon: OctagonAlertIcon,
			class: 'text-warning',
		},
		waitOnAuthor: {
			state: 'waitOnAuthor',
			label: `En attente d'une réponse`,
			icon: ClockIcon,
			class: 'text-info',
		},
		done: { state: 'done', label: 'Terminé', icon: CheckIcon, class: 'text-success' },
	}

	const notifiy = useNotify()

	async function updateMessageState(message: Message, state: Message['state']) {
		try {
			await setMessageState({ messageId: message.id, state })
			notifiy.success('State updated')
			await invalidateAll()
		} catch (err) {
			console.error(err)
			notifiy.error('error')
		}
	}
</script>

<div class="max-w-7xl mx-auto">
	<InputOptionInParam key="state" options={statesMap} />
	<table class="table border">
		<thead>
			<tr>
				<td>State</td>
				<td>Author</td>
				<td>Subject</td>
				<td>Content</td>
			</tr>
		</thead>
		<tbody>
			{#each data.messages as message (message.id)}
				{@const state = statesMap[message.state]}
				<tr>
					<td>
						<DropDown>
							{#snippet activator()}
								{@const StateIcon = state.icon}
								<button class="btn btn-square btn-sm btn-ghost" use:tip={{ content: state.label }}>
									<StateIcon class={state.class} />
								</button>
							{/snippet}

							{#each Object.values(statesMap) as state (state.state)}
								{@const StateIcon = state.icon}
								<button
									type="button"
									class="menu-item w-full"
									onclick={() => updateMessageState(message, state.state)}
								>
									<StateIcon class={state.class} />
									{state.label}
								</button>
							{/each}
						</DropDown>
					</td>

					<td>
						{message.author.firstName}
						{message.author.lastName}
					</td>
					<td>
						{message.subject}
					</td>
					<td>
						{message.content}
					</td>
					<td align="right">
						<a
							target="_blank"
							href="mailto:{message.author.email}?subject=Réponse de benev.io: {message.subject}"
							class="btn btn-sm btn-square"
						>
							<span class="inline-flex" use:tip={{ content: 'Répondre' }}><MailIcon /></span>
						</a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="flex justify-end mt-2">
		<Pagination />
	</div>
</div>
