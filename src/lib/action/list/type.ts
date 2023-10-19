export interface ListEditableOptions<Type = unknown> {
	onHover?: OnHoverHandler
	onMove?: OnMoveHandler
	/** Déclencher quand l'ordre change. newOrder est un tableau d'index */
	onReindex?: OnReindexHandler
	/** Déclencher quand l'ordre change. newOrder est les items fournit réordonné */
	onChange?: OnChangeHandler<Type>
	/** Fournir les items pour directement récupérer la liste à jour dans onChange */
	items?: Type[]
	onDelete?: (index: number, items?: Type[]) => void

	/** Only handle reorder from this elements */
	dragElementsSelector?: string
}

export interface CreateMouseMoveOptions {
	itemElement: HTMLElement
	originMouseY: number
	limits: ILimits
	indexFrom: number
}

export interface CreatePlaceholderArgs {
	listElement: HTMLElement
	itemElement: HTMLElement
	indexFrom: number
}

export interface ILimits {
	top: number
	bottom: number
	items: number[]
}

export type OnHoverHandler = (index: number) => void
export type OnMoveHandler = (indexFrom: number, indexTo: number) => void
export type OnReindexHandler = (newOrder: number[]) => void
export type OnChangeHandler<Type> = (newOrder: Type[]) => void
