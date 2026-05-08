<script lang="ts">
	import { onMount } from 'svelte'

	let svgEl: SVGSVGElement

	onMount(() => {
		if (!svgEl) return
		const shapes = svgEl.querySelectorAll<SVGGeometryElement>('path, ellipse')
		shapes.forEach((shape, i) => {
			try {
				const length = shape.getTotalLength()
				shape.style.strokeDasharray = `${length}`
				shape.style.strokeDashoffset = `${length}`
				shape.getBoundingClientRect() // force reflow

				// Animation du stroke (dessin)
				setTimeout(() => {
					shape.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
					shape.style.strokeDashoffset = '0'
				}, 200 + i * 250)


			} catch {
				// fallback
			}
		})
	})
</script>

<div class="relative w-full max-w-[280px] mx-auto p-6">
	<svg
		bind:this={svgEl}
		viewBox="0 0 218.006 222"
		class="w-full h-auto overflow-visible"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M85.245,222.000L34.745,222.000C34.745,222.000,31.245,222.000,31.245,218.500C31.245,215.000,34.745,215.000,34.745,215.000L50.245,215.000C50.245,215.000,-11.000,172.480,1.745,129.000C17.395,75.609,69.869,78.954,83.745,84.000C105.745,92.000,122.000,125.500,122.000,147.000C122.000,178.000,100.000,178.000,97.000,147.000C95.215,128.559,104.977,114.523,110.500,109.000C115.000,104.500,119.500,101.500,122.500,104.500C126.324,108.324,123.500,115.000,117.500,119.500C113.726,122.330,103.500,134.500,105.000,147.000C106.500,159.500,115.000,157.500,116.000,146.000C116.709,137.841,113.426,131.312,111.000,127.000C110.007,125.234,102.745,110.000,81.745,102.000C57.864,92.902,25.745,109.000,17.745,133.000C3.467,175.835,58.245,215.000,58.245,215.000L85.245,215.000C85.245,215.000,88.745,215.000,88.745,218.500C88.745,222.000,85.245,222.000,85.245,222.000Z"
			fill="none"
			stroke="#0d3b66"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M119.745,99.577C119.745,99.577,123.293,99.041,126.758,103.074C129.764,106.572,127.760,112.069,127.760,112.069C127.760,112.069,148.719,85.813,171.745,88.000C192.785,89.999,209.782,105.968,208.745,135.000C206.745,191.000,158.847,215.005,158.847,215.005L138.745,215.004C138.745,215.004,135.245,215.000,135.245,218.500C135.245,222.000,138.745,222.000,138.745,222.000L189.745,222.000C189.745,222.000,193.245,222.000,193.245,218.500C193.245,215.000,189.745,215.000,189.745,215.000L166.745,215.000C166.745,215.000,209.745,191.000,216.745,146.000C222.909,106.376,206.241,66.549,171.745,64.000C144.694,62.001,119.745,99.577,119.745,99.577Z"
			fill="none"
			stroke="#c7b198"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<ellipse
			rx="21"
			ry="25.5"
			cx="160.6"
			cy="27.8"
			transform="rotate(-6.75 160.6 27.8)"
			fill="none"
			stroke="#c7b198"
			stroke-width="2.5"
			stroke-linecap="round"
		/>
		<ellipse
			rx="21"
			ry="25.5"
			cx="63.1"
			cy="43.8"
			transform="rotate(-6 63.1 43.8)"
			fill="none"
			stroke="#0d3b66"
			stroke-width="2.5"
			stroke-linecap="round"
		/>
	</svg>
</div>
