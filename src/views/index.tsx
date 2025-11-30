import {useMutation, useQuery} from "@tanstack/react-query";
import Loader from "../components/Loader";

import {graphql} from '../gql'
import request from "graphql-request";
import {Anime, GetEpisodesFromTheTvdbQuery, SearchTheTvdbQuery, TheTvdbAnime} from "../gql/graphql";
import {
  fetchTheTVDBEpisodes,
  getSavedLinks,
  getSearchResults,
  mutateSaveLink,
  querySyncLink,
  querySyncAllIDs
} from "../services/queries";
import {Combobox, ComboboxInput, ComboboxOption, ComboboxOptions} from '@headlessui/react'
import React, {useEffect, useState} from 'react';
import Search from "./components/search/search";
import Autocomplete from "../components/Autocomplete";
import Button, {ButtonColor} from "../components/Button";
import {format, parse as ParseDate} from "date-fns";
import {findSameEntity} from "../services/autolink";
import {getSafeImageUrl} from "../services/image-utils";


function Index() {
  const [selectedMALAnime, setSelectedMALAnime] = useState<any>({})
  const [selectedMALAnimeTitle, setSelectedMALAnimeTitle] = useState<string>('')
  const [selectedTVDBAnime, setSelectedTVDBAnime] = useState<TheTvdbAnime>({} as TheTvdbAnime)
  const [selectedSeason, setSelectedSeason] = useState<number>(1)
  const saveLinkMutation = useMutation(mutateSaveLink(selectedMALAnime.id, selectedTVDBAnime.id, selectedSeason, selectedMALAnimeTitle).queryFn)
  const syncIDsMutation = useMutation(querySyncAllIDs().queryFn)
  const [autolinkInProgress, setAutolinkInProgress] = useState(false)
  const [autolinkResult, setAutolinkResult] = useState<{
    status: 'success' | 'failed' | null;
    details?: {
      tvdbTitle?: string;
      tvdbId?: string;
      season?: number;
      matchReason?: string;
    };
  }>({ status: null })

  const query = useQuery({
    ...getSavedLinks(),
    cacheTime: 0
  })
  const {
    data: savedLinks,
    isLoading: savedLinksIsLoading,

  } = query
  // query episodes when tvdb id is selected
  const {
    data: theTVDBEpisodes,
    isLoading: theTVDBEpisodesIsLoading,
  } = useQuery<GetEpisodesFromTheTvdbQuery>({
    ...fetchTheTVDBEpisodes(selectedTVDBAnime.id),
    enabled: Boolean(selectedTVDBAnime)
  })

  useEffect(() => {
    if (selectedTVDBAnime) {
      console.log(`Fetching episodes for ${selectedTVDBAnime}`)
      // trigger a refetch
      query.refetch()
    }
  }, [selectedTVDBAnime])


  const saveLink = async () => {
    // use mutation to save the link
    await saveLinkMutation.mutate()

    query.isStale = true
    query.refetch()
  }

  const syncAll = async () => {

    console.log(savedLinks?.getSavedLinks)
    for (let link of savedLinks?.getSavedLinks || []) {
      await querySyncLink().queryFn(link.id)
    }
  }

  const syncAllIDs = async () => {
    await syncIDsMutation.mutate()
  }

  const attemptAutoLink = async () => {
    setAutolinkInProgress(true)
    setAutolinkResult({ status: null })
    const animeId = selectedMALAnime.id
    await findSameEntity(animeId).then((res) => {
      setAutolinkInProgress(false)
      console.log(res)
      if (res?.item) {
        setSelectedTVDBAnime(res.item)
        setSelectedSeason(parseInt(res.season, 10))

        // Get the English title or fallback to main title
        const tvdbTitle = res.item.translations?.find((t: any) => t?.key === "eng")?.value || res.item.title

        setAutolinkResult({
          status: 'success',
          details: {
            tvdbTitle,
            tvdbId: res.item.id,
            season: parseInt(res.season, 10),
            matchReason: 'Air date match found'
          }
        })
      } else {
        setAutolinkResult({
          status: 'failed',
          details: {
            matchReason: 'No matching air dates found in TVDB search results'
          }
        })
      }
    }).catch((error) => {
      console.error('Autolink error:', error)
      setAutolinkInProgress(false)
      setAutolinkResult({
        status: 'failed',
        details: {
          matchReason: `Error during autolink: ${error.message || 'Unknown error'}`
        }
      })
    })

  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Anime Link Manager</h1>
          <p className="text-gray-600">Connect MyAnimeList entries with TheTVDB for episode tracking</p>
        </header>

        {/* Step-by-step workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Step 1: Select Anime */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                1
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Select Anime</h2>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search MyAnimeList
              </label>
              <Autocomplete
                selectedFunction={(value) => {
                  setSelectedMALAnime(value)
                  setSelectedMALAnimeTitle(value.title_en)
                  setAutolinkResult({ status: null })
                }}
              />
            </div>

            {selectedMALAnime.id && (
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Selected Anime</h3>
                <div className="flex space-x-4">
                  <img
                    src={getSafeImageUrl(selectedMALAnime.title_en || selectedMALAnime.title_jp, 'weeb')}
                    alt={selectedMALAnime.title_en}
                    className="w-20 h-28 object-cover rounded"

                    data-raw-src={getSafeImageUrl(selectedMALAnime.title_en || selectedMALAnime.title_jp, 'weeb')}
                    onError={({currentTarget}) => {
                      currentTarget.onerror = null;
                      currentTarget.src = "/assets/not found.jpg";
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{selectedMALAnime.title_en}</p>
                    <p className="text-sm text-gray-600">ID: {selectedMALAnime.id}</p>
                    {selectedMALAnime.start_date && (
                      <p className="text-sm text-gray-600">
                        Air Date: {format(new Date(selectedMALAnime.start_date.replace(' +00:00', 'Z').replace(' ', 'T')), 'yyyy-MM-dd')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Find TVDB Match */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                selectedMALAnime.id ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Find TVDB Match</h2>
            </div>

            {!selectedMALAnime.id ? (
              <p className="text-gray-500 italic">Select an anime first to continue</p>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <Button
                      color={ButtonColor.blue}
                      showLabel={true}
                      label="Try Auto-Link"
                      onClick={attemptAutoLink}
                      disabled={autolinkInProgress}
                      className="w-full"
                    />
                    {autolinkInProgress && (
                      <div className="flex items-center justify-center mt-2 text-sm text-gray-600">
                        <Loader />
                        <span className="ml-2">Searching for matching TVDB entry...</span>
                      </div>
                    )}
                    {autolinkResult.status && (
                      <div className={`mt-2 p-3 rounded-md text-sm ${
                        autolinkResult.status === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {autolinkResult.status === 'success' ? (
                          <div className="space-y-1">
                            <div className="font-medium">✅ Successfully found a matching TVDB entry!</div>
                            <div className="text-xs space-y-1 mt-2">
                              <div><strong>Show:</strong> {autolinkResult.details?.tvdbTitle}</div>
                              <div><strong>TVDB ID:</strong> {autolinkResult.details?.tvdbId}</div>
                              <div><strong>Season:</strong> {autolinkResult.details?.season}</div>
                              <div><strong>Match Method:</strong> {autolinkResult.details?.matchReason}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="font-medium">❌ Auto-link failed</div>
                            <div className="text-xs mt-1">
                              <strong>Reason:</strong> {autolinkResult.details?.matchReason}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or search TheTVDB manually
                    </label>
                    <Search<SearchTheTvdbQuery>
                      selectFunction={(value: TheTvdbAnime) => setSelectedTVDBAnime(value)}
                      searchFunction={getSearchResults}
                      mapFunction={(data: SearchTheTvdbQuery) => (
                        <>
                          {data?.searchTheTVDB?.map((show: any) => (
                            <ComboboxOption
                              key={show.id}
                              value={show}
                              className="data-[focus]:bg-blue-50 border-b border-gray-100 flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                            >
                              <img src={show.image || "/assets/not found.jpg"} alt={show.title} className="w-12 h-16 object-cover rounded mr-3" />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{show.title}</h4>
                                <p className="text-sm text-gray-600">{show.year}</p>
                                {show.translations?.map((translation: any) => (
                                  <p key={translation.key} className="text-xs text-gray-500">
                                    {translation.key}: {translation.value}
                                  </p>
                                ))}
                              </div>
                            </ComboboxOption>
                          ))}
                        </>
                      )}
                    />
                  </div>
                </div>

                {selectedTVDBAnime.id && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-medium text-gray-900 mb-3">Selected TVDB Entry</h3>
                    <div className="flex space-x-4">
                      <img
                        src={selectedTVDBAnime.image || "/assets/not found.jpg"}
                        alt={selectedTVDBAnime.title}
                        className="w-20 h-28 object-cover rounded"
                        onError={({currentTarget}) => {
                          currentTarget.onerror = null;
                          currentTarget.src = "/assets/not found.jpg";
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {selectedTVDBAnime.translations?.find((t: any) => t?.key === "eng")?.value || selectedTVDBAnime.title}
                        </p>
                        <p className="text-sm text-gray-600">ID: {selectedTVDBAnime.id}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* Step 3: Configure and Save */}
        {selectedMALAnime.id && selectedTVDBAnime.id && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                3
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Configure and Save Link</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Season Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Season
                </label>
                {theTVDBEpisodesIsLoading ? (
                  <div className="flex items-center justify-center h-10">
                    <Loader />
                  </div>
                ) : (
                  <select
                    value={selectedSeason}
                    onChange={(event) => setSelectedSeason(parseInt(event.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {theTVDBEpisodes?.getEpisodesFromTheTVDB?.reduce((acc: number[], episode) => {
                      if (!acc.includes(episode.seasonNumber)) {
                        acc.push(episode.seasonNumber)
                      }
                      return acc
                    }, []).map((season) => (
                      <option key={season} value={season}>Season {season}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Episode Count Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Episodes in Season {selectedSeason}
                </label>
                <div className="text-2xl font-bold text-blue-600">
                  {theTVDBEpisodes?.getEpisodesFromTheTVDB?.filter(ep => ep.seasonNumber === selectedSeason).length || 0}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-end">
                <Button
                  color={ButtonColor.blue}
                  showLabel={true}
                  label="Save Link"
                  onClick={saveLink}
                  className="w-full h-10"
                />
              </div>
            </div>

            {/* Episodes Preview */}
            {selectedSeason && theTVDBEpisodes && (
              <div className="mt-6 border-t pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Episodes Preview</h3>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Episode</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Air Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {theTVDBEpisodes.getEpisodesFromTheTVDB
                        ?.filter(episode => episode.seasonNumber === selectedSeason)
                        .map((episode) => {
                          const airdate = episode.airDate ? ParseDate(episode.airDate, 'yyyy-MM-dd', new Date()) : null
                          const formattedAirdate = airdate && airdate instanceof Date ? airdate.toDateString() : "TBA"

                          return (
                            <tr key={episode.episodeNumber} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">{episode.episodeNumber}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{episode.title}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{formattedAirdate}</td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Saved Links Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Saved Links</h2>
            <div className="flex space-x-3">
              <Button
                color={ButtonColor.blue}
                showLabel={true}
                label="Sync All"
                onClick={syncAll}
              />
              <Button
                color={ButtonColor.green}
                showLabel={true}
                label="Sync IDs"
                onClick={syncAllIDs}
              />
            </div>
          </div>

          {savedLinksIsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader />
            </div>
          ) : savedLinks?.getSavedLinks?.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg mb-2">No links saved yet</p>
              <p className="text-sm">Create your first anime link above to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MAL ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVDB ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Season</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {savedLinks?.getSavedLinks?.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{link.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{link.animeID}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{link.thetvdbID}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{link.season}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <Button
                          color={ButtonColor.blue}
                          showLabel={true}
                          label="Sync"
                          onClick={() => querySyncLink().queryFn(link.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Index;
