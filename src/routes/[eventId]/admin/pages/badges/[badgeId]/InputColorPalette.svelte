<script lang="ts" module>
	export const palette = [
		'#FFD1DC',
		'#FFDAC1',
		'#FFF5BA',
		'#B5EAD7',
		'#C7CEEA',
		'#E0BBE4',
		'#AA4465',
		'#5F0A87',
		'#E63946',
		'#F77F00',
		'#FCBF49',
		'#2A9D8F',
		'#264653',
		'#6A0572',
		'#3A86FF',
	]

	/**
	 * La couleur attribuée d'office à une option, prise à son rang. Déterministe: le nuancier
	 * se dérive des options, et une dérivation peut rejouer sans redistribuer les couleurs.
	 */
	export function paletteColor(index: number) {
		return palette[index % palette.length]
	}
</script>

<datalist id="palette">
	{#each palette as color (color)}
		<option value={color}></option>
	{/each}
</datalist>
