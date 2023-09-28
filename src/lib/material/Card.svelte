<script lang="ts">
	import { mdiArrowLeft } from '@mdi/js'
	import { Icon } from '.'

	let klass = ''
	export { klass as class }
	export let bodyClass = ''
	export let headerClass = ''
	export let returnUrl = ''
</script>

<div class="card bg-base-100 shadow-lg {klass}">
	<div class="card-body p-2 sm:p-8 {bodyClass}">
		{#if $$slots.title || $$slots.action}
			<div class="flex gap-2 mt-2 sm:mt-0 items-center {headerClass}">
				<div class="flex gap-2 flex-wrap">
					{#if returnUrl}
						<a href={returnUrl} class="btn btn-square btn-ghost btn-sm">
							<Icon path={mdiArrowLeft} size={20} />
						</a>
					{/if}
					<div class="card-title">
						<slot name="title" />
					</div>
				</div>
				<div class="grow" />
				<slot name="action" />
			</div>
		{/if}

		{#if $$slots.subtitle}
			<div class="text-sm" class:pl-10={returnUrl}>
				<slot name="subtitle" />
			</div>
		{/if}
		<slot />
	</div>
</div>
