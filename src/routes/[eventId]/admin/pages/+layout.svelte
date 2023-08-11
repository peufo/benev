<script lang="ts">
	import { mdiPlus } from '@mdi/js'

	import { Icon } from '$lib/material'
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form/index.js'

	export let data

	const form = useForm()
</script>


<div class="flex gap-2 flex-wrap">
	<div>
		<ul class="menu menu-lg bg-base-200 w-56 rounded-box mt-2 text-clip">
			
			<li>
				<a
					href="{$eventPath}/admin/pages/{data.pageIndex.id}"
					class:active={$page.params.pageId === data.pageIndex.id}
				>
					{data.pageIndex.title}
				</a>
			</li>

			{#each data.pages as { id, title }}
				<li>
					<a href="{$eventPath}/admin/pages/{id}" class:active={$page.params.pageId === id}>
						{title}
					</a>
				</li>
			{/each}
		</ul>

		<form action="{$eventPath}/admin/pages?/create_page" method="post" use:enhance={form.submit}>
			<button class="btn w-full mt-2">
				<Icon path={mdiPlus} />
				Nouvel page
			</button>
		</form>
	</div>

	<div class="grow">
		<slot />
	</div>
</div>
