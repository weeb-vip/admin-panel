import {getAnimeById, getEpisodesFromTheTvdb, searchTheTVDB} from "./queries";
import {format, parse, parseISO} from "date-fns";

// Extract just the yyyy-MM-dd portion from an ISO date string,
// avoiding timezone shifts from parsing into a Date object.
function extractDateString(isoDate: string): string {
  // Handle ISO strings like "2024-01-10T00:00:00+09:00" or "2024-01-10"
  const match = isoDate.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  // Fallback: parse and format in UTC-safe way
  return format(parseISO(isoDate), 'yyyy-MM-dd');
}

// Check if two date strings are within ±1 day of each other
function datesMatchWithTolerance(dateA: string, dateB: string): boolean {
  if (dateA === dateB) return true;
  const a = parse(dateA, 'yyyy-MM-dd', new Date(2000, 0, 1));
  const b = parse(dateB, 'yyyy-MM-dd', new Date(2000, 0, 1));
  const diffMs = Math.abs(a.getTime() - b.getTime());
  return diffMs <= 86400000; // 1 day in ms
}

export interface AutolinkCandidate {
  tvdbTitle: string;
  tvdbId: string;
  seasons: Record<string, string>; // season number -> start date (yyyy-MM-dd)
}

export interface AutolinkFailureInfo {
  matched: false;
  candidates: AutolinkCandidate[];
  animeStartDate: string;
}

export interface AutolinkSuccessInfo {
  matched: true;
  item: any;
  season: string;
  searchMethod: string;
  searchQuery: string;
  originalTitle: string;
}

export type AutolinkResult = AutolinkSuccessInfo | AutolinkFailureInfo;

export const findSameEntity = async (animeId: string): Promise<AutolinkResult> => {
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

  const candidates: AutolinkCandidate[] = [];
  const seenTvdbIds = new Set<string>();

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
      const res = await getSeasonsAndStartDates(item.id);

      // Collect candidate info for failure reporting
      if (!seenTvdbIds.has(item.id)) {
        seenTvdbIds.add(item.id);
        const seasonDates: Record<string, string> = {};
        for (const key in res) {
          if (Object.prototype.hasOwnProperty.call(res, key)) {
            seasonDates[key] = format(res[key].start, 'yyyy-MM-dd');
          }
        }
        if (Object.keys(seasonDates).length > 0) {
          candidates.push({
            tvdbTitle: item.title || item.id,
            tvdbId: item.id,
            seasons: seasonDates,
          });
        }
      }

      // find if a season start date matches with the airdate from anime
      for (const key in res) {
        if (!Object.prototype.hasOwnProperty.call(res, key)) {
          continue;
        }

        console.log("ANIME", anime)
        // get only year, month and day
        const seasonStart = format(res[key].start, 'yyyy-MM-dd')
        const animeStart = extractDateString(anime.startDate)

        // check if start matches anime start date (±1 day tolerance for timezone differences)
        const matches = datesMatchWithTolerance(seasonStart, animeStart)
        if (matches) {
          // Add search method information to the result
          console.log(`✅ Match found using ${variant.type}: "${variant.query}"`);
          return {
            matched: true as const,
            item,
            season: key,
            searchMethod: variant.type,
            searchQuery: variant.query,
            originalTitle: variant.title
          }
        }
      }
    }
  }

  // No matches found with any search variant
  console.log("❌ No matches found with any search variant");
  const animeStart = anime.startDate ? extractDateString(anime.startDate) : 'unknown';
  return { matched: false as const, candidates, animeStartDate: animeStart }

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