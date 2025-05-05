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
  querySyncLink
} from "../services/queries";
import {Combobox, ComboboxInput, ComboboxOption, ComboboxOptions} from '@headlessui/react'
import React, {useEffect, useState} from 'react'
import useDebounce from "../components/Search/useDebounce";
import Search from "./components/search/search";
import Autocomplete from "../components/Autocomplete";
import Button, {ButtonColor} from "../components/Button";
import {format, parse as ParseDate, parseISO} from "date-fns";
import {findSameEntity} from "../services/autolink";


function Index() {
  const [selectedMALAnime, setSelectedMALAnime] = useState<any>({})
  const [selectedMALAnimeTitle, setSelectedMALAnimeTitle] = useState<string>('')
  const [selectedTVDBAnime, setSelectedTVDBAnime] = useState<TheTvdbAnime>({} as TheTvdbAnime)
  const [selectedSeason, setSelectedSeason] = useState<number>(1)
  const saveLinkMutation = useMutation(mutateSaveLink(selectedMALAnime.id, selectedTVDBAnime.id, selectedSeason, selectedMALAnimeTitle).queryFn)
  const [autolinkInProgress, setAutolinkInProgress] = useState(false)

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
    for (let link of savedLinks?.getSavedLinks) {
      await querySyncLink().queryFn(link.id)
    }
  }

  const attemptAutoLink = async () => {
    setAutolinkInProgress(true)
    const animeId = selectedMALAnime.id
    await findSameEntity(animeId).then((res) => {
      setAutolinkInProgress(false)
      console.log(res)
      if (res.item) {
        setSelectedTVDBAnime(res.item)
        setSelectedSeason(parseInt(res.season, 10))
      }
    })

  }

  return (
    <div className={"flex flex-col w-full h-96"}>
      <div className={"flex flex-row w-full"}>
      <span className={"w-auto"}>
        <h1 className={"text-4xl font-bold"}>Selected</h1>
        <div className={"flex flex-row space-x-8"}>
          <div className={"flex flex-col"}>
          <span>MAL:</span>
          <span className={"whitespace-nowrap"}>{selectedMALAnime.id}</span>
          <span className={"whitespace-nowrap"}>{selectedMALAnime.title_en}</span>
          <span
            className={"whitespace-nowrap"}>{selectedMALAnime.start_date ? format(parseISO(selectedMALAnime.start_date), 'yyyy-MM-dd') : null}</span>
          <span><img
            src={`https://cdn.weeb.vip/weeb/${selectedMALAnime.id}`}
            alt={selectedMALAnime.name}
            style={{height: '250px'}}
            className={"aspect-2/3 m-2"}
            onError={({currentTarget}) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = "/assets/not found.jpg";
            }}
          /></span>
        </div>
        <div className={"flex flex-col w-40"}>
          <span>THE TVDB</span>
          <span>{selectedTVDBAnime.id}</span>
          <span>{selectedTVDBAnime.translations?.filter(translation => translation.key === "eng").map(translation => translation.value)}</span>
          <span><img style={{height: '250px'}}
                     className={"aspect-2/3 m-2"}
                     src={selectedTVDBAnime.image} alt={selectedTVDBAnime.title}
                     onError={({currentTarget}) => {
                       currentTarget.onerror = null; // prevents looping
                       currentTarget.src = "/assets/not found.jpg";
                     }}/>
          </span>
          <span>Selected Season: {selectedSeason ? selectedSeason : "unkown"}</span>
       </div>
        </div>
      </span>
        <div className={"w-full flex flex-col"}>
          <h1 className={"text-4xl font-bold"}>Search</h1>
          <Autocomplete
            selectedFunction={(value) => {
              setSelectedMALAnime(value)
              setSelectedMALAnimeTitle(value.title_en)
            }}
          />
        </div>
        <div className={"w-full flex flex-col"}>
          <h1 className={"text-4xl font-bold"}>Search</h1>
          <Search<SearchTheTvdbQuery>
            selectFunction={(value) => setSelectedTVDBAnime(value)}
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
        <div className={"w-full flex flex-col overflow-auto h-96"}>
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
                const airdate = episode.airDate ? ParseDate(episode.airDate, 'yyyy-MM-dd', new Date()) : null
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
        {!autolinkInProgress ? (
        <div className={"w-full flex flex-col"}>
          <Button color={ButtonColor.blue} showLabel={true} type={"submit"} label={"Attempt AutoLink"} onClick={() => {
            attemptAutoLink()
          }}/>
        </div>
        ) : (
        <Loader/>
        )}
      </div>
      <div className={"flex flex-col w-full"}>
        <h1 className={"text-4xl font-bold"}>Saved Links</h1>
        <Button color={ButtonColor.blue} showLabel={true} type={"submit"} label={"Sync all"} onClick={() => {
          syncAll()
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
