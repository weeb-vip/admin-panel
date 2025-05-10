/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n    query searchTheTVDB($input: TheTVDBSearchInput!) {\n      searchTheTVDB(input: $input) {\n        id\n        title\n        year\n        image\n        studios\n        genres\n        translations {\n          key\n          value\n        }\n      }\n    }\n": types.SearchTheTvdbDocument,
    "\n    mutation saveLink($input: SaveLinkInput!) {\n      saveLink(input: $input) {\n        id,\n        animeID\n        thetvdbID\n        season\n      }\n    }\n": types.SaveLinkDocument,
    "\n  query getEpisodesFromTheTVDB($thetvdbID: String!) {\n    getEpisodesFromTheTVDB(thetvdbID: $thetvdbID) {\n      title\n      seasonNumber\n      episodeNumber\n      image\n      \n      airDate\n    }\n  }\n": types.GetEpisodesFromTheTvdbDocument,
    "\n  query getSavedLinks {\n    getSavedLinks {\n      id\n      animeID\n      thetvdbID\n      name\n      season\n    }\n  }\n": types.GetSavedLinksDocument,
    "\n  query syncLink($linkId: String!) {\n    syncLink(linkID: $linkId)\n  }\n": types.SyncLinkDocument,
    "\n    query Anime($animeId: ID!) {\n        anime(id: $animeId) {\n            id\n            anidbid\n            titleEn\n            titleJp\n            titleRomaji\n            titleKanji\n            titleSynonyms\n            description\n            imageUrl\n            tags\n            studios\n            animeStatus\n            episodeCount\n            duration\n            rating\n            startDate\n            endDate\n            broadcast\n            source\n            licensors\n            ranking\n            createdAt\n            updatedAt\n        }\n    }": types.AnimeDocument,
    "\n    query SearchTheTVDB2($input: TheTVDBSearchInput) {\n        searchTheTVDB(input: $input) {\n            id\n            title\n            link\n            image\n            year\n            translations {\n                key\n                value\n            }\n            studios\n            genres\n        }\n    }\n": types.SearchTheTvdb2Document,
    "\n    query GetEpisodesFromTheTVDB2($thetvdbId: String!) {\n        getEpisodesFromTheTVDB(thetvdbID: $thetvdbId) {\n            id\n            title\n            episodeNumber\n            seasonNumber\n            link\n            image\n            description\n            airDate\n        }\n    }": types.GetEpisodesFromTheTvdb2Document,
    "\n    mutation RefreshToken($token: String!) {\n        RefreshToken(token: $token) {\n            id\n            Credentials {\n                refresh_token\n                token\n            }\n        }\n    }\n": types.RefreshTokenDocument,
    "\n        mutation Register($input: RegisterInput!) {\n            Register(input: $input) {\n                id\n            }\n        }\n  ": types.RegisterDocument,
    "\n        mutation CreateSession($input: LoginInput!) {\n            CreateSession(input: $input) {\n                id\n                Credentials {\n                    refresh_token\n                    token\n                }\n            }\n        }\n  ": types.CreateSessionDocument,
    "\n    query getUserDetails {\n        UserDetails {\n            id\n            firstname\n            lastname\n            username\n            language\n            email\n            active_sessions {\n                id\n                ip_address\n                token\n                user_agent\n                user_id\n            }\n        }\n    }": types.GetUserDetailsDocument,
    "\n    mutation UpdateUserDetails($input: UpdateUserInput!) {\n        UpdateUserDetails(input: $input) {\n            id\n            firstname\n            lastname\n            username\n            language\n            email\n        }\n    }\n": types.UpdateUserDetailsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query searchTheTVDB($input: TheTVDBSearchInput!) {\n      searchTheTVDB(input: $input) {\n        id\n        title\n        year\n        image\n        studios\n        genres\n        translations {\n          key\n          value\n        }\n      }\n    }\n"): (typeof documents)["\n    query searchTheTVDB($input: TheTVDBSearchInput!) {\n      searchTheTVDB(input: $input) {\n        id\n        title\n        year\n        image\n        studios\n        genres\n        translations {\n          key\n          value\n        }\n      }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation saveLink($input: SaveLinkInput!) {\n      saveLink(input: $input) {\n        id,\n        animeID\n        thetvdbID\n        season\n      }\n    }\n"): (typeof documents)["\n    mutation saveLink($input: SaveLinkInput!) {\n      saveLink(input: $input) {\n        id,\n        animeID\n        thetvdbID\n        season\n      }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getEpisodesFromTheTVDB($thetvdbID: String!) {\n    getEpisodesFromTheTVDB(thetvdbID: $thetvdbID) {\n      title\n      seasonNumber\n      episodeNumber\n      image\n      \n      airDate\n    }\n  }\n"): (typeof documents)["\n  query getEpisodesFromTheTVDB($thetvdbID: String!) {\n    getEpisodesFromTheTVDB(thetvdbID: $thetvdbID) {\n      title\n      seasonNumber\n      episodeNumber\n      image\n      \n      airDate\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getSavedLinks {\n    getSavedLinks {\n      id\n      animeID\n      thetvdbID\n      name\n      season\n    }\n  }\n"): (typeof documents)["\n  query getSavedLinks {\n    getSavedLinks {\n      id\n      animeID\n      thetvdbID\n      name\n      season\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query syncLink($linkId: String!) {\n    syncLink(linkID: $linkId)\n  }\n"): (typeof documents)["\n  query syncLink($linkId: String!) {\n    syncLink(linkID: $linkId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Anime($animeId: ID!) {\n        anime(id: $animeId) {\n            id\n            anidbid\n            titleEn\n            titleJp\n            titleRomaji\n            titleKanji\n            titleSynonyms\n            description\n            imageUrl\n            tags\n            studios\n            animeStatus\n            episodeCount\n            duration\n            rating\n            startDate\n            endDate\n            broadcast\n            source\n            licensors\n            ranking\n            createdAt\n            updatedAt\n        }\n    }"): (typeof documents)["\n    query Anime($animeId: ID!) {\n        anime(id: $animeId) {\n            id\n            anidbid\n            titleEn\n            titleJp\n            titleRomaji\n            titleKanji\n            titleSynonyms\n            description\n            imageUrl\n            tags\n            studios\n            animeStatus\n            episodeCount\n            duration\n            rating\n            startDate\n            endDate\n            broadcast\n            source\n            licensors\n            ranking\n            createdAt\n            updatedAt\n        }\n    }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SearchTheTVDB2($input: TheTVDBSearchInput) {\n        searchTheTVDB(input: $input) {\n            id\n            title\n            link\n            image\n            year\n            translations {\n                key\n                value\n            }\n            studios\n            genres\n        }\n    }\n"): (typeof documents)["\n    query SearchTheTVDB2($input: TheTVDBSearchInput) {\n        searchTheTVDB(input: $input) {\n            id\n            title\n            link\n            image\n            year\n            translations {\n                key\n                value\n            }\n            studios\n            genres\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetEpisodesFromTheTVDB2($thetvdbId: String!) {\n        getEpisodesFromTheTVDB(thetvdbID: $thetvdbId) {\n            id\n            title\n            episodeNumber\n            seasonNumber\n            link\n            image\n            description\n            airDate\n        }\n    }"): (typeof documents)["\n    query GetEpisodesFromTheTVDB2($thetvdbId: String!) {\n        getEpisodesFromTheTVDB(thetvdbID: $thetvdbId) {\n            id\n            title\n            episodeNumber\n            seasonNumber\n            link\n            image\n            description\n            airDate\n        }\n    }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RefreshToken($token: String!) {\n        RefreshToken(token: $token) {\n            id\n            Credentials {\n                refresh_token\n                token\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation RefreshToken($token: String!) {\n        RefreshToken(token: $token) {\n            id\n            Credentials {\n                refresh_token\n                token\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n        mutation Register($input: RegisterInput!) {\n            Register(input: $input) {\n                id\n            }\n        }\n  "): (typeof documents)["\n        mutation Register($input: RegisterInput!) {\n            Register(input: $input) {\n                id\n            }\n        }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n        mutation CreateSession($input: LoginInput!) {\n            CreateSession(input: $input) {\n                id\n                Credentials {\n                    refresh_token\n                    token\n                }\n            }\n        }\n  "): (typeof documents)["\n        mutation CreateSession($input: LoginInput!) {\n            CreateSession(input: $input) {\n                id\n                Credentials {\n                    refresh_token\n                    token\n                }\n            }\n        }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getUserDetails {\n        UserDetails {\n            id\n            firstname\n            lastname\n            username\n            language\n            email\n            active_sessions {\n                id\n                ip_address\n                token\n                user_agent\n                user_id\n            }\n        }\n    }"): (typeof documents)["\n    query getUserDetails {\n        UserDetails {\n            id\n            firstname\n            lastname\n            username\n            language\n            email\n            active_sessions {\n                id\n                ip_address\n                token\n                user_agent\n                user_id\n            }\n        }\n    }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation UpdateUserDetails($input: UpdateUserInput!) {\n        UpdateUserDetails(input: $input) {\n            id\n            firstname\n            lastname\n            username\n            language\n            email\n        }\n    }\n"): (typeof documents)["\n    mutation UpdateUserDetails($input: UpdateUserInput!) {\n        UpdateUserDetails(input: $input) {\n            id\n            firstname\n            lastname\n            username\n            language\n            email\n        }\n    }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;