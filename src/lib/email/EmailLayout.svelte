<script lang="ts">
	import { domain } from '.'

	export let title = ''
	export let subtitle = ''
	export let showLogo = false

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
																src="{domain}/logo.png"
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
													<slot >__SLOT__</slot>
												</td>
											</tr>
										</tbody>
									</table>

									<slot name="signature">
										<hr style="border:none;border-top:1px solid #eaeaea;margin:26px 0;width:100%" />

										<table width="100%" cellpadding="0" cellspacing="0">
											<tbody>
												<tr>
													<td>
														<img
															src="{domain}/logo.png"
															alt="Logo de Benev.io"
															style="height: 50px"
														/>
													</td>
													<td style="vertical-align: top;">
														<p
															style="color:#666666;font-size:12px;line-height:24px; padding-top: 10px;"
														>
															Gestion des bénévoles par
															<a
																href={domain}
																style="color:#067df7; text-decoration:none"
																target="_blank"
															>
																benev.io
															</a><br />
															Définis tes préfèrences concernant les emails
															<a
																href="{domain}/me?section=profile"
																style="color:#067df7; text-decoration:none"
																target="_blank"
															>
																sur ton profil
															</a>
														</p>
													</td>
												</tr>
											</tbody>
										</table>
									</slot>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</td>
		</tr>
	</tbody>
</table>
