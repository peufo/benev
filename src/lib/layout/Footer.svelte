<script lang="ts">
	import logo from '$lib/assets/logo.svg'
	interface Props {
		class?: string
		children?: import('svelte').Snippet
	}

	let { class: klass = '', children }: Props = $props()
</script>

<footer
	class="footer footer-center border-t border-hard p-6 bg-base-100 gap-5 overflow-hidden {klass}"
>
	{@render children?.()}

	<div class="flex gap-4 text-sm">
		<a href="/open-source" class="link link-hover">Open source</a>
		<a href="/contact" class="link link-hover">Contact</a>
		<a href="/terms" class="link link-hover">Conditions</a>
	</div>

	<div class="text-left">
		<a href="/" class="btn btn-sm btn-outline ml-auto border-soft">
			<img src={logo} alt="logo de benev.io" class="h-5 -translate-x-1" />
			<span>Benevio</span>
		</a>
		<span class="text-xs opacity-60">
			©2023-{new Date().getFullYear()} Dev Voisard - Switzerland
		</span>
	</div>
</footer>

<style>
	:global(:has(.footer-hidden) footer) {
		display: none;
	}
</style>
