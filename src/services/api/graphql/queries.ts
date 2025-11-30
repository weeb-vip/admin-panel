import {graphql} from "../../../gql";
import {gql} from "graphql-request";

export const searchTheTVDB = graphql(/* GraphQL */`
    query searchTheTVDB($input: TheTVDBSearchInput!) {
      searchTheTVDB(input: $input) {
        id
        title
        year
        image
        studios
        genres
        translations {
          key
          value
        }
      }
    }
`)

export const saveLink = graphql(/* GraphQL */`
    mutation saveLink($input: SaveLinkInput!) {
      saveLink(input: $input) {
        id,
        animeID
        thetvdbID
        season
      }
    }
`)

export const getTheTVDBEpisodes = graphql(/* GraphQL */`
  query getEpisodesFromTheTVDB($thetvdbID: String!) {
    getEpisodesFromTheTVDB(thetvdbID: $thetvdbID) {
      title
      seasonNumber
      episodeNumber
      image
      
      airDate
    }
  }
`)

export const getSavedLinksQuery = graphql(/* GraphQL */`
  query getSavedLinks {
    getSavedLinks {
      id
      animeID
      thetvdbID
      name
      season
    }
  }
`)

export const querySync = graphql(/* GraphQL */`
  query syncLink($linkId: String!) {
    syncLink(linkID: $linkId)
  }
`)

export const querySyncIDs = graphql(/* GraphQL */`
  query syncIDs {
    syncIDs
  }
`)

export const queryAnime = gql`
    query Anime($animeId: ID!) {
        anime(id: $animeId) {
            id
            anidbid
            titleEn
            titleJp
            titleRomaji
            titleKanji
            titleSynonyms
            description
            imageUrl
            tags
            studios
            animeStatus
            episodeCount
            duration
            rating
            startDate
            endDate
            broadcast
            source
            licensors
            ranking
            createdAt
            updatedAt
            episodes {
                id
                episodeNumber
                titleEn
                titleJp
                synopsis
                airDate
                createdAt
                updatedAt
            }
        }
    }`


export const querySearchTheTVDB = gql/* GraphQL */`
    query SearchTheTVDB2($input: TheTVDBSearchInput) {
        searchTheTVDB(input: $input) {
            id
            title
            link
            image
            year
            translations {
                key
                value
            }
            studios
            genres
        }
    }
`

export const queryGetEpisodesFromTheTvdb = gql/* GraphQL */`
    query GetEpisodesFromTheTVDB2($thetvdbId: String!) {
        getEpisodesFromTheTVDB(thetvdbID: $thetvdbId) {
            id
            title
            episodeNumber
            seasonNumber
            link
            image
            description
            airDate
        }
    }`


export const mutationRefreshToken = graphql(`
    mutation RefreshToken($token: String!) {
        RefreshToken(token: $token) {
            id
            Credentials {
                refresh_token
                token
            }
        }
    }
`)

export const mutationRegister = graphql(
    `
        mutation Register($input: RegisterInput!) {
            Register(input: $input) {
                id
            }
        }
  `
)

export const mutationCreateSession = graphql(
    `
        mutation CreateSession($input: LoginInput!) {
            CreateSession(input: $input) {
                id
                Credentials {
                    refresh_token
                    token
                }
            }
        }
  `
)

export const queryUserDetails = graphql(`
    query getUserDetails {
        UserDetails {
            id
            firstname
            lastname
            username
            language
            email
            active_sessions {
                id
                ip_address
                token
                user_agent
                user_id
            }
        }
    }`
)

export const mutateUpdateUserDetails = graphql(`
    mutation UpdateUserDetails($input: UpdateUserInput!) {
        UpdateUserDetails(input: $input) {
            id
            firstname
            lastname
            username
            language
            email
        }
    }
`)

export const queryAnimeBySeasons = graphql(`
    query AnimeBySeasons($season: Season!, $limit: Int) {
        animeBySeasons(season: $season, limit: $limit) {
            id
            titleEn
            titleJp
            titleRomaji
            startDate
            endDate
            imageUrl
            episodeCount
            animeStatus
            description
            studios
            tags
        }
    }
`)
