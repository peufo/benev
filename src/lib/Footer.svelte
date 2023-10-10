<script lang="ts">
	import logo from '$lib/assets/logo.svg'
	import { tip } from './action'
</script>

<footer class="footer footer-center p-6 bg-base-100 gap-5 mt-2 overflow-hidden">
	<slot />

	<div class="flex">
		<a href="/" class="btn btn-sm btn-square" use:tip={{ content: 'benev.ch' }}>
			<img src={logo} alt="logo de benev.ch" class="h-5" />
		</a>
		<a href="https://github.com/peufo" class="link link-hover"> Created by peufo </a>
	</div>
</footer>
