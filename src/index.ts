import { Client, forkWorkerClient } from "disharmony"
import Message from "./models/message";
import commands from "./commands"
import { loadCredentials } from "disharmony"
import * as Cluster from "cluster"
import { resolve } from "path";

const { token, dbConnectionString } = loadCredentials()

if (Cluster.isMaster)
{
    const client = new Client("RSS Poster", commands, Message, dbConnectionString)
    client.initialize(token)

forkWorkerClient(resolve(__dirname, "./core/feed-monitor"), token, "nedb://nedb-data") //todo don't hard code this