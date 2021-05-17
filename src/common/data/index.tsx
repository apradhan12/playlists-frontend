import {Playlist, Song, User} from "../types";

export interface PlaylistMap {
    [key: string]: Playlist;
}

interface UserMap {
    [key: string]: User;
}

export const userMap: UserMap = {
    aaron1200: {
        userId: "aaron1200",
        displayName: "Aaron Pradhan",
        profilePictureURL: "/aaron1200.jpg",
        playlistIds: ["abc"],
        followers: 20,
        following: 31
    },
    joeiscool: {
        userId: "joeiscool",
        displayName: "Joe Adams",
        profilePictureURL: "/joe.jpg",
        playlistIds: [],
        followers: 39,
        following: 13
    },
    michelle1721: {
        userId: "michelle1721",
        displayName: "Michelle Thompson",
        profilePictureURL: "/michelle.jpg",
        playlistIds: [],
        followers: 1203,
        following: 101
    },
    noah2111: {
        userId: "noah2111",
        displayName: "Noah Smith",
        profilePictureURL: "/noah.jpg",
        playlistIds: [],
        followers: 12,
        following: 11
    },
    hci2021: {
        userId: "hci2021",
        displayName: "HCI Testing Account",
        profilePictureURL: "/hci.jpg",
        playlistIds: [],
        followers: 12,
        following: 42
    }
}

interface SongMap {
    [key: string]: Song;
}

export const songMap: SongMap = {
    "123": {
        id: "123",
        title: "(Don't Fear) The Reaper",
        artist: "Blue Öyster Cult",
        album: "Agents of Fortune",
        duration: 308
    },
    "456": {
        id: "456",
        title: "Don't Stop Me Now",
        artist: "Queen",
        album: "Jazz",
        duration: 209
    },
    "s1": {
        id: "s1",
        title: "Get Back",
        artist: "The Beatles",
        album: "Let It Be",
        duration: 187
    },
    "s2": {
        id: "s2",
        title: "Revolution",
        artist: "The Beatles",
        album: "The Beatles 1967 - 1970",
        duration: 205
    },
    "s3" : {
        id: "s3",
        title: "Bangarang",
        artist: "Skrillex",
        album: "Bang!",
        duration: 181
    },
    "s4" : {
        id: "s4",
        title: "Hero",
        artist: "Pegboard Nerds",
        album: "Hero",
        duration: 222
    },
    "s5" : {
        id: "s5",
        title: "Life in Grey",
        artist: "Point Point",
        album: "Contrastive Focus Reduplication",
        duration: 224
    },
    "s6" : {
        id: "s6",
        title: "Let it Be",
        artist: "The Beatles",
        album: "Let it Be",
        duration: 243
    },
    "s7" : {
        id: "s7",
        title: "Baby",
        artist: "Justin Bieber",
        album: "My World 2.0",
        duration: 215
    },
    "s8": {
        id: "s8",
        title: "Sonata Pathetique: Movement 1",
        artist: "Ludwig van Beethoven",
        album: "Beethoven: Piano Sonatas",
        duration: 400
    },
    "s9": {
        id: "s9",
        title: "Take Five",
        artist: "The Dave Brubeck Quartet",
        album: "Time Out",
        duration: 324
    }
}

export const playlistMap: PlaylistMap = {
    abc: {
        id: "abc",
        title: "60s/70s Rock",
        pictureURL: "/album.jpg",
        description: "Best rock songs of the 1960s and 1970s",
        songIds: ["123", "456", "s7"],
        owner: "aaron1200",
        admins: ["joeiscool", "michelle1721"],
        addRequests: [
            {
                id: "r1",
                song: songMap["s1"],
                usersVoted: ["jack1298", "carol1522", "hd123", "bigdolphin"]
            },
            {
                id: "r2",
                song: songMap["s2"],
                usersVoted: ["jack1298", "carol1522", "hd123"]
            }
        ],
        removeRequests: [
            {
                id: "r1",
                song: songMap["456"],
                usersVoted: ["jack1298", "carol1522", "hd123"]
            }
        ]
    },
    def: {
        id: "def",
        title: "Hype EDM",
        pictureURL: "/bike.jpg",
        description: "Big bass drops and crazy synths",
        songIds: ["s3"],
        owner: "hci2021",
        admins: ["joeiscool", "michelle1721"],
        addRequests: [
            {
                id: "r1",
                song: songMap["s4"],
                usersVoted: ["jack1298", "carol1522", "hd123", "bigdolphin"]
            },
            {
                id: "r2",
                song: songMap["s5"],
                usersVoted: ["jack1298", "carol1522", "hd123"]
            }
        ],
        removeRequests: []
    },
    classical: {
        id: "classical",
        title: "Classical music for studying",
        pictureURL: "/classical.jpg",
        description: "Relaxing classical music for studying - no lyrics",
        songIds: ["s8"],
        owner: "joeiscool",
        admins: [],
        addRequests: [],
        removeRequests: []
    },
    jazz: {
        id: "jazz",
        title: "Smooth Jazz",
        pictureURL: "/jazz.jpg",
        description: "Warm jazz for cool nights",
        songIds: ["s9"],
        owner: "michelle1721",
        admins: [],
        addRequests: [],
        removeRequests: []
    }
}
