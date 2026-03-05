<script lang="ts" context="module">
	const DELAY_IN = 300
	const DELAY_STEP = 50
	const DELAY_OUT = 0
</script>

<script lang="ts">
	export let index: number
	export let max: number

	const delayIn = DELAY_IN + index * DELAY_STEP
	const delayOut = DELAY_OUT + (max - index) * DELAY_STEP
</script>

<div
	style="--delay-in: {delayIn}ms; --delay-out: {delayOut}ms;"
	class="
        scale-0 opacity-0 transition-all group-hover:scale-95 group-hover:opacity-100
        delay-[--delay-out] group-hover:delay-[--delay-in]
    "
>
	<slot />
</div>
