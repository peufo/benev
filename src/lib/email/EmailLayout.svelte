<script lang="ts">
	import { ORIGIN } from '$app/env/public'
	import type { Snippet } from 'svelte'

	interface Props {
		title?: string
		subtitle?: string
		showLogo?: boolean
		eventId?: string
		children?: import('svelte').Snippet
		signature?: import('svelte').Snippet
	}

	let {
		title = '',
		subtitle = '',
		showLogo = false,
		eventId = '',
		children,
		signature,
	}: Props = $props()

	let fontFamily =
		"font-family: -apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif"
</script>

<table
	width="100%"
	border={0}
	cellspacing="0"
	cellpadding="0"
	style="width:100%!important; {fontFamily};"
>
	<tbody>
		<tr>
			<td align="center">
				<table
					width="540"
					border={0}
					cellspacing="0"
					cellpadding="30"
					style="width: 600px; border:1px solid #eaeaea; border-radius:5px; margin:40px 0; padding: 5px;"
				>
					<tbody>
						<tr>
							<td align="center">
								<div style="text-align:left; width:465px">
									<table
										width="100%"
										border={0}
										cellspacing="0"
										cellpadding="0"
										style="width:100%!important"
									>
										<tbody>
											<tr>
												<td align="center">
													<div>
														{#if showLogo}
															<img
																src="{ORIGIN}/logo.svg"
																alt="Logo de benev.io"
																style="height: 100px;"
															/>
														{/if}

														<h1
															style="color: #000; font-size: 24px; font-weight: normal; margin-top: 30px 0; padding:0;"
														>
															{title}
														</h1>
														{#if subtitle}
															<h2 style="color: #222; font-weight: normal; margin-top: 1em;">
																{subtitle}
															</h2>
														{/if}
													</div>
												</td>
											</tr>
										</tbody>
									</table>
									<table width="100%" cellpadding="0" cellspacing="0">
										<tbody>
											<tr>
												<td
													style="font-size: 14px;padding-bottom:8px;padding-left:4px;padding-right:4px;padding-top:8px"
												>
													{#if children}{@render children()}{:else}__SLOT__{/if}
												</td>
											</tr>
										</tbody>
									</table>

									{#if signature}
										{@render signature()}
									{:else}
										<hr style="border:none;border-top:1px solid #eaeaea;margin:26px 0;width:100%" />
										{@render center(eventLink, 'font-size: 12px;')}
										{@render center(poweredBy)}
									{/if}
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</td>
		</tr>
	</tbody>
</table>

{#snippet poweredBy()}
	<a href={ORIGIN} rel="external" style="color:#067df7; text-decoration:none" target="_blank">
		<span style="font-size: 10px; color: #333;"> Propulsé par </span>
		<img src="{ORIGIN}/benevio.svg" alt="Logo de Benev.io" style="height: 20px; display: inline;" />
	</a>
{/snippet}

{#snippet eventLink()}
	{#if eventId}
		Définis tes préférences concernant les emails
		<a
			href="{ORIGIN}/{eventId}/me#email-settings"
			rel="external"
			style="color:#067df7; text-decoration:none"
			target="_blank"
		>
			sur ton profil
		</a>
	{/if}
{/snippet}

{#snippet center(content: Snippet, style?: string)}
	<table width="100%" cellpadding="0" cellspacing="0" {style}>
		<tbody>
			<tr>
				<td align="center" style="text-align: center;">
					{@render content()}
				</td>
			</tr>
		</tbody>
	</table>
{/snippet}
