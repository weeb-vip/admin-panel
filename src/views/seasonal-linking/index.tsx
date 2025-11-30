import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { queryAnimeBySeasons } from '../../services/api/graphql/queries';
import { AnimeBySeasonsQuery, TheTvdbAnime } from '../../gql/graphql';
import { findSameEntity } from '../../services/autolink';
import { mutateSaveLink, fetchTheTVDBEpisodes, getAnimeBySeason, getSavedLinks, querySyncLink } from '../../services/queries';
import Button, { ButtonColor } from '../../components/Button';
import Loader from '../../components/Loader';
import { getSafeImageUrl } from '../../services/image-utils';
import { format, parse as ParseDate } from 'date-fns';
import Search from '../components/search/search';
import { SearchTheTvdbQuery } from '../../gql/graphql';
import { getSearchResults } from '../../services/queries';
import { ComboboxOption } from '@headlessui/react';
import SortableTable, { SortableColumn, FilterConfig } from '../../components/SortableTable';

interface LinkingResult {
  animeId: string;
  animeTitle: string;
  tvdbId?: string;
  tvdbTitle?: string;
  tvdbImage?: string;
  season?: number;
  status: 'pending' | 'linking' | 'success' | 'failed' | 'manual' | 'already_linked';
  message?: string;
}

interface ProgressStats {
  total: number;
  processed: number;
  remaining: number;
  successful: number;
  failed: number;
  skipped: number;
  startTime: number;
  currentAnime?: string;
  processingTimes: number[]; // Array of recent processing times in ms
  lastProcessedTime: number; // Timestamp when last item was processed
}

function SeasonalLinking() {
  // Season selection state
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentSeason = currentMonth <= 2 ? 'WINTER' : currentMonth <= 5 ? 'SPRING' : currentMonth <= 8 ? 'SUMMER' : 'FALL';

  const [selectedSeason, setSelectedSeason] = useState<string>(`${currentSeason}_${currentYear}`);
  const [linkingResults, setLinkingResults] = useState<Record<string, LinkingResult>>({});
  const [currentProcessingId, setCurrentProcessingId] = useState<string | null>(null);
  const [isAutoLinkingAll, setIsAutoLinkingAll] = useState<boolean>(false);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const stopAutoLinking = useRef<boolean>(false);
  const [manualSearchAnime, setManualSearchAnime] = useState<any>(null);
  const [selectedTVDBForManual, setSelectedTVDBForManual] = useState<TheTvdbAnime | null>(null);
  const [selectedSeasonForManual, setSelectedSeasonForManual] = useState<number>(1);

  // Table columns configuration
  const columns: SortableColumn<any>[] = [
    {
      key: 'anime',
      label: 'Anime',
      sortable: true,
      filterable: true,
      filterType: 'text',
      getFilterValue: (anime) => anime.titleEn || anime.titleJp || '',
      sortFn: (a, b) => (a.titleEn || a.titleJp || '').localeCompare(b.titleEn || b.titleJp || '')
    },
    {
      key: 'airDate',
      label: 'Air Date',
      sortable: true,
      sortFn: (a, b) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        return dateA - dateB;
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'pending', label: 'Pending' },
        { value: 'already_linked', label: 'Linked' },
        { value: 'success', label: 'Success' },
        { value: 'failed', label: 'Failed' },
        { value: 'linking', label: 'Linking' }
      ],
      getFilterValue: (anime) => linkingResults[anime.id]?.status || 'pending',
      sortFn: (a, b) => {
        const statusA = linkingResults[a.id]?.status || 'pending';
        const statusB = linkingResults[b.id]?.status || 'pending';
        return statusA.localeCompare(statusB);
      }
    },
    {
      key: 'tvdbMatch',
      label: 'TVDB Match',
      sortable: true,
      filterable: true,
      filterType: 'text',
      getFilterValue: (anime) => linkingResults[anime.id]?.tvdbTitle || '',
      sortFn: (a, b) => {
        const titleA = linkingResults[a.id]?.tvdbTitle || '';
        const titleB = linkingResults[b.id]?.tvdbTitle || '';
        return titleA.localeCompare(titleB);
      }
    },
    {
      key: 'tvdbImage',
      label: 'TVDB Image',
      sortable: false
    },
    {
      key: 'season',
      label: 'Season',
      sortable: true,
      filterable: true,
      filterType: 'text',
      getFilterValue: (anime) => (linkingResults[anime.id]?.season || '').toString(),
      sortFn: (a, b) => {
        const seasonA = linkingResults[a.id]?.season || 0;
        const seasonB = linkingResults[b.id]?.season || 0;
        return seasonA - seasonB;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false
    }
  ];

  const renderRow = (anime: any, index: number) => {
    const result = linkingResults[anime.id] || {};
    const isProcessing = currentProcessingId === anime.id;

    return (
      <tr key={anime.id} className="hover:bg-gray-50">
        <td className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <img
              src={anime.imageUrl || getSafeImageUrl(anime.titleEn || anime.titleJp, 'weeb')}
              alt={anime.titleEn}
              className="w-10 h-14 object-cover rounded"
              onError={({currentTarget}) => {
                currentTarget.onerror = null;
                currentTarget.src = "/assets/not found.jpg";
              }}
            />
            <div>
              <div className="text-sm font-medium text-gray-900">{anime.titleEn || anime.titleJp}</div>
              <div className="text-xs text-gray-500">ID: {anime.id}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {anime.startDate ? format(new Date(anime.startDate), 'yyyy-MM-dd') : 'N/A'}
        </td>
        <td className="px-4 py-3">
          {isProcessing ? (
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing
            </span>
          ) : (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              result.status === 'success' ? 'bg-green-100 text-green-800' :
              result.status === 'already_linked' ? 'bg-blue-100 text-blue-800' :
              result.status === 'failed' ? 'bg-red-100 text-red-800' :
              result.status === 'manual' ? 'bg-purple-100 text-purple-800' :
              result.status === 'linking' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {result.status === 'already_linked' ? 'Linked' : result.status || 'Pending'}
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {result.tvdbTitle || '-'}
        </td>
        <td className="px-4 py-3">
          {result.tvdbImage ? (
            <img
              src={result.tvdbImage}
              alt={result.tvdbTitle || 'TVDB Match'}
              className="w-12 h-16 object-cover rounded"
              onError={({currentTarget}) => {
                currentTarget.onerror = null;
                currentTarget.src = "/assets/not found.jpg";
              }}
            />
          ) : result.status === 'already_linked' && result.tvdbId ? (
            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
              ID: {result.tvdbId}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {result.season || '-'}
        </td>
        <td className="px-4 py-3">
          <div className="flex space-x-2">
            {result.status !== 'success' && result.status !== 'already_linked' && (
              <Button
                color={ButtonColor.blue}
                showLabel={true}
                label="Auto"
                onClick={() => attemptAutoLink(anime)}
                disabled={isProcessing}
                className="text-xs"
              />
            )}
            {result.status !== 'already_linked' && (
              <Button
                color={ButtonColor.transparent}
                showLabel={true}
                label="Manual"
                onClick={() => {
                  setManualSearchAnime(anime);
                  setSelectedTVDBForManual(null);
                  setSelectedSeasonForManual(1);
                }}
                className="text-xs"
              />
            )}
            {result.status === 'success' && (
              <Button
                color={ButtonColor.green}
                showLabel={true}
                label="Save"
                onClick={() => saveLink(anime.id)}
                className="text-xs"
              />
            )}
            {result.status === 'already_linked' && (
              <Button
                color={ButtonColor.transparent}
                showLabel={true}
                label="Re-link"
                onClick={() => {
                  setManualSearchAnime(anime);
                  setSelectedTVDBForManual(null);
                  setSelectedSeasonForManual(result.season || 1);
                }}
                className="text-xs"
              />
            )}
          </div>
          {result.message && (
            <div className="text-xs text-gray-500 mt-1">{result.message}</div>
          )}
        </td>
      </tr>
    );
  };

  // Generate season options for dropdown
  const generateSeasonOptions = () => {
    const options = [];
    const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

    for (let year = currentYear + 1; year >= 2000; year--) {
      for (const season of seasons) {
        options.push(`${season}_${year}`);
        if (options.length >= 50) return options; // Limit to last 50 seasons
      }
    }
    return options;
  };

  // Fetch anime for selected season
  const { data: animeData, isLoading: isLoadingAnime, error: queryError, refetch } = useQuery({
    ...getAnimeBySeason(selectedSeason),
    enabled: !!selectedSeason,
  });

  // Debug logging
  useEffect(() => {
    console.log('Selected season:', selectedSeason);
    console.log('Query loading:', isLoadingAnime);
    console.log('Query error:', queryError);
    console.log('Query data:', animeData);
  }, [selectedSeason, isLoadingAnime, queryError, animeData]);

  // Fetch saved links to check what's already linked
  const { data: savedLinksData } = useQuery({
    ...getSavedLinks(),
    cacheTime: 0
  });

  // Query for TVDB episodes when manual linking
  const { data: tvdbEpisodes } = useQuery({
    queryKey: ['tvdbEpisodes', selectedTVDBForManual?.id],
    queryFn: () => fetchTheTVDBEpisodes(selectedTVDBForManual!.id).queryFn(),
    enabled: !!selectedTVDBForManual?.id,
  });

  // Real-time timer for progress display
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoLinkingAll && progressStats) {
      interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoLinkingAll, progressStats]);

  // Initialize results when anime data changes
  useEffect(() => {
    if (animeData?.animeBySeasons && savedLinksData) {
      const initialResults: Record<string, LinkingResult> = {};

      // Create a map of already linked anime IDs
      const linkedAnimeIds = new Set(
        savedLinksData.getSavedLinks?.map(link => link.animeID) || []
      );

      animeData.animeBySeasons.forEach((anime: any) => {
        if (!linkingResults[anime.id]) {
          const existingLink = savedLinksData.getSavedLinks?.find(
            link => link.animeID === anime.id
          );

          if (existingLink) {
            // Anime is already linked
            initialResults[anime.id] = {
              animeId: anime.id,
              animeTitle: anime.titleEn || anime.titleJp || '',
              status: 'already_linked',
              tvdbId: existingLink.thetvdbID,
              season: existingLink.season,
              message: `Already linked to TVDB ID: ${existingLink.thetvdbID} (Season ${existingLink.season})`,
            };
          } else {
            // Anime is not linked yet
            initialResults[anime.id] = {
              animeId: anime.id,
              animeTitle: anime.titleEn || anime.titleJp || '',
              status: 'pending',
            };
          }
        }
      });
      setLinkingResults(prev => ({ ...prev, ...initialResults }));
    }
  }, [animeData, savedLinksData]);

  // Auto-link single anime
  const attemptAutoLink = async (anime: any) => {
    setCurrentProcessingId(anime.id);
    setLinkingResults(prev => ({
      ...prev,
      [anime.id]: { ...prev[anime.id], status: 'linking' }
    }));

    try {
      // Pre-validate anime data for better error messages
      if (!anime.titleEn && !anime.titleJp) {
        setLinkingResults(prev => ({
          ...prev,
          [anime.id]: {
            ...prev[anime.id],
            status: 'failed',
            message: 'Failed: No title available for search',
          }
        }));
        setCurrentProcessingId(null);
        return;
      }

      if (!anime.startDate) {
        setLinkingResults(prev => ({
          ...prev,
          [anime.id]: {
            ...prev[anime.id],
            status: 'failed',
            message: 'Failed: No start date available for date matching',
          }
        }));
        setCurrentProcessingId(null);
        return;
      }

      const result = await findSameEntity(anime.id);

      if (result?.item) {
        const matchMethod = result.searchMethod ? ` via ${result.searchMethod}` : '';
        const searchInfo = result.searchQuery ? ` (searched: "${result.searchQuery}")` : '';

        setLinkingResults(prev => ({
          ...prev,
          [anime.id]: {
            ...prev[anime.id],
            status: 'success',
            tvdbId: result.item.id,
            tvdbTitle: result.item.translations?.find((t: any) => t?.key === "eng")?.value || result.item.title,
            tvdbImage: result.item.image,
            season: parseInt(result.season, 10),
            message: `✅ Matched: ${result.item.title} - Season ${result.season}${matchMethod}${searchInfo}`,
          }
        }));
      } else {
        // Provide more detailed failure information
        const animeTitle = anime.titleEn || anime.titleJp || 'Unknown';
        const searchQuery = animeTitle.replace(/(season|s\d+|\d+)/gi, "").trim();
        const searchMessage = searchQuery !== animeTitle
          ? `Search query: "${searchQuery}" (cleaned from "${animeTitle}")`
          : `Search query: "${searchQuery}"`;

        setLinkingResults(prev => ({
          ...prev,
          [anime.id]: {
            ...prev[anime.id],
            status: 'failed',
            message: `Failed: No TVDB match found. ${searchMessage}. Expected air date: ${anime.startDate ? format(new Date(anime.startDate), 'yyyy-MM-dd') : 'Unknown'}`,
          }
        }));
      }
    } catch (error: any) {
      let errorMessage = `Error: ${error.message}`;

      // Provide more specific error messages based on error type
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Failed: Network error - unable to connect to TVDB API';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Failed: Request timeout - TVDB API took too long to respond';
      } else if (error.message?.includes('404')) {
        errorMessage = 'Failed: Anime not found in database';
      } else if (error.message?.includes('401') || error.message?.includes('403')) {
        errorMessage = 'Failed: API authentication error';
      }

      setLinkingResults(prev => ({
        ...prev,
        [anime.id]: {
          ...prev[anime.id],
          status: 'failed',
          message: errorMessage,
        }
      }));
    }

    setCurrentProcessingId(null);
  };

  // Auto-link all anime
  const autoLinkAll = async () => {
    setIsAutoLinkingAll(true);
    stopAutoLinking.current = false;
    const animeList = animeData?.animeBySeasons || [];

    // Filter to only process pending anime
    const pendingAnime = animeList.filter(anime => {
      const status = linkingResults[anime.id]?.status;
      return status !== 'success' && status !== 'already_linked';
    });

    // Initialize progress stats
    const startTime = Date.now();
    setProgressStats({
      total: pendingAnime.length,
      processed: 0,
      remaining: pendingAnime.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      startTime,
      currentAnime: pendingAnime[0]?.titleEn || pendingAnime[0]?.titleJp || 'Unknown',
      processingTimes: [],
      lastProcessedTime: startTime
    });

    let processed = 0;
    let successful = 0;
    let failed = 0;

    for (const anime of pendingAnime) {
      // Check if we should stop
      if (stopAutoLinking.current) {
        break;
      }

      // Update current anime being processed
      setProgressStats(prev => prev ? {
        ...prev,
        currentAnime: anime.titleEn || anime.titleJp || 'Unknown'
      } : null);

      // Process the anime
      const initialStatus = linkingResults[anime.id]?.status;
      await attemptAutoLink(anime);

      processed++;

      // Wait for state to update and check the specific anime's result
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get the latest state by creating a new function that has access to current state
      setLinkingResults(currentResults => {
        const updatedResult = currentResults[anime.id];
        const allResults = Object.values(currentResults);
        const currentSuccessful = allResults.filter(r => r.status === 'success').length;
        const currentFailed = allResults.filter(r => r.status === 'failed').length;

        // Calculate processing time for this item
        const now = Date.now();

        // Update progress stats with real-time counts and ETA calculation
        setProgressStats(prev => {
          if (!prev) return null;

          // Calculate processing time (skip first item since we don't have a baseline)
          const processingTime = processed > 0 ? now - prev.lastProcessedTime : 0;

          // Keep only the last 5 processing times for moving average (exclude 0 times)
          const newProcessingTimes = processingTime > 0
            ? [...prev.processingTimes, processingTime].slice(-5)
            : prev.processingTimes;

          return {
            ...prev,
            processed,
            remaining: pendingAnime.length - processed,
            successful: currentSuccessful,
            failed: currentFailed,
            processingTimes: newProcessingTimes,
            lastProcessedTime: now
          };
        });

        return currentResults; // Return unchanged state
      });

      // No delay needed - just process one by one
    }

    setIsAutoLinkingAll(false);
    setProgressStats(null);
    stopAutoLinking.current = false;
  };

  // Save a link
  const saveLink = async (animeId: string) => {
    const result = linkingResults[animeId];
    if (!result || !result.tvdbId || !result.season) return;

    try {
      await mutateSaveLink(animeId, result.tvdbId, result.season, result.animeTitle).queryFn();
      setLinkingResults(prev => ({
        ...prev,
        [animeId]: {
          ...prev[animeId],
          message: 'Link saved successfully!',
        }
      }));
    } catch (error: any) {
      setLinkingResults(prev => ({
        ...prev,
        [animeId]: {
          ...prev[animeId],
          message: `Save failed: ${error.message}`,
        }
      }));
    }
  };

  // Save all successful links
  const saveAllSuccesses = async () => {
    const successfulLinks = Object.entries(linkingResults).filter(([_, result]) => result.status === 'success');

    if (successfulLinks.length === 0) return;

    let savedCount = 0;
    let failedCount = 0;

    for (const [animeId, result] of successfulLinks) {
      if (!result.tvdbId || !result.season) continue;

      try {
        await mutateSaveLink(animeId, result.tvdbId, result.season, result.animeTitle).queryFn();
        setLinkingResults(prev => ({
          ...prev,
          [animeId]: {
            ...prev[animeId],
            message: 'Link saved successfully!',
          }
        }));
        savedCount++;
      } catch (error: any) {
        setLinkingResults(prev => ({
          ...prev,
          [animeId]: {
            ...prev[animeId],
            message: `Save failed: ${error.message}`,
          }
        }));
        failedCount++;
      }
    }

    // Show summary message
    const message = failedCount > 0
      ? `Saved ${savedCount} links successfully, ${failedCount} failed`
      : `Successfully saved all ${savedCount} links!`;

    alert(message);
  };

  // Sync all linked anime
  const syncAllLinked = async () => {
    const linkedAnime = Object.entries(linkingResults).filter(([_, result]) => result.status === 'already_linked');

    if (linkedAnime.length === 0) return;

    let syncedCount = 0;
    let failedCount = 0;

    for (const [animeId, result] of linkedAnime) {
      // Find the corresponding saved link for this anime
      const savedLink = savedLinksData?.getSavedLinks?.find(link => link.animeID === animeId);

      if (!savedLink) {
        console.warn(`No saved link found for anime ID: ${animeId}`);
        failedCount++;
        continue;
      }

      try {
        await querySyncLink().queryFn(savedLink.id);
        setLinkingResults(prev => ({
          ...prev,
          [animeId]: {
            ...prev[animeId],
            message: 'Synced successfully!',
          }
        }));
        syncedCount++;
      } catch (error: any) {
        setLinkingResults(prev => ({
          ...prev,
          [animeId]: {
            ...prev[animeId],
            message: `Sync failed: ${error.message}`,
          }
        }));
        failedCount++;
      }
    }

    // Show summary message
    const message = failedCount > 0
      ? `Synced ${syncedCount} anime successfully, ${failedCount} failed`
      : `Successfully synced all ${syncedCount} linked anime!`;

    alert(message);
  };

  // Save manual link
  const saveManualLink = async () => {
    if (!manualSearchAnime || !selectedTVDBForManual) return;

    try {
      await mutateSaveLink(
        manualSearchAnime.id,
        selectedTVDBForManual.id,
        selectedSeasonForManual,
        manualSearchAnime.titleEn || manualSearchAnime.titleJp
      ).queryFn();

      setLinkingResults(prev => ({
        ...prev,
        [manualSearchAnime.id]: {
          ...prev[manualSearchAnime.id],
          status: 'success',
          tvdbId: selectedTVDBForManual.id,
          tvdbTitle: selectedTVDBForManual.translations?.find((t: any) => t?.key === "eng")?.value || selectedTVDBForManual.title,
          tvdbImage: selectedTVDBForManual.image,
          season: selectedSeasonForManual,
          message: 'Manual link saved successfully!',
        }
      }));

      setManualSearchAnime(null);
      setSelectedTVDBForManual(null);
    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seasonal Anime Linking</h1>
          <p className="text-gray-600">Automatically link anime from a specific season to TVDB</p>
        </header>

        {/* Season Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Select Season:</label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {generateSeasonOptions().map(season => (
                  <option key={season} value={season}>{season.replace('_', ' ')}</option>
                ))}
              </select>
              <Button
                color={ButtonColor.blue}
                showLabel={true}
                label="Refresh"
                onClick={() => refetch()}
              />
            </div>

            <div className="flex items-center space-x-3">
              {isAutoLinkingAll ? (
                <Button
                  color={ButtonColor.red}
                  showLabel={true}
                  label="Stop Auto-Linking"
                  onClick={() => {
                    stopAutoLinking.current = true;
                    setIsAutoLinkingAll(false);
                  }}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    color={ButtonColor.green}
                    showLabel={true}
                    label="Auto-Link All"
                    onClick={autoLinkAll}
                    disabled={currentProcessingId !== null}
                    className="text-sm whitespace-nowrap"
                  />
                  <Button
                    color={ButtonColor.blue}
                    showLabel={true}
                    label="Save All"
                    onClick={saveAllSuccesses}
                    disabled={currentProcessingId !== null || Object.values(linkingResults).filter(r => r.status === 'success').length === 0}
                    className="text-sm whitespace-nowrap"
                  />
                  <Button
                    color={ButtonColor.transparent}
                    showLabel={true}
                    label="Sync All"
                    onClick={syncAllLinked}
                    disabled={currentProcessingId !== null || Object.values(linkingResults).filter(r => r.status === 'already_linked').length === 0}
                    className="text-sm whitespace-nowrap"
                  />
                </div>
              )}
              <div className="text-sm text-gray-600 space-x-3">
                <span>Total: {animeData?.animeBySeasons?.length || 0}</span>
                <span className="text-blue-600">
                  Linked: {Object.values(linkingResults).filter(r => r.status === 'already_linked').length}
                </span>
                <span className="text-gray-500">
                  Pending: {Object.values(linkingResults).filter(r => r.status === 'pending').length}
                </span>
                <span className="text-green-600">
                  Success: {Object.values(linkingResults).filter(r => r.status === 'success').length}
                </span>
                <span className="text-red-600">
                  Failed: {Object.values(linkingResults).filter(r => r.status === 'failed').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Progress Panel */}
        {isAutoLinkingAll && progressStats && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4 text-sm">
                <span className="font-medium text-blue-900">
                  {Math.round((progressStats.processed / progressStats.total) * 100)}% Complete
                </span>
                <span className="text-blue-700">
                  {progressStats.processed}/{progressStats.total}
                </span>
                <span className="text-green-600 font-medium">✓{progressStats.successful}</span>
                <span className="text-red-600 font-medium">✗{progressStats.failed}</span>
                <span className="text-gray-600">
                  {
                    (() => {
                      const elapsedMs = currentTime - progressStats.startTime;
                      const elapsedSeconds = Math.floor(elapsedMs / 1000);
                      const minutes = Math.floor(elapsedSeconds / 60);
                      const seconds = elapsedSeconds % 60;
                      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    })()
                  }
                </span>
                <span className="text-purple-600">
                  {
                    (() => {
                      const remaining = progressStats.remaining;

                      // Show "calculating" for first few items
                      if (progressStats.processed < 2) {
                        return 'ETA: Calculating...';
                      }

                      // If no remaining items
                      if (remaining <= 0) {
                        return 'ETA: 0:00';
                      }

                      // Need processing times to calculate ETA
                      if (progressStats.processingTimes.length === 0) {
                        return 'ETA: --:--';
                      }

                      // Use moving average of recent processing times for more stable ETA
                      const avgProcessingTimeMs = progressStats.processingTimes.reduce((sum, time) => sum + time, 0) / progressStats.processingTimes.length;

                      // Calculate ETA based on average processing time
                      const etaMs = remaining * avgProcessingTimeMs;
                      const etaSeconds = Math.round(etaMs / 1000);

                      // Handle edge cases
                      if (etaSeconds <= 0) return 'ETA: 0:00';
                      if (etaSeconds > 7200) return 'ETA: >2hrs'; // Cap at 2 hours display

                      const etaMins = Math.floor(etaSeconds / 60);
                      const etaSecs = etaSeconds % 60;
                      return `ETA: ${etaMins}:${etaSecs.toString().padStart(2, '0')}`;
                    })()
                  }
                </span>
              </div>
              <div className="text-sm text-blue-700 truncate max-w-xs">
                <strong>Current:</strong> {progressStats.currentAnime}
              </div>
            </div>

            {/* Compact Progress Bar */}
            <div className="w-full bg-blue-200 rounded-full h-1">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(progressStats.processed / progressStats.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Results Table */}
        {isLoadingAnime ? (
          <div className="flex justify-center p-12">
            <Loader />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <SortableTable
              data={animeData?.animeBySeasons || []}
              columns={columns}
              renderRow={renderRow}
              initialSort={{ key: 'airDate', direction: 'desc' }}
              showSearch={true}
              searchPlaceholder="Search anime titles..."
              searchKeys={['titleEn', 'titleJp', 'titleRomaji']}
            />
          </div>
        )}

        {/* Manual Linking Modal */}
        {manualSearchAnime && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full min-h-[400px] p-6 relative">
              <h2 className="text-xl font-bold mb-4">Manual Link: {manualSearchAnime.titleEn || manualSearchAnime.titleJp}</h2>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search TVDB
                  </label>
                  <div className="relative z-[100]">
                  <Search<SearchTheTvdbQuery>
                    selectFunction={(value: any) => setSelectedTVDBForManual(value)}
                    searchFunction={getSearchResults}
                    mapFunction={(data: any) => (
                      <>
                        {data?.searchTheTVDB?.map((show: any) => (
                          <ComboboxOption
                            key={show.id}
                            value={show}
                            className="data-[focus]:bg-blue-50 border-b border-gray-100 flex items-start p-3 hover:bg-gray-50 cursor-pointer"
                          >
                            <img src={show.image || "/assets/not found.jpg"} alt={show.title} className="w-12 h-16 object-cover rounded mr-3 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              {(() => {
                                // Find English translation
                                const englishTranslation = show.translations?.find((t: any) =>
                                  t.key?.toLowerCase() === 'eng' || t.key?.toLowerCase() === 'en'
                                );
                                const mainTitle = englishTranslation?.value || show.title;
                                const originalTitle = show.title;
                                const showOriginal = originalTitle && originalTitle !== mainTitle;

                                return (
                                  <>
                                    <h4 className="font-medium text-gray-900 truncate">{mainTitle}</h4>
                                    {showOriginal && (
                                      <p className="text-sm text-gray-600 truncate">Original: {originalTitle}</p>
                                    )}
                                  </>
                                );
                              })()}
                              <div className="text-sm text-gray-600 space-y-1">
                                {show.year && <p>Year: {show.year}</p>}
                                {show.status && <p>Status: {show.status}</p>}
                                <p className="text-xs text-gray-500">ID: {show.id}</p>
                              </div>
                              {show.translations && show.translations.length > 0 && (
                                <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                                  {show.translations
                                    .filter((t: any) => t.key?.toLowerCase() !== 'eng' && t.key?.toLowerCase() !== 'en')
                                    .slice(0, 3)
                                    .map((translation: any, index: number) => (
                                      <div key={index} className="text-xs text-gray-600">
                                        <span className="font-medium text-blue-600">{translation.key?.toUpperCase()}:</span> {translation.value}
                                      </div>
                                    ))}
                                  {show.translations.filter((t: any) => t.key?.toLowerCase() !== 'eng' && t.key?.toLowerCase() !== 'en').length > 3 && (
                                    <div className="text-xs text-gray-500">+{show.translations.filter((t: any) => t.key?.toLowerCase() !== 'eng' && t.key?.toLowerCase() !== 'en').length - 3} more translations</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </ComboboxOption>
                        ))}
                      </>
                    )}
                  />
                  </div>
                </div>

                {selectedTVDBForManual && (
                  <div className="space-y-4">
                    {/* Detailed TVDB Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Selected TVDB Entry Details</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Basic Info */}
                        <div>
                          <div className="flex items-start space-x-4">
                            <img
                              src={selectedTVDBForManual.image || "/assets/not found.jpg"}
                              alt={selectedTVDBForManual.title}
                              className="w-20 h-28 object-cover rounded"
                              onError={({currentTarget}) => {
                                currentTarget.onerror = null;
                                currentTarget.src = "/assets/not found.jpg";
                              }}
                            />
                            <div className="flex-1">
                              {(() => {
                                // Find English translation
                                const englishTranslation = selectedTVDBForManual.translations?.find((t: any) =>
                                  t.key?.toLowerCase() === 'eng' || t.key?.toLowerCase() === 'en'
                                );
                                const mainTitle = englishTranslation?.value || selectedTVDBForManual.title;
                                const originalTitle = selectedTVDBForManual.title;
                                const showOriginal = originalTitle && originalTitle !== mainTitle;

                                return (
                                  <>
                                    <h4 className="font-medium text-gray-900">{mainTitle}</h4>
                                    {showOriginal && (
                                      <p className="text-sm text-gray-600">Original: {originalTitle}</p>
                                    )}
                                  </>
                                );
                              })()}
                              {selectedTVDBForManual.year && (
                                <p className="text-sm text-gray-600">Year: {selectedTVDBForManual.year}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">TVDB ID: {selectedTVDBForManual.id}</p>
                            </div>
                          </div>
                        </div>

                        {/* Translations */}
                        {selectedTVDBForManual.translations && selectedTVDBForManual.translations.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Available Translations:</h5>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {selectedTVDBForManual.translations.map((translation: any, index: number) => (
                                <div key={index} className="text-xs bg-white rounded px-2 py-1">
                                  <span className="font-medium text-blue-600">{translation.key?.toUpperCase()}: </span>
                                  <span className="text-gray-800">{translation.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Season/Episode Information */}
                      {tvdbEpisodes?.getEpisodesFromTheTVDB && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Seasons & Episodes:</h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {tvdbEpisodes.getEpisodesFromTheTVDB.reduce((acc: any[], episode: any) => {
                              const seasonKey = `season-${episode.seasonNumber}`;
                              if (!acc.find(s => s.key === seasonKey)) {
                                const seasonEpisodes = tvdbEpisodes.getEpisodesFromTheTVDB?.filter(
                                  (ep: any) => ep.seasonNumber === episode.seasonNumber
                                ) || [];
                                const firstEpisode = seasonEpisodes.find((ep: any) => ep.airDate);
                                const lastEpisode = seasonEpisodes.slice().reverse().find((ep: any) => ep.airDate);

                                acc.push({
                                  key: seasonKey,
                                  number: episode.seasonNumber,
                                  episodeCount: seasonEpisodes.length,
                                  firstAired: firstEpisode?.airDate,
                                  lastAired: lastEpisode?.airDate
                                });
                              }
                              return acc;
                            }, []).map((season: any) => (
                              <div key={season.key} className="bg-white rounded border p-2">
                                <div className="text-xs font-medium text-gray-900">Season {season.number}</div>
                                <div className="text-xs text-gray-600">{season.episodeCount} episodes</div>
                                {season.firstAired && (
                                  <div className="text-xs text-gray-500">
                                    {format(new Date(season.firstAired), 'MMM yyyy')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Season Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Season for This Anime
                      </label>
                      <select
                        value={selectedSeasonForManual}
                        onChange={(e) => setSelectedSeasonForManual(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {tvdbEpisodes?.getEpisodesFromTheTVDB?.reduce((acc: number[], episode: any) => {
                          if (!acc.includes(episode.seasonNumber)) {
                            acc.push(episode.seasonNumber);
                          }
                          return acc;
                        }, []).map((season: number) => {
                          const seasonEpisodes = tvdbEpisodes.getEpisodesFromTheTVDB?.filter(
                            (ep: any) => ep.seasonNumber === season
                          ) || [];
                          const firstEpisode = seasonEpisodes.find((ep: any) => ep.airDate);
                          return (
                            <option key={season} value={season}>
                              Season {season} ({seasonEpisodes.length} episodes
                              {firstEpisode?.airDate && ` - ${format(new Date(firstEpisode.airDate), 'MMM yyyy')}`})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    color={ButtonColor.transparent}
                    showLabel={true}
                    label="Cancel"
                    onClick={() => setManualSearchAnime(null)}
                  />
                  <Button
                    color={ButtonColor.green}
                    showLabel={true}
                    label="Save Link"
                    onClick={saveManualLink}
                    disabled={!selectedTVDBForManual}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeasonalLinking;