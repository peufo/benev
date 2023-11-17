<script lang="ts">
	export let posterId: string | null
	let scrollY = 0

	const scotchW = 160
	const scotchH = 30
	const createScotchPath = () => {
		const deep = 8
		const weight = 6
		let t = `M0 0 H${scotchW}`

		let currentY = 0
		while (currentY < scotchH) {
			currentY += weight / 2
			t += `L${scotchW - deep} ${currentY}`
			currentY += weight / 2
			t += `L${scotchW} ${currentY}`
		}

		while (currentY > 0) {
			currentY -= weight / 2
			t += `L${deep} ${currentY}`
			currentY -= weight / 2
			t += `L0 ${currentY}`
		}

		t += 'z'
		return t
	}

	const scotchPath = createScotchPath()
</script>

<svelte:window bind:scrollY />

{#if posterId}
	<div
		class="relative -z-10"
		style="--scotchW: {scotchW}px; --scotchH: {scotchH}px;--scotchPath: path('{scotchPath}');"
	>
		<div
			class="absolute will-change-transform max-w-[75%]"
			style:transform="translate(10%, {180 + scrollY / 1.5}px) rotate(5deg)"
		>
			<img src="/media/{posterId}?size=a2" alt="Affiche" class="drop-shadow opacity-70" />
			<div class="scotch bg-base-300/50 top-0 -left-14 rotate-[-40deg]" />
			<div class="scotch bg-base-300/50 top-0 -right-14 rotate-[45deg]" />
			<div class="scotch bg-base-300/50 bottom-2 -right-14 rotate-[-40deg]" />
			<div class="scotch bg-base-300/50 bottom-2 -left-14 rotate-[45deg]" />
		</div>
	</div>
{/if}

<style>
	.scotch {
		position: absolute;
		width: var(--scotchW);
		height: var(--scotchH);
		clip-path: var(--scotchPath);
	}
</style>
