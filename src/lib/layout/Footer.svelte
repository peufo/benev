<script lang="ts">
	import logo from '$lib/assets/logo.svg'
	import { tip } from 'fuma'
	let klass = ''
	export { klass as class }
</script>

<footer class="footer footer-center border-t p-6 bg-base-100 gap-5 mt-2 overflow-hidden {klass}">
	<slot />

	<div class="flex gap-4 text-sm opacity-70">
		<a href="/open-source" class="link link-hover">Open source</a>
		<a href="/contact" class="link link-hover">Contact</a>
		<a href="/terms" class="link link-hover">Conditions</a>
	</div>

	<div class="flex">
		<a href="/" class="btn btn-sm btn-square" use:tip={{ content: 'benev.io' }}>
			<img src={logo} alt="logo de benev.io" class="h-5" />
		</a>
		<a href="https://github.com/peufo" class="link link-hover">Created by peufo</a>
	</div>
	<p class="opacity-80">©2023-{new Date().getFullYear()} Dev Voisard - Switzerland</p>
</footer>
