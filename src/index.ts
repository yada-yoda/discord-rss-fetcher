import * as Cluster from "cluster"
import { DisharmonyClient, forkWorkerClient, Logger } from "disharmony"
import { loadConfig } from "disharmony"
import { resolve } from "path"
import commands from "./commands"
import ArticlePoster from "./core/article-poster"
import handleMessage from "./core/message-handler"
import Message from "./models/message"
import { getRssFetcher } from "./service/rss-reader/abstract/rss-fetcher"

const config = loadConfig()

if (Cluster.isMaster)
{
    const client = new DisharmonyClient(commands, config, Message)
    client.onMessage.sub(handleMessage)
    client.login(config!.token)
        .then(() => startFeedMonitor(client, !config.computedValues!.isLocalDb))
        .catch(async err =>
        {
            await Logger.consoleLogError("Error during initialisation", err)
            process.exit(1)
        })
}

async function startFeedMonitor(client: DisharmonyClient<Message>, useForkedProcess: boolean)
{
    const path = "./core/feed-monitor"
    if (useForkedProcess)
    {
        const worker = forkWorkerClient(resolve(__dirname, path), config.computedValues!.configPath)
        worker.on("exit", (code: number) => process.exit(code))
    }
    else
    {
        // tslint:disable-next-line: variable-name
        const FeedMonitor = (await import(path)).default
        new FeedMonitor(client, getRssFetcher(), new ArticlePoster()).beginMonitoring()
    }
}