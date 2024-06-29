import { getCommands } from "./data/supabase.js";
import { Routes } from "discord.js";

export async function registerCommands(restClient) {
  let commands = await getCommands();

  let ALL_COMMANDS = commands.map((command) => ({
    name: command.name,
    description: command.description,
    type: 1,
  }));

  if (!restClient) restClient = arguments[1];
  await restClient.put(Routes.applicationCommands(process.env["APP_ID"]), {
    body: ALL_COMMANDS,
  });
}
