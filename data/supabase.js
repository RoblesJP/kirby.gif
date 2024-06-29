import { createClient } from "@supabase/supabase-js";
// import * as dotenv from "dotenv";
// dotenv.config();

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env["SUPABASE_URL"],
  process.env["SUPABASE_PUBLIC_KEY"]
);

export const COMMAND_TYPES = {
  GIF: 1,
  AUDIO: 2,
};

export async function getCommands() {
  let { data, error } = await supabase
    .from("commands")
    .select()
    .eq("enabled", true);

  if (error) console.error(error);

  return data;
}

export async function getCommandByName(name) {
  let { data, error } = await supabase
    .from("commands")
    .select()
    .eq("name", name)
    .limit(1)
    .single();

  if (error) console.error();

  return data;
}

export async function getResource(resource_path) {
  let { data, error } = await supabase.storage
    .from("audios")
    .download(resource_path);

  if (error) console.error(error);

  return data;
}

export async function listenToNewCommands(callback) {
  supabase
    .channel("room1")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "commands" },
      callback
    )
    .subscribe();
}
