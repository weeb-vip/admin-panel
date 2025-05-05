import {getAnimeById, getEpisodesFromTheTvdb, searchTheTVDB} from "./queries";
import {format, parse, parseISO} from "date-fns";

export const findSameEntity = async (animeId: string)=>
{
  const anime = await getAnimeById(animeId).then((res) => {
    // @ts-ignore
    return res.anime
  })
  console.log("Anime: ", anime.titleEn)
  const queryWithoutSeasonAndNumber = anime.titleEn.replace(/(season|s\d+|\d+)/gi, "").trim()
  console.log("Query: ", queryWithoutSeasonAndNumber)
  const tvdb = await searchTheTVDB({
    input: {
      query: queryWithoutSeasonAndNumber,
    }
  }).then((res) => {
console.log("RES:", res)
    // @ts-ignore
    return res.searchTheTVDB
  })
  if (!tvdb) {
    console.log("No results found", tvdb)
    return
  }

  for (const item of tvdb) {
    if (!item?.id) {
      console.log("No id found")
      continue
    }
    console.log("ID", item.id)
    const match = await getSeasonsAndStartDates(item.id).then((res) => {
      // @ts-ignore
      // find if a season start date matches with the airdate from anime
      for (const key in res) {

        if (!Object.prototype.hasOwnProperty.call(res, key)) {

          continue;
        }

        console.log("ANIME", anime)
        // get only year, month and day
        const seasonStart = format(res[key].start, 'yyyy-MM-dd')
        const animeStart = format(parseISO(anime.startDate), 'yyyy-MM-dd')

        // check if start matches anime start date
        const matches = seasonStart === animeStart
        if (matches) {

          return {item, season: key}
        }
      }

    })


    if (match) {

      return match
    }
  }

  return null

}

const getSeasonsAndStartDates = async (tvdbid: string) => {
console.log("THETVDBID", tvdbid)
  const episodes = await getEpisodesFromTheTvdb(tvdbid).then((res) => {
    // @ts-ignore
    return res.getEpisodesFromTheTVDB
  })

  if (!episodes) {

    return {}
  }

  // get season start times
  const seasons = episodes.reduce((acc, episode) => {
    const season = episode.seasonNumber.toString();
    const airDate = episode.airDate;

    if (season && airDate) {
      // convert airdate to a Date object
      const parsedDate = parse(airDate, 'yyyy-MM-dd', new Date());
      if (!acc[season]) {
        acc[season] = { start: parsedDate, end: parsedDate };
      } else {
        if (airDate < acc[season].start) acc[season].start = parsedDate;
        if (airDate > acc[season].end) acc[season].end = parsedDate;
      }
    }

    return acc;
  }, {} as Record<string, { start: Date; end: Date }>);


  return seasons
}