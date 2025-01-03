import {graphql} from "../../../gql";

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