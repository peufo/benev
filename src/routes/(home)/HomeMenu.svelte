<script lang="ts">
	import { Menu } from '@lucide/svelte'
	import { Popover } from 'fuma'
	import HomeMenuItems from './HomeMenuItems.svelte'
</script>

<div class="gap-2 hidden lg:flex">
	<HomeMenuItems />
</div>

<Popover class="my-1 min-w-50">
	{#snippet trigger({ trigger })}
		<button {...trigger} class="btn btn-square ml-2 lg:hidden">
			<Menu />
		</button>
	{/snippet}

	<div class="menu w-full p-1 gap-1">
		<HomeMenuItems />
	</div>
</Popover>
