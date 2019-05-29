import * as Cluster from "cluster"
import { Client, forkWorkerClient, Logger } from "disharmony"
import { loadConfig } from "disharmony"
import { resolve } from "path";
import commands from "./commands"
import handleMessage from "./core/message-handler";
import Message from "./models/message";

const { config, isLocalDb, configPath } = loadConfig()

if (Cluster.isMaster)
{
    const client = new Client(commands, Message, config!)
    client.onMessage.sub(handleMessage)
    client.initialize(config!.token)
        .then(() => startFeedMonitor(client, !isLocalDb))
        .catch(async err =>
        {
            await Logger.consoleLogError("Error during initialisation", err)
            process.exit(1)
        })
}

async function startFeedMonitor(client: Client<Message>, useForkedProcess: boolean)
{
    const path = "./core/feed-monitor"
    if (useForkedProcess)
        forkWorkerClient(resolve(__dirname, path), configPath)
    else
    {
        // tslint:disable-next-line: variable-name
        const FeedMonitor = (await import(path)).default
        new FeedMonitor(client).beginMonitoring()
    }
}