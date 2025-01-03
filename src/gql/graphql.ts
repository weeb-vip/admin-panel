/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** RFC3339 formatted Date */
  Date: any;
  /** RFC3339 formatted DateTime */
  Time: any;
};

/** Anime Type */
export type Anime = {
  __typename?: 'Anime';
  /** AniDB ID of the anime */
  anidbid?: Maybe<Scalars['String']>;
  /** Anime status (finished, airing, upcoming) */
  animeStatus?: Maybe<Scalars['String']>;
  /** Anime broadcast */
  broadcast?: Maybe<Scalars['String']>;
  createdAt: Scalars['String'];
  /** Description of the anime */
  description?: Maybe<Scalars['String']>;
  /** Anime episode duration */
  duration?: Maybe<Scalars['String']>;
  /** Anime last air date */
  endDate?: Maybe<Scalars['Time']>;
  /** Anime episode count */
  episodeCount?: Maybe<Scalars['Int']>;
  /** returns all episodes of the anime */
  episodes?: Maybe<Array<Episode>>;
  /** ID of the anime */
  id: Scalars['ID'];
  /** Image URL of the anime */
  imageUrl?: Maybe<Scalars['String']>;
  /** Anime licensors */
  licensors?: Maybe<Array<Scalars['String']>>;
  /** Anime rank */
  ranking?: Maybe<Scalars['Int']>;
  /** Anime rating */
  rating?: Maybe<Scalars['String']>;
  /** Anime source (myanimelist, anime-planet, anidb, anilist, kitsu, anime_news_network) */
  source?: Maybe<Scalars['String']>;
  /** Anime first air date */
  startDate?: Maybe<Scalars['Time']>;
  /** Studios of the anime */
  studios?: Maybe<Array<Scalars['String']>>;
  /** Tags of the anime */
  tags?: Maybe<Array<Scalars['String']>>;
  /** English titel the anime */
  titleEn?: Maybe<Scalars['String']>;
  /** Japanese titel the anime */
  titleJp?: Maybe<Scalars['String']>;
  /** Kanji titel the anime */
  titleKanji?: Maybe<Scalars['String']>;
  /** Romaji titel the anime */
  titleRomaji?: Maybe<Scalars['String']>;
  /** Synonyms of the anime */
  titleSynonyms?: Maybe<Array<Scalars['String']>>;
  updatedAt: Scalars['String'];
};

export type AnimeApi = {
  __typename?: 'AnimeApi';
  /** Version of event anime-api service */
  version: Scalars['String'];
};

export type AnimeSearchInput = {
  /** Anime statuses */
  animeStatuses?: InputMaybe<Array<Scalars['String']>>;
  /** Page number */
  page: Scalars['Int'];
  /** Items per page */
  perPage: Scalars['Int'];
  /** Search query */
  query: Scalars['String'];
  /** Sort by */
  sortBy?: InputMaybe<Scalars['String']>;
  /** Sort direction */
  sortDirection?: InputMaybe<Scalars['String']>;
  /** Studios */
  studios?: InputMaybe<Array<Scalars['String']>>;
  /** Tags */
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type ApiInfo = {
  __typename?: 'ApiInfo';
  /** API Info of the AnimeAPI */
  animeApi: AnimeApi;
  /** Name of the API */
  name: Scalars['String'];
  /** API Info of the ScraperAPI */
  scraperAPI: ScraperApi;
};

export type Episode = {
  __typename?: 'Episode';
  /** Episode air date */
  airDate?: Maybe<Scalars['Time']>;
  /** Anime ID of the episode */
  animeId?: Maybe<Scalars['String']>;
  createdAt: Scalars['String'];
  /** Episode number */
  episodeNumber?: Maybe<Scalars['Int']>;
  /** ID of the episode */
  id: Scalars['ID'];
  /** Episode synopsis */
  synopsis?: Maybe<Scalars['String']>;
  /** Episode title */
  titleEn?: Maybe<Scalars['String']>;
  /** Episode title */
  titleJp?: Maybe<Scalars['String']>;
  updatedAt: Scalars['String'];
};

export type Link = {
  __typename?: 'Link';
  /** animeid Link */
  animeID: Scalars['String'];
  /** ID of the link */
  id: Scalars['ID'];
  /** name of anime */
  name: Scalars['String'];
  /** season */
  season: Scalars['Int'];
  /** TheTVDB ID */
  thetvdbID: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Save link */
  saveLink: Link;
};


export type MutationSaveLinkArgs = {
  input?: InputMaybe<SaveLinkInput>;
};

export type Query = {
  __typename?: 'Query';
  /** Get anime by ID */
  anime: Anime;
  /** AnimeAPI info */
  apiInfo: ApiInfo;
  /** Get currently airing anime */
  currentlyAiring?: Maybe<Array<Anime>>;
  /** Search for anime in the database */
  dbSearch?: Maybe<Array<Anime>>;
  /** Get episode by ID */
  episode: Episode;
  /** Get episodes by anime ID */
  episodesByAnimeId?: Maybe<Array<Episode>>;
  /** get episodes from thetvdb */
  getEpisodesFromTheTVDB?: Maybe<Array<TheTvdbEpisode>>;
  /** Saved Links */
  getSavedLinks?: Maybe<Array<Link>>;
  /** Get most popular anime with a response limit */
  mostPopularAnime?: Maybe<Array<Anime>>;
  /** Get newest anime with a response limit */
  newestAnime?: Maybe<Array<Anime>>;
  /** Search thetvdb for anime */
  searchTheTVDB?: Maybe<Array<TheTvdbAnime>>;
  /** sync thetvdb */
  syncLink: Scalars['Boolean'];
  /** Get top rated anime with a response limit */
  topRatedAnime?: Maybe<Array<Anime>>;
};


export type QueryAnimeArgs = {
  id: Scalars['ID'];
};


export type QueryDbSearchArgs = {
  searchQuery: AnimeSearchInput;
};


export type QueryEpisodeArgs = {
  id: Scalars['ID'];
};


export type QueryEpisodesByAnimeIdArgs = {
  animeId: Scalars['ID'];
};


export type QueryGetEpisodesFromTheTvdbArgs = {
  thetvdbID: Scalars['String'];
};


export type QueryMostPopularAnimeArgs = {
  limit?: InputMaybe<Scalars['Int']>;
};


export type QueryNewestAnimeArgs = {
  limit?: InputMaybe<Scalars['Int']>;
};


export type QuerySearchTheTvdbArgs = {
  input?: InputMaybe<TheTvdbSearchInput>;
};


export type QuerySyncLinkArgs = {
  linkID: Scalars['String'];
};


export type QueryTopRatedAnimeArgs = {
  limit?: InputMaybe<Scalars['Int']>;
};

export type SaveLinkInput = {
  /** Animeid Link to save */
  animeID: Scalars['String'];
  /** Name of anime */
  name: Scalars['String'];
  /** season */
  season: Scalars['Int'];
  /** TheTVDB ID */
  thetvdbID: Scalars['String'];
};

export type ScraperApi = {
  __typename?: 'ScraperAPI';
  /** Version of event scraper-api service */
  version: Scalars['String'];
};

export type TheTvdbAnime = {
  __typename?: 'TheTVDBAnime';
  /** Genres */
  genres?: Maybe<Array<Scalars['String']>>;
  /** ID of the anime */
  id: Scalars['ID'];
  /** Anime Poster */
  image?: Maybe<Scalars['String']>;
  /** Anime Link */
  link: Scalars['String'];
  /** studios */
  studios?: Maybe<Array<Scalars['String']>>;
  /** Anime title */
  title: Scalars['String'];
  /** Translations */
  translations?: Maybe<Array<Maybe<TranslationTuple>>>;
  /** Anime Release Year */
  year?: Maybe<Scalars['String']>;
};

export type TheTvdbEpisode = {
  __typename?: 'TheTVDBEpisode';
  /** Episode Air Date */
  airDate?: Maybe<Scalars['String']>;
  /** Episode Description */
  description?: Maybe<Scalars['String']>;
  /** Episode Number */
  episodeNumber: Scalars['Int'];
  /** ID of the episode */
  id: Scalars['ID'];
  /** Episode Image */
  image?: Maybe<Scalars['String']>;
  /** Episode Link */
  link: Scalars['String'];
  /** Season Number */
  seasonNumber: Scalars['Int'];
  /** Episode Title */
  title: Scalars['String'];
};

export type TheTvdbSearchInput = {
  /** Search query */
  query: Scalars['String'];
};

export type TranslationTuple = {
  __typename?: 'TranslationTuple';
  key?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type SearchTheTvdbQueryVariables = Exact<{
  input: TheTvdbSearchInput;
}>;


export type SearchTheTvdbQuery = { __typename?: 'Query', searchTheTVDB?: Array<{ __typename?: 'TheTVDBAnime', id: string, title: string, year?: string | null, image?: string | null, studios?: Array<string> | null, genres?: Array<string> | null, translations?: Array<{ __typename?: 'TranslationTuple', key?: string | null, value?: string | null } | null> | null }> | null };

export type SaveLinkMutationVariables = Exact<{
  input: SaveLinkInput;
}>;


export type SaveLinkMutation = { __typename?: 'Mutation', saveLink: { __typename?: 'Link', id: string, animeID: string, thetvdbID: string, season: number } };

export type GetEpisodesFromTheTvdbQueryVariables = Exact<{
  thetvdbID: Scalars['String'];
}>;


export type GetEpisodesFromTheTvdbQuery = { __typename?: 'Query', getEpisodesFromTheTVDB?: Array<{ __typename?: 'TheTVDBEpisode', title: string, seasonNumber: number, episodeNumber: number, image?: string | null, airDate?: string | null }> | null };

export type GetSavedLinksQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSavedLinksQuery = { __typename?: 'Query', getSavedLinks?: Array<{ __typename?: 'Link', id: string, animeID: string, thetvdbID: string, name: string, season: number }> | null };

export type SyncLinkQueryVariables = Exact<{
  linkId: Scalars['String'];
}>;


export type SyncLinkQuery = { __typename?: 'Query', syncLink: boolean };


export const SearchTheTvdbDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"searchTheTVDB"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TheTVDBSearchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchTheTVDB"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"studios"}},{"kind":"Field","name":{"kind":"Name","value":"genres"}},{"kind":"Field","name":{"kind":"Name","value":"translations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<SearchTheTvdbQuery, SearchTheTvdbQueryVariables>;
export const SaveLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"saveLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SaveLinkInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"animeID"}},{"kind":"Field","name":{"kind":"Name","value":"thetvdbID"}},{"kind":"Field","name":{"kind":"Name","value":"season"}}]}}]}}]} as unknown as DocumentNode<SaveLinkMutation, SaveLinkMutationVariables>;
export const GetEpisodesFromTheTvdbDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getEpisodesFromTheTVDB"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"thetvdbID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getEpisodesFromTheTVDB"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"thetvdbID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"thetvdbID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"seasonNumber"}},{"kind":"Field","name":{"kind":"Name","value":"episodeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"airDate"}}]}}]}}]} as unknown as DocumentNode<GetEpisodesFromTheTvdbQuery, GetEpisodesFromTheTvdbQueryVariables>;
export const GetSavedLinksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getSavedLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getSavedLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"animeID"}},{"kind":"Field","name":{"kind":"Name","value":"thetvdbID"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"season"}}]}}]}}]} as unknown as DocumentNode<GetSavedLinksQuery, GetSavedLinksQueryVariables>;
export const SyncLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"syncLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"linkId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"linkID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"linkId"}}}]}]}}]} as unknown as DocumentNode<SyncLinkQuery, SyncLinkQueryVariables>;