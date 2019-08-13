import { Expect, Test, TestFixture } from "alsatian"
import Normalise from "./normaliser"

@TestFixture("Normaliser")
export class NormaliserTestFixture
{
    @Test()
    public url_normalised_for_cache_has_http_and_www_stripped()
    {
        // ARRANGE
        const httpsInput = "https://benji7425.io/",
            httpInput = "http://benji7425.io/",
            wwwInput = "www.benji7425.io/",
            httpsWWWInput = "https://www.benji7425.io/",
            httpWWWInput = "http://www.benji7425.io/"

        const expectedOutput = "benji7425.io/"

        // ACT
        const httpsOutput = Normalise.forCache(httpsInput),
            httpOutput = Normalise.forCache(httpInput),
            wwwOutput = Normalise.forCache(wwwInput),
            httpsWWWOnput = Normalise.forCache(httpsWWWInput),
            httpWWWOnput = Normalise.forCache(httpWWWInput)

        // ASSERT
        Expect(httpsOutput).toBe(expectedOutput)
        Expect(httpOutput).toBe(expectedOutput)
        Expect(wwwOutput).toBe(expectedOutput)
        Expect(httpsWWWOnput).toBe(expectedOutput)
        Expect(httpWWWOnput).toBe(expectedOutput)
    }

    @Test()
    public youtube_com_url_normalised_for_discord_is_converted_to_youtu_be()
    {
        // ARRANGE
        const input = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

        const expectedOutput = "https://youtu.be/dQw4w9WgXcQ"

        // ACT
        const output = Normalise.forDiscord(input)

        // ASSERT
        Expect(output).toBe(expectedOutput)
    }
}