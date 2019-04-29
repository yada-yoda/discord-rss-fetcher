import { Client, Logger, ClusterHelper } from "disharmony"
import Message from "./models/message";
import commands from "./commands"
import { loadCredentials } from "disharmony"
import * as Cluster from "cluster"
import FeedMonitor from "./core/feed-monitor";

const { token, dbConnectionString } = loadCredentials()

if (Cluster.isMaster)
{
    const client = new Client("RSS Poster", commands, Message, dbConnectionString)
    client.initialize(token)

    const rssMonitorWorker = Cluster.fork()
    Logger.debugLog(`Spawned worker process ${rssMonitorWorker.process.pid} to monitor rss feeds`)
    ClusterHelper.addKillAndExitHooks(rssMonitorWorker)
}
else
{
    launchFeedMonitor()
}

async function launchFeedMonitor()
{
    const feedMonitor = new FeedMonitor(token, "nedb://nedb-data") //todo don't hard code this
    await feedMonitor.connect()
    feedMonitor.beginMonitoring()
}