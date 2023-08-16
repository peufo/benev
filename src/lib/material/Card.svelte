<script lang="ts">
	let klass = ''
	export { klass as class }
</script>

<div class="card bg-base-100 shadow-lg {klass}">
	<div class="card-body p-2 sm:p-8">
		<div class="card-title mt-2 sm:mt-0"><slot name="title" /></div>
		<div class="text-sm"><slot name="subtitle" /></div>
		<slot />
	</div>
</div>
