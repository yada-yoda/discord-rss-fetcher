import { Client } from "disharmony"
import Message from "./models/message";

let client = new Client("RSS Poster", [], Message)

client.initialize(require("fs").readFileSync("./token", "utf8"))