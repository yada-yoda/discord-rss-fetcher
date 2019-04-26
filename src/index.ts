import { Client } from "disharmony"
import Message from "./models/message";
import commands from "./commands"

let client = new Client("RSS Poster", commands, Message)

client.initialize(require("fs").readFileSync("./token", "utf8"))