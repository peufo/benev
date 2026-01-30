<script context="module">
	export const palette = [
		'#FFD1DC',
		'#FFDAC1',
		'#FFF5BA',
		'#B5EAD7',
		'#C7CEEA',
		'#E0BBE4',
		'#F8E7D4',
		'#FFB7B2',
		'#E63946',
		'#F77F00',
		'#FCBF49',
		'#2A9D8F',
		'#264653',
		'#6A0572',
		'#3A86FF',
	]

	let colorIndex = 0
	export function getNextColor() {
		if (colorIndex >= palette.length) {
			colorIndex = 0
		}
		return palette[colorIndex++]
	}
</script>

<datalist id="palette">
	{#each palette as color}
		<option value={color} />
	{/each}
</datalist>
