<script lang="ts">
	let klass = ''
	export { klass as class }
</script>

<div class="card bg-base-100 shadow-lg {klass}">
	<div class="card-body p-2 sm:p-8">
		<div class="flex gap-2 mt-2 sm:mt-0 items-center">
			<div class="card-title"><slot name="title" /></div>
			<div class="grow" />
			<slot name="action" />
		</div>

		<div class="text-sm"><slot name="subtitle" /></div>
		<slot />
	</div>
</div>
