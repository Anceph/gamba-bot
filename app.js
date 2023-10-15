import { Client, Partials, GatewayIntentBits, Collection } from "discord.js"
import { readdirSync } from "fs"
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'
import mongoose from 'mongoose'
import * as database from './src/utils/db/methods.js'
import 'dotenv/config'

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User, Partials.ThreadMember] });

client.commands = new Collection()
client.slashcommands = new Collection()
client.commandaliases = new Collection()
client.database = database

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason);
    // Additional error handling or logging can be done here
});

await mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_IP}/?retryWrites=true&w=majority`)
    .then(() => {
        console.log('connection established to the database')
    })

const commands = []
readdirSync('./src/commands/normal').forEach(async file => {
    const command = await import(`./src/commands/normal/${file}`).then(c => c.default)
    if (command) {
        client.commands.set(command.name, command)
        commands.push(command.name, command);
        if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach(alias => {
                client.commandaliases.set(alias, command.name)
            })
        }
    }
})

readdirSync('./src/events').forEach(async file => {
    const event = await import(`./src/events/${file}`).then(c => c.default)
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
})

const slashcommands = [];
readdirSync('./src/commands/slash').forEach(async file => {
    const command = await import(`./src/commands/slash/${file}`).then(c => c.default)
    slashcommands.push(command.data.toJSON());
    client.slashcommands.set(command.data.name, command);
})

client.on("ready", async () => {
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: slashcommands },
        );
    } catch (err) {
        console.error(err);
    }
    console.log(`${client.user.username} ready`);
})

client.login(process.env.BOT_TOKEN)