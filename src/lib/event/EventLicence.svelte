<script lang="ts">
	import { CardBasic } from '$lib/material'
	import type { Event } from '@prisma/client'
	import { PUBLIC_FREE_EVENT_MAX_MEMBERS } from '$env/static/public'

	export let event: Event
	export let countMembersValided: number
</script>

<CardBasic>
	<div class="flex items-center gap-4">
		<p>
			Éssai limité à {PUBLIC_FREE_EVENT_MAX_MEMBERS} membres validés.
		</p>

		<div
			role="progressbar"
			class="radial-progress bg-warning/70"
			style="--value:{(countMembersValided / +PUBLIC_FREE_EVENT_MAX_MEMBERS) * 100}; --size: 4rem;"
		>
			{countMembersValided} / {PUBLIC_FREE_EVENT_MAX_MEMBERS}
		</div>
	</div>
</CardBasic>
