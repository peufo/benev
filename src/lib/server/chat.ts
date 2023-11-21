import axios from 'axios'

export const chatServer = 'http://localhost:3000'
const chatAdminUser = 'peuf'
const chatAdminPassword = 'wJ66kASk7HqiBs@'
axios.defaults.baseURL = chatServer + '/api/v1'

type LoginResult = { authToken: string; userId: string }
type AdminAuthHeaders = { 'X-Auth-Token': string; 'X-User.Id': string }
type LoginChatUser = {
	username: string
	password: string
}
export type CreateChatUser = LoginChatUser & {
	name: string
	email: string
}

let adminHeaders: AdminAuthHeaders | {} = {}
loginChatUser({ username: chatAdminUser, password: chatAdminPassword })
	.then((data) => {
		adminHeaders = { 'X-Auth-Token': data.authToken, 'X-User.Id': data.userId }
	})
	.catch(() => (adminHeaders = {}))

async function getChatUser(username: string): Promise<LoginResult> {
	const { data } = await axios('/users.info', {
		params: { username },
		headers: adminHeaders,
	})
	return data
}

export async function loginChatUser(user: LoginChatUser): Promise<LoginResult> {
	const { data } = await axios.post('/login', {
		data: { user: user.username, password: user.password },
	})
	return data
}

export async function createChatUser(user: CreateChatUser) {
	const newUser = await axios.post('users.create', { data: user, headers: adminHeaders })
	return newUser
}

export async function createOrLoginChatUser(user: CreateChatUser): Promise<LoginResult> {
	const loggedUser = await getChatUser(user.username)
		.catch(() => createChatUser(user))
		.then(() => loginChatUser(user))
	return loggedUser
}
