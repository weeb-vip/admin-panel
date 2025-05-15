import api from "./api";
import {searchResults} from "./api/search";
import request, {GraphQLClient} from "graphql-request";
import {

  GetEpisodesFromTheTvdbQuery, GetSavedLinksQuery, LoginInput, QuerySearchTheTvdbArgs, RegisterInput, RegisterResult,
  SaveLinkMutation,
  SearchTheTvdbQuery, SigninResult, SyncLinkQuery, UpdateUserInput
} from "../gql/graphql";
import {
  getSavedLinksQuery,
  getTheTVDBEpisodes,
  mutateUpdateUserDetails,
  mutationCreateSession,
  mutationRefreshToken,
  queryAnime,
  queryGetEpisodesFromTheTvdb,
  querySearchTheTVDB,
  querySync,
  queryUserDetails,
  saveLink,
  searchTheTVDB
} from "./api/graphql/queries";

export const AuthenticatedClient = () => {
  const token = localStorage.getItem("authToken");
  // @ts-ignore
  return new GraphQLClient(global.config.graphql_host, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export const fetchSearchResults = (query: string) => ({
  queryKey: ["search"],
  queryFn: () => api.search.search(query),
  select: (data: searchResults) => data,
})


export const getSearchResults = (query: string) => ({
  queryKey: ["searchResults", query],
  // @ts-ignore
  queryFn: async () => request<SearchTheTvdbQuery>(global.config.graphql_host, querySearchTheTVDB, {
    input: {
      query: query
    }
  })
})

export const mutateSaveLink = (animeID: string, tvdbId: string, season: number, name: string) => ({
  queryKey: ["saveLink", animeID, tvdbId, season],
  // @ts-ignore
  queryFn: async () => AuthenticatedClient().request<SaveLinkMutation>(saveLink, {
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
    const data = await AuthenticatedClient().request<GetSavedLinksQuery>(getSavedLinksQuery)
    // return the data
    data.getSavedLinks?.reverse()
    return data
  },
})

export const querySyncLink = () => ({
  queryKey: ["syncLink"],
  // @ts-ignore
  queryFn: async (linkId: string) => AuthenticatedClient().request<SyncLinkQuery>(querySync, {
    linkId: linkId
  })
})

export const getAnimeById = (animeId: string) => {
  // @ts-ignore
  return request(global.config.graphql_host, queryAnime, {animeId})
}

export const searchTheTVDB = (args: QuerySearchTheTvdbArgs) => {
  console.log(args)
  // @ts-ignore
  return request(global.config.graphql_host, querySearchTheTVDB, args)
}

export const getEpisodesFromTheTvdb = (thetvdbId: string) => {
  console.log("DERP", thetvdbId)
  // @ts-ignore
  return request(global.config.graphql_host, queryGetEpisodesFromTheTvdb, {thetvdbId})
}


export const register = () => ({
  mutationFn: async (input: { input: RegisterInput }): Promise<RegisterResult> => {
    // @ts-ignore
    const response = await request(global.config.graphql_host, mutationRegister, input);
    return response.Register;
  }
})

export const login = () => ({
  mutationFn: async (input: { input: LoginInput }) => {
    // @ts-ignore
    const response = await request(global.config.graphql_host, mutationCreateSession, input);
    return response.CreateSession;
  }
})

export const getUser = () => ({
  queryKey: ["user"],
  queryFn: async (): Promise<User> => {
    const response = await AuthenticatedClient().request(queryUserDetails);
    return response.UserDetails;
  }
})

export const refreshTokenSimple = async (): Promise<SigninResult> => {
  // get token from local storage
  const authtoken = localStorage.getItem("authToken");
  // extract token from authtoken jwt
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const payload = JSON.parse(atob(authtoken.split('.')[1]));
  // extract refresh_token from payload
  const refreshToken = payload.refresh_token;
  console.log("Refreshing token...", refreshToken);

  const input = {token: refreshToken};
  const response = await AuthenticatedClient().request(mutationRefreshToken, input);
  return response.RefreshToken
}

export const updateUserDetails = async () => ({
  queryFn: async (user: UpdateUserInput) => {
    const response = await AuthenticatedClient().request(mutateUpdateUserDetails, {
      input: user
    });
    return response.UpdateUserDetails;
  }
})