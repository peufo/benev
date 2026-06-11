<script lang="ts">
	import { Menu } from 'lucide-svelte'
	import { DropDown } from 'fuma'
	import HomeMenuItems from './HomeMenuItems.svelte'
</script>

<div class="gap-2 hidden lg:flex">
	<HomeMenuItems />
</div>

<DropDown class="max-h-none min-w-[200px]" hideOnBlur>
	<button slot="activator" class="btn btn-square ml-2 lg:hidden">
		<Menu />
	</button>

	<div class="flex flex-col gap-1">
		<HomeMenuItems />
	</div>
</DropDown>
