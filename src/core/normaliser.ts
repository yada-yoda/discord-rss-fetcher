function forDiscord(url: string)
{
    return url
}

function forCache(url: string)
{
    return forDiscord(url).replace(/^((https?:\/\/)?(www.)?)/, "")
}

export default {
    forDiscord,
    forCache
}