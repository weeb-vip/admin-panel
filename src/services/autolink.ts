import {getAnimeById, getEpisodesFromTheTvdb, searchTheTVDB} from "./queries";
import {format, parse, parseISO} from "date-fns";

export const findSameEntity = async (animeId: string) => {
  const anime = await getAnimeById(animeId).then((res) => {
    // @ts-ignore
    return res.anime
  })

  console.log("Anime data:", {
    titleEn: anime.titleEn,
    titleJp: anime.titleJp,
    titleRomaji: anime.titleRomaji,
    titleKanji: anime.titleKanji
  });

  // Generate search variants in order of preference
  const searchVariants = [];

  // 1. English title (original and cleaned)
  if (anime.titleEn) {
    searchVariants.push({
      title: anime.titleEn,
      type: 'English (original)',
      query: anime.titleEn
    });
    const cleanedEn = anime.titleEn.replace(/(season|s\d+|\d+)/gi, "").trim();
    if (cleanedEn !== anime.titleEn) {
      searchVariants.push({
        title: anime.titleEn,
        type: 'English (cleaned)',
        query: cleanedEn
      });
    }
  }

  // 2. Romaji title (often better for international titles)
  if (anime.titleRomaji && anime.titleRomaji !== anime.titleEn) {
    searchVariants.push({
      title: anime.titleRomaji,
      type: 'Romaji (original)',
      query: anime.titleRomaji
    });
    const cleanedRomaji = anime.titleRomaji.replace(/(season|s\d+|\d+)/gi, "").trim();
    if (cleanedRomaji !== anime.titleRomaji) {
      searchVariants.push({
        title: anime.titleRomaji,
        type: 'Romaji (cleaned)',
        query: cleanedRomaji
      });
    }
  }

  // 3. Japanese title as last resort
  if (anime.titleJp && anime.titleJp !== anime.titleEn && anime.titleJp !== anime.titleRomaji) {
    searchVariants.push({
      title: anime.titleJp,
      type: 'Japanese',
      query: anime.titleJp
    });
  }

  console.log("Search variants to try:", searchVariants);

  // Try each search variant until we find a match
  for (const variant of searchVariants) {
    console.log(`Trying ${variant.type}: "${variant.query}"`);

    const tvdb = await searchTheTVDB({
      input: {
        query: variant.query,
      }
    }).then((res) => {
      console.log(`Results for ${variant.type}:`, res);
      // @ts-ignore
      return res.searchTheTVDB
    });

    if (!tvdb || tvdb.length === 0) {
      console.log(`No results found for ${variant.type}`);
      continue;
    }

    // Check each TVDB result for date matches
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
        // Add search method information to the result
        console.log(`✅ Match found using ${variant.type}: "${variant.query}"`);
        return {
          ...match,
          searchMethod: variant.type,
          searchQuery: variant.query,
          originalTitle: variant.title
        }
      }
    }
  }

  // No matches found with any search variant
  console.log("❌ No matches found with any search variant");
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
  const seasons = episodes.reduce((acc: Record<string, { start: Date; end: Date }>, episode: { seasonNumber: number; airDate?: string | null }) => {
    const season = episode.seasonNumber.toString();
    const airDate = episode.airDate;

    if (season && airDate) {
      // convert airdate to a Date object
      const parsedDate = parse(airDate, 'yyyy-MM-dd', new Date());
      if (!acc[season]) {
        acc[season] = { start: parsedDate, end: parsedDate };
      } else {
        if (parsedDate < acc[season].start) acc[season].start = parsedDate;
        if (parsedDate > acc[season].end) acc[season].end = parsedDate;
      }
    }

    return acc;
  }, {});


  return seasons
}