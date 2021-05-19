import React from "react";
import axios from "axios";
import {Song} from "./types";

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

export function secondsToMinutesString(seconds: number) {
    return `${Math.floor(seconds / SECONDS_PER_MINUTE)}:${(seconds % SECONDS_PER_MINUTE).toString().padStart(2, "0")}`;
}

export function secondsToHoursString(seconds: number) {
    return `${Math.floor(seconds / (SECONDS_PER_MINUTE * MINUTES_PER_HOUR))} hr ${(Math.floor(seconds % (SECONDS_PER_MINUTE * MINUTES_PER_HOUR) / SECONDS_PER_MINUTE))} min`;
}

export function sum(nums: number[]) {
    return nums.reduce((a, b) => a + b, 0)
}

export function convertDate(date?: string) {
    if (date === undefined) {
        return "2021-03-30";
    }
    const parsedDate = new Date(date);
    const paddedMonth = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
    const paddedDate = parsedDate.getDate().toString().padStart(2, "0");
    return `${parsedDate.getFullYear()}-${paddedMonth}-${paddedDate}`;
}

function getSongsFromTracks(tracks: any) {
    return tracks.items.map((item: any) => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists.map((artist: any) => artist.name).join(", "),
        album: item.track.album.name,
        duration: Math.floor(item.track.duration_ms / 1000),
        addedAt: item.added_at
    }));
    // TODO: use milliseconds for duration (more accurate)
}

export function addSongs(setSongs: React.Dispatch<React.SetStateAction<Song[]>>, accessToken: string, tracks: any) {
    setSongs(prevSongs => prevSongs.concat(getSongsFromTracks(tracks)));
    if (tracks.total > tracks.limit + tracks.offset) {
        console.log(`Querying ${tracks.next}`);
        axios.get(tracks.next, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        }).then(response => {
            const newTracks = response.data;
            addSongs(setSongs, accessToken, newTracks);
        });
    }
}
