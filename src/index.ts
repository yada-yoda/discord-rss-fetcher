import * as Cluster from "cluster"
import { Client, forkWorkerClient, Logger } from "disharmony"
import { loadConfig } from "disharmony"
import Config from "disharmony/dist/models/internal/config";
import { resolve } from "path";
import commands from "./commands"
import handleMessage from "./core/message-handler";
import Message from "./models/message";

let config: Config, isLocalDb: boolean, configPath: string

try
{
    ({ config, isLocalDb, configPath } = loadConfig())
}
catch (err)
{
    // Todo: fix process exiting before log completes
    Logger.consoleLogError("Error loading config", err)
    process.exit()
}

if (Cluster.isMaster)
{
    const client = new Client(commands, Message, config!)
    client.onMessage.sub(handleMessage)
    client.initialize(config!.token)
        .then(() => startFeedMonitor(client, !isLocalDb))
        .catch(err =>
        {
            Logger.consoleLogError("Error during initialisation", err)
            process.exit()
        })
}

async function startFeedMonitor(client: Client<Message>, useForkedProcess: boolean)
{
    const path = "./core/feed-monitor"
    if (useForkedProcess)
        forkWorkerClient(resolve(__dirname, path), configPath)
    else
    {
        const FeedMonitor = (await import(path)).default
        new FeedMonitor(client).beginMonitoring()
    }
}