import { Client } from "disharmony"
import Message from "./models/message";
import commands from "./commands"
import { loadCredentials } from "disharmony"

const { token, dbConnectionString } = loadCredentials()

const client = new Client("RSS Poster", commands, Message, dbConnectionString)
client.initialize(token)