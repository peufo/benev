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
}

export interface CreateMouseMoveOptions {
	dragEl: HTMLElement
	originMouseY: number
	limits: ILimits
	indexFrom: number
}

export interface CreatePlaceholderArgs {
	listEl: HTMLElement
	dragEl: HTMLElement
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
