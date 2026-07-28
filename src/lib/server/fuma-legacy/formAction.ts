import type { z } from 'zod'
import type { RequestEvent } from '@sveltejs/kit'
import { parseFormData } from './parseFormData.js'
import { tryOrFail } from './try.js'

export function formAction<
	E extends RequestEvent,
	Shape extends z.ZodRawShape = z.ZodRawShape,
	ReturnType extends unknown = unknown,
>(
	shapes: Shape | Shape[],
	func: (
		arg: E & {
			event: E
			// zod 4: `baseObjectOutputType` a disparu, l'inférence passe par `ZodObject`.
			data: z.output<z.ZodObject<Shape>>
			formData: FormData
		}
	) => Promise<ReturnType>,
	options: {
		validation?: (
			value: z.output<z.ZodObject<Shape>>,
			ctx: z.RefinementCtx<z.output<z.ZodObject<Shape>>>
		) => void
		redirectTo?: string | URL | ((res: ReturnType) => string | URL | undefined)
	} = {}
) {
	return (event: E) =>
		tryOrFail(async () => {
			const { data, formData } = await parseFormData(event.request, shapes, options.validation)
			return func({ ...event, event, data, formData })
		}, options.redirectTo)
}
