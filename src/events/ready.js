import { ActivityType } from "discord.js"

export default {
	name: 'ready',
	once: true,
	async execute(client) {
		client.user.setActivity({ name: 'you GAMBA', type: ActivityType.Watching })
	}
};
