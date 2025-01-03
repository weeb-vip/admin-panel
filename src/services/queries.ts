import api from "./api";
import {searchResults} from "./api/search";
import request from "graphql-request";
import {

  GetEpisodesFromTheTvdbQuery, GetSavedLinksQuery,
  SaveLinkMutation,
  SearchTheTvdbQuery, SyncLinkQuery
} from "../gql/graphql";
import {getConfig} from "../config";
import configApi from "./api/config";
import {getSavedLinksQuery, getTheTVDBEpisodes, querySync, saveLink, searchTheTVDB} from "./api/graphql/queries";

export const fetchSearchResults = (query: string) => ({
  queryKey: ["search"],
  queryFn: () => api.search.search(query),
  select: (data: searchResults) => data,
})


export const getSearchResults = (query: string) => ({
  queryKey: ["searchResults", query],
  // @ts-ignore
  queryFn: async () => request<SearchTheTvdbQuery>(global.config.graphql_host, searchTheTVDB, {
    input: {
      query: query
    }
  })
})

export const mutateSaveLink = (animeID: string, tvdbId: string, season: number, name: string) => ({
  queryKey: ["saveLink", animeID, tvdbId, season],
  // @ts-ignore
  queryFn: async () => request<SaveLinkMutation>(global.config.graphql_host, saveLink, {
    input: {
      animeID: animeID,
      thetvdbID: tvdbId,
      season: season,
      name: name,
    }
  })
})

export const fetchTheTVDBEpisodes = (thetvdbID: string) => ({
  queryKey: ["thetvdbEpisodes", thetvdbID],
  // @ts-ignore
  queryFn: async () => request<GetEpisodesFromTheTvdbQuery>(global.config.graphql_host, getTheTVDBEpisodes, {
    thetvdbID: thetvdbID
  })
})

export const getSavedLinks = () => ({
  queryKey: ["savedLinks"],
  queryFn: async () => {
    const data = await request<GetSavedLinksQuery>(global.config.graphql_host, getSavedLinksQuery)
    // return the data
    data.getSavedLinks?.reverse()
    return data
  },
})

export const querySyncLink = () => ({
  queryKey: ["syncLink"],
  // @ts-ignore
  queryFn: async (linkId: string) => request<SyncLinkQuery>(global.config.graphql_host, querySync, {
    linkId: linkId
  })
})