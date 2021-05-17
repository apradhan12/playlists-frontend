export interface User {
    userId: string; // unique
    displayName: string;
    profilePictureURL: string;
    playlistIds: string[];
    followers: number;
    following: number;
}

export interface Playlist {
    id: string;
    title: string;
    pictureURL: string;
    description: string;
    songIds: string[];
    creator: string; // userId
    admins: string[]; // userIds
    addRequests: SongRequest[];
    removeRequests: SongRequest[];
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
}

export interface SongRequest {
    id: string;
    song: Song;
    usersVoted: string[]; // array of userIds
}
