<script lang="ts">
	import { Menu } from '@lucide/svelte'
	import { DropDown } from '$lib/fuma'
	import HomeMenuItems from './HomeMenuItems.svelte'
</script>

<div class="gap-2 hidden lg:flex">
	<HomeMenuItems />
</div>

<DropDown class="max-h-none min-w-[200px]" hideOnBlur>
	{#snippet activator()}
		<button  class="btn btn-square ml-2 lg:hidden">
			<Menu />
		</button>
	{/snippet}

	<div class="flex flex-col gap-1">
		<HomeMenuItems />
	</div>
</DropDown>
