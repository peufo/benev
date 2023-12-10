<script lang="ts">
	import {
		mdiAlertOctagonOutline,
		mdiCheck,
		mdiClockTimeFourOutline,
		mdiEmail,
		mdiEmailOutline,
	} from '@mdi/js'
	import type { Message, MessageState } from '@prisma/client'
	import { invalidateAll } from '$app/navigation'
	import axios from 'axios'
	import { Icon, DropDown, Pagination, InputOptionInParam } from '$lib/material'
	import { useNotify } from '$lib/notify'

	export let data

	const statesMap: Record<
		MessageState,
		{ state: MessageState; label: string; icon: string; class: string }
	> = {
		waitOnAgent: {
			state: 'waitOnAgent',
			label: 'A traité',
			icon: mdiAlertOctagonOutline,
			class: 'fill-warning',
		},
		waitOnAuthor: {
			state: 'waitOnAuthor',
			label: `En attente d'une réponse`,
			icon: mdiClockTimeFourOutline,
			class: 'fill-info',
		},
		done: { state: 'done', label: 'Terminé', icon: mdiCheck, class: 'fill-success' },
	}

	const notifiy = useNotify()

	async function setMessageState(message: Message, state: Message['state']) {
		const formData = new FormData()
		formData.append('messageId', message.id)
		formData.append('state', state)
		axios
			.postForm('/root/messages?/set_state', formData)
			.then(() => {
				notifiy.success('State updated')
				invalidateAll()
			})
			.catch((err) => {
				console.error(err)
				notifiy.error('error')
			})
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
			{#each data.messages as message}
				{@const state = statesMap[message.state]}
				<tr>
					<td>
						<DropDown>
							<button slot="activator" class="btn btn-square btn-sm btn-ghost">
								<Icon path={state.icon} class={state.class} title={state.label} />
							</button>

							{#each Object.values(statesMap) as state}
								<button
									type="button"
									class="menu-item w-full"
									on:click={() => setMessageState(message, state.state)}
								>
									<Icon path={state.icon} class={state.class} />
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
							<Icon path={mdiEmailOutline} title="Répondre" />
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
