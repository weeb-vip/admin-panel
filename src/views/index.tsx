import {useMutation, useQuery} from "@tanstack/react-query";
import Loader from "../components/Loader";

import {graphql} from '../gql'
import request from "graphql-request";
import {GetEpisodesFromTheTvdbQuery, SearchTheTvdbQuery} from "../gql/graphql";
import {
  fetchTheTVDBEpisodes,
  getSavedLinks,
  getSearchResults,
  mutateSaveLink,
  querySyncLink
} from "../services/queries";
import {Combobox, ComboboxInput, ComboboxOption, ComboboxOptions} from '@headlessui/react'
import React, {useEffect, useState} from 'react'
import useDebounce from "../components/Search/useDebounce";
import Search from "./components/search/search";
import Autocomplete from "../components/Autocomplete";
import Button, {ButtonColor} from "../components/Button";


function Index() {
  const [selectedMALAnime, setSelectedMALAnime] = useState<string>('')
  const [selectedMALAnimeTitle, setSelectedMALAnimeTitle] = useState<string>('')
  const [selectedTVDBAnime, setSelectedTVDBAnime] = useState<string>('')
  const [selectedSeason, setSelectedSeason] = useState<number>(1)
  const saveLinkMutation = useMutation(mutateSaveLink(selectedMALAnime, selectedTVDBAnime, selectedSeason, selectedMALAnimeTitle).queryFn)

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
    ...fetchTheTVDBEpisodes(selectedTVDBAnime),
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

  const syncAll = async (links) => {
    for (let link of links) {
      await querySyncLink().queryFn(link.id)
    }
  }

  return (
    <div className={"flex flex-col w-full h-96"}>
      <div className={"flex flex-row w-full h-96"}>
      <span className={"w-1/2"}>
        <h1 className={"text-4xl font-bold"}>Selected</h1>
        <div>
        <span>MAL ID: {selectedMALAnime}</span>
          </div>
        <div>
        <span>THE TVDB ID: {selectedTVDBAnime}</span>
        </div>
      </span>
        <div className={"w-full flex flex-col"}>
          <h1 className={"text-4xl font-bold"}>Search</h1>
          <Autocomplete
            selectedFunction={(value) => {
              setSelectedMALAnime(value.id)
              setSelectedMALAnimeTitle(value.title_en)
            }}
          />
        </div>
        <div className={"w-full flex flex-col"}>
          <h1 className={"text-4xl font-bold"}>Search</h1>
          <Search<SearchTheTvdbQuery>
            selectFunction={(value) => setSelectedTVDBAnime(value.id)}
            searchFunction={getSearchResults}
            mapFunction={(data) => (
              <>
                {data?.searchTheTVDB?.map((person) => (
                  <ComboboxOption key={person.id} value={person}
                                  className="data-[focus]:bg-blue-100 border-b border-gray-600 flex items-center p-2 space-x-6">
                    <img src={person.image} alt={person.title} className={"w-24"}/>
                    <div>
                      <h3>{person.title}</h3>
                      <div>
                        <span>{person.year}</span>
                      </div>
                      <div>
                        {/* show translations */}
                        {person.translations?.map((translation) => (
                          <div>
                            <span>{translation.key}: </span>
                            <span>{translation.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </ComboboxOption>
                ))}</>
            )}/>
        </div>
        <div className={"w-full flex flex-col overflow-auto"}>
          <h1 className={"text-4xl font-bold"}>Episodes</h1>
          {theTVDBEpisodesIsLoading ? (
            <Loader/>
          ) : (
            <table className="table-auto leading-normal w-full">
              <thead>
              <tr>
                <th scope="col"
                    className="px-5 py-3 text-sm font-normal text-left text-gray-800 uppercase bg-white border-b border-gray-200"
                >
                  #
                </th>
                <th scope="col"
                    className="px-5 py-3 text-sm font-normal text-left text-gray-800 uppercase bg-white border-b border-gray-200">Name
                </th>
                <th scope="col"
                    className="px-5 py-3 text-sm font-normal text-left text-gray-800 uppercase bg-white border-b border-gray-200">Season
                </th>
                <th scope="col"
                    className="px-5 py-3 text-sm font-normal text-left text-gray-800 uppercase bg-white border-b border-gray-200">Aired
                </th>
              </tr>
              </thead>
              <tbody>
              {theTVDBEpisodes?.getEpisodesFromTheTVDB?.map((episode) => {
                console.log(episode)
                const airdate = episode.airDate ? new Date(episode.airDate) : null
                const formattedAirdate = airdate && airdate instanceof Date ? airdate.toDateString() : "TBA"

                return (
                  <tr key={episode.id}>
                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                      {episode.episodeNumber}
                    </td>
                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                      {episode.title}
                    </td>
                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                      {episode.seasonNumber}
                    </td>
                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                      {formattedAirdate}
                    </td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          )}
        </div>
        <div className={"w-full flex flex-col"}>
          {/* select the season from a dropdown */}
          <h1 className={"text-4xl font-bold"}>Season</h1>
          {theTVDBEpisodesIsLoading ? (
            <Loader/>
          ) : (
            <select className={"w-1/2"} onChange={(event) => {
              setSelectedSeason(parseInt(event.target.value))
            }}>
              {theTVDBEpisodes?.getEpisodesFromTheTVDB?.reduce((acc, episode) => {
                if (!acc.includes(episode.seasonNumber)) {
                  acc.push(episode.seasonNumber)
                }
                return acc
              }, []).map((season) => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          )}
        </div>
        <div className={"w-full flex flex-col"}>
          <Button color={ButtonColor.blue} showLabel={true} type={"submit"} label={"Save"} onClick={() => {
            saveLink()
          }}/>
        </div>
      </div>
      <div className={"flex flex-col w-full"}>
        <h1 className={"text-4xl font-bold"}>Saved Links</h1>
        <Button color={ButtonColor.blue} showLabel={true} type={"submit"} label={"Sync all"} onClick={() => {
          syncAll(savedLinks?.getSavedLinksyarn)
        }}/>
        {savedLinksIsLoading ? (
          <Loader/>
        ) : (
          <table className="table-auto leading-normal w-full">
            <thead>
            <tr>
              <th scope="col"
                  className="px-5 py-3 text-sm font-normal text-left text-gray-800 uppercase bg-white border-b border-gray-200"
              >
                #
              </th>
              <th scope="col"
                  className="px-5 py-3 text-sm font-normal text-left text-gray-800 uppercase bg-white border-b border-gray-200">
                Name
              </th>
              <th scope="col"
                  className="px-5 py-3 text-sm font-normal text-left text-gray-800 uppercase bg-white border-b border-gray-200">Anime
                ID
              </th>
              <th scope="col"
                  className="px-5 py-3 text-sm font-normal text-left text-gray-800 uppercase bg-white border-b border-gray-200">TVDB
                ID
              </th>
              <th scope="col"
                  className="px-5 py-3 text-sm font-normal text-left text-gray-800 uppercase bg-white border-b border-gray-200">Season
              </th>
              <th scope="col"
                  className="px-5 py-3 text-sm font-normal text-left text-gray-800 uppercase bg-white border-b border-gray-200">Sync
              </th>
            </tr>
            </thead>
            <tbody>

            {savedLinks?.getSavedLinks?.map((link) => {
              return (
                <tr key={link.id}>
                  <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                    {link.id}
                  </td>
                  <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                    {link.name}
                  </td>
                  <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                    {link.animeID}
                  </td>
                  <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                    {link.thetvdbID}
                  </td>
                  <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                    {link.season}
                  </td>
                  <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                    <Button color={ButtonColor.blue} showLabel={true} type={"submit"} label={"Sync"} onClick={() => {
                      querySyncLink().queryFn(link.id)
                    }}/>
                  </td>
                </tr>
              )
            })}
            </tbody>
          </table>
        )}

      </div>
      {/* padding */}
      <div className={"flex flex-col w-full"}>
        <h1 className={"text-4xl font-bold"}>Padding</h1>
      </div>
    </div>
  );
}

export default Index;
