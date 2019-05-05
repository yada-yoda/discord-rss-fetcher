import { Client, forkWorkerClient } from "disharmony"
import Message from "./models/message";
import commands from "./commands"
import { loadCredentials } from "disharmony"
import * as Cluster from "cluster"
import { resolve } from "path";

const { token, dbConnectionString, isLocalDb } = loadCredentials()

if (Cluster.isMaster)
{
    const client = new Client("RSS Poster", commands, Message, dbConnectionString)
    client.initialize(token)
        .then(() => startFeedMonitor(client, !isLocalDb))
}

async function startFeedMonitor(client: Client<Message>, useForkedProcess: boolean)
{
    const path = "./core/feed-monitor"
    if (useForkedProcess)
        forkWorkerClient(resolve(__dirname, path), token, dbConnectionString)
    else
    {
        const FeedMonitor = (await import(path)).default
        new FeedMonitor(client).beginMonitoring()
    }
}