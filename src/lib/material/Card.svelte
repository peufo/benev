<script lang="ts">
	import { mdiArrowLeft } from '@mdi/js'
	import { Icon } from '.'

	let klass = ''
	export { klass as class }
	export let bodyClass = ''
	export let headerClass = ''
	export let returnUrl = ''
	export let style = ''
</script>

<div class="card bg-base-100 shadow-lg border bordered {klass}" {style}>
	<slot name="top" />

	<div class="card-body p-2 sm:p-8 {bodyClass}">
		{#if $$slots.title || $$slots.action}
			<div class="flex flex-wrap gap-2 items-center {headerClass}">
				{#if returnUrl}
					<a href={returnUrl} class="btn btn-square btn-ghost btn-sm">
						<Icon path={mdiArrowLeft} size={20} />
					</a>
				{/if}

				<div class="grow title">
					<slot name="title" />
				</div>
				<slot name="action" />
			</div>

			{#if $$slots.subtitle}
				<div class="text-sm opacity-80 my-4">
					<slot name="subtitle" />
				</div>
			{/if}
		{/if}

		<slot />
	</div>
</div>
