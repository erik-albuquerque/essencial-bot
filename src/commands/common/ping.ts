import type { Command } from '../../@types/command'
import type { Socket } from '../../@types/socket'

const pingCommand = (socket: Socket): Command => ({
	name: 'ping',
	description: 'Responde com Pong!',
	execute: async message => {
		const sender = message.key.remoteJid

		if (!sender) return

		await socket.sendMessage(sender, { text: '🏓 Pong!' })
	},
})

export { pingCommand }
