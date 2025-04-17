import type { proto } from 'baileys'

export type Command = {
	name: string
	description: string
	execute: (message: proto.IWebMessageInfo, args: string[]) => Promise<void>
}
