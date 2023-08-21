<script lang="ts">
	export let data
</script>

<div class="flex flex-col gap-4">
	<h1>HELLO ROOT</h1>

	<a href="/root/mails" class="link link-hover"> Model de mail </a>

	<div>
		<p>
			timezone client: <b>{new Date().getTimezoneOffset()}</b>
		</p>
		<p>
			timezone server: <b>{data.timezoneOffsetServer}</b>
		</p>
	</div>
</div>
