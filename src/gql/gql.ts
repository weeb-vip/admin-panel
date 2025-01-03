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

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;