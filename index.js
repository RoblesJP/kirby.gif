import { registerCommands } from "./commands.js";
import "dotenv/config";
// import * as dotenv from "dotenv";
// dotenv.config();
import { REST } from "discord.js";
import { Client, GatewayIntentBits } from "discord.js";
import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import {
  getCommandByName,
  COMMAND_TYPES,
  getResource,
  listenToNewCommands,
} from "./data/supabase.js";

const rest = new REST({ version: "10" }).setToken(process.env["DISCORD_TOKEN"]);

try {
  console.log("Started refreshing application (/) commands.");
  registerCommands(rest);
  console.log("Successfully reloaded application (/) commands.");
  listenToNewCommands(() => {
    registerCommands(rest);
    console.log("New command registered!");
  });
  console.log("Bot listening to new (/) commands.");
} catch (error) {
  console.error(error);
}
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  let command = await getCommandByName(interaction.commandName);

  if (!command) return;

  if (command.type_id == COMMAND_TYPES.GIF) {
    await interaction.reply(command.resource_path);
  }

  if (command.type_id == COMMAND_TYPES.AUDIO) {
    const player = createAudioPlayer();
    const channel = interaction.member?.voice?.channel;
    if (channel) {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      }).subscribe(player);

      const resource = await getResource(command.resource_path);
      let audioResource = createAudioResource(resource.stream());
      player.play(audioResource);

      await interaction.reply("poyo! 🎵");
    } else {
      await interaction.reply("join a voice channel pls");
    }
  }
});

client.login(process.env["DISCORD_TOKEN"]);
