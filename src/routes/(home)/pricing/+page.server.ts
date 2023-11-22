import axios from 'axios'
import { EXCHANGE_RATE_KEY } from '$env/static/private'

// see https://app.exchangerate-api.com
const API_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_KEY}/latest/CHF`

type ApiResponse = {
	result: 'success' | 'error'
	base_code: string
	conversion_rates: Record<string, number>
}
type Cache = {
	updatedAt: Date
	rates: Record<string, number>
}

let cache: Cache | null = null
const DAY = 1000 * 60 * 60 * 24

export const load = async () => {
	try {
		const cacheIsExpired = !cache || cache.updatedAt.getTime() + DAY < new Date().getTime()
		if (cacheIsExpired) {
			const { data } = await axios<ApiResponse>(API_URL)
			if (data.result !== 'success') throw `Exchange rates can't be fetched`
			cache = {
				updatedAt: new Date(),
				rates: data.conversion_rates,
			}
		}
		if (!cache) throw `Exchange rates can't be fetched`
		return {
			rates: cache.rates,
		}
	} catch (err) {
		console.warn(err)
		return {}
	}
}
