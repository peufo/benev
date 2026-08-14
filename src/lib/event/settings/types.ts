import type { RemoteFormFields } from '@sveltejs/kit'
import type z from 'zod'
import type { modelEventSettings, modelEventUpdate } from '$lib/models'

/**
 * Le socle commun aux deux formulaires qui décrivent un évènement: `createEvent` y ajoute le
 * palier, `updateEvent` l'adhésion et le thème. Les sections partagées entre la création et
 * `/admin/settings` ne connaissent que ce socle, et restent donc utilisables par les deux.
 */
export type EventFields = RemoteFormFields<z.input<typeof modelEventUpdate>>

/** Le socle élargi, pour les sections que seule `/admin/settings` rend. */
export type EventSettingsFields = RemoteFormFields<z.input<typeof modelEventSettings>>
