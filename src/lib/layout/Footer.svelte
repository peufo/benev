<script lang="ts">
	import logo from '$lib/assets/logo.svg'
	import { tip } from 'fuma'
	let klass = ''
	export { klass as class }
</script>

<footer class="footer footer-center border-t p-6 bg-base-100 gap-5 mt-2 overflow-hidden {klass}">
	<slot />

	<div class="flex">
		<a href="/" class="btn btn-sm btn-square" use:tip={{ content: 'benev.io' }}>
			<img src={logo} alt="logo de benev.io" class="h-5" />
		</a>
		<a href="https://github.com/peufo" class="link link-hover"> Created by peufo</a>
	</div>
	<p class="opacity-80">©2023-2025 Dev Voisard - Switzerland</p>
</footer>
