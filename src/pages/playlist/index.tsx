import React, {useEffect} from 'react';
import {Button, Col, Container, Row, Table, Image} from "react-bootstrap";
import {playlistMap, songMap, userMap} from "../../common/data";
import {secondsToHoursString, secondsToMinutesString, sum} from "../../common/utils";
import {Link} from "react-router-dom";
import {useHistory} from "react-router";
import axios from "axios";

interface Props {
    match: {
        params: {
            playlistId: string;
        }
    },
    loggedInUsername?: string;
    toggleLoginModal: (callback?: () => void) => () => void;
}

interface Playlist {
    id: string;
    title: string;
    pictureURL: string;
    description: string;
    // songIds: string[];
    // creator: string; // username
    // admins: string[]; // usernames
    [otherOptions: string]: any;
}

interface User {
    username: string; // unique
    displayName: string;
    [otherOptions: string]: any;
}

interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    addedAt?: string; // todo: make this not optional
}

export default function PlaylistPage(props: Props) {
    const history = useHistory();

    const [playlist, setPlaylist] = React.useState<Playlist | null>(null);
    const [creator, setCreator] = React.useState<User | null>(null);
    const [songs, setSongs] = React.useState<Song[]>([]);

    useEffect(() => {
        if (playlistMap.hasOwnProperty(props.match.params.playlistId)) {
            const localPlaylist = playlistMap[props.match.params.playlistId];
            const localCreator = userMap[localPlaylist.creator];
            const localSongs = localPlaylist.songIds.map((id: string) => songMap[id]);
            setPlaylist(localPlaylist)
            setCreator(localCreator);
            setSongs(localSongs);
        } else {
            const accessToken = localStorage.getItem("sp-accessToken");
            if (accessToken !== null) {
                axios.get(`https://api.spotify.com/v1/playlists/${props.match.params.playlistId}`, {
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                }).then(response => {
                    const data = response.data;
                    setPlaylist({
                        id: props.match.params.playlistId,
                        title: data.name,
                        pictureURL: data.images[0].url,
                        description: data.description,
                        isExternal: true
                    });

                    console.log(`Display name: '${data.owner.display_name}'`);
                    setCreator({
                        username: data.owner.id,
                        displayName: data.owner.display_name
                    });

                    function getSongsFromTracks(tracks: any) {
                        return tracks.items.map((item: any) => ({
                            id: item.track.id,
                            title: item.track.name,
                            artist: item.track.artists.map((artist: any) => artist.name).join(", "),
                            album: item.track.album.name,
                            duration: Math.floor(item.track.duration_ms / 1000),
                            addedAt: item.added_at
                        }));
                        // TODO: use milliseconds for duration (more accurate)
                    }

                    function addSongs(tracks: any) {
                        setSongs(prevSongs => prevSongs.concat(getSongsFromTracks(tracks)));
                        if (tracks.total > tracks.limit + tracks.offset) {
                            console.log(`Querying ${tracks.next}`);
                            axios.get(tracks.next, {
                                headers: {
                                    'Authorization': 'Bearer ' + accessToken
                                }
                            }).then(response => {
                                const newTracks = response.data;
                                // console.log(JSON.stringify(newTracks));
                                addSongs(newTracks);
                            });
                        }
                    }
                    setSongs([]);
                    addSongs(data.tracks);
                });
            }
            // const playlist = playlistMap[props.match.params.playlistId];
            // const creator = userMap[playlist.creator];
            // const songs = playlist.songIds.map(id => songMap[id]);
        }
    }, [props.match.params.playlistId]);

    const addRequestCallback = () => history.push({
        pathname: `/playlist/${props.match.params.playlistId}/requests`,
        state: {showAddSong: true}
    });

    const removeRequestCallback = () => history.push({
        pathname: `/playlist/${props.match.params.playlistId}/requests`,
        state: {showRemoveSong: true}
    });

    function convertDate(date?: string) {
        if (date === undefined) {
            return "2021-03-30";
        }
        const parsedDate = new Date(date);
        const paddedMonth = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
        const paddedDate = parsedDate.getDate().toString().padStart(2, "0");
        return `${parsedDate.getFullYear()}-${paddedMonth}-${paddedDate}`;
    }

    return (
        <Container>
            <Row className="my-4">
                <Col xs={4}>
                    {playlist && <Image
                        src={playlist.isExternal ? playlist.pictureURL : (process.env.PUBLIC_URL + playlist.pictureURL)}
                        alt="Album cover" fluid/>
                    }
                </Col>
                <Col xs={4}>
                    <p className="museo-display-light m-0">Playlist</p>
                    <h1 className="museo-display-black">{playlist ? playlist.title : ""}</h1>
                    {
                        creator && <p className="museo-300 mb-0">Created by <Link to={`/user/${creator.username}`}>{creator.displayName}</Link></p>
                    }
                    <p className="museo-300 italic">{songs.length} {songs.length === 1 ? "song" : "songs"}, {secondsToHoursString(sum(songs.map(song => song.duration)))}</p>
                    <Button 
                        variant="outline-dark" 
                        className="museo-300" 
                        onClick={() => {
                            let link = window.location.href
                            navigator.clipboard.writeText(link).then(() => {
                                alert('Playlist link copied to clipboard!')
                            })
                    }}>
                        Share
                    </Button>
                </Col>
                <Col xs={4} className="text-right">
                    {
                        creator && playlist && <>
                            { (creator.username === props.loggedInUsername) ? (
                                <div>
                                    <Link to={`/playlist/${playlist.id}/requests`}>
                                        <Button variant="primary" className="museo-300 mb-2">Manage Song Requests</Button><br />
                                    </Link>
                                    <Link to={`/playlist/${playlist.id}/admins`}>
                                        <Button variant="outline-secondary" className="museo-300 mb-2">Manage Administrators</Button><br />
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    <Button variant="outline-primary" className="museo-300 mb-2"
                                            onClick={props.loggedInUsername === undefined ? props.toggleLoginModal(addRequestCallback) : addRequestCallback}>
                                        Request to add a song
                                    </Button>
                                    <br />
                                    <Button variant="outline-danger" className="museo-300 mb-2"
                                            onClick={props.loggedInUsername === undefined ? props.toggleLoginModal(removeRequestCallback) : removeRequestCallback}>
                                        Request to remove a song
                                    </Button>
                                    <Link to={`/playlist/${playlist.id}/requests`}>
                                        <Button variant="outline-secondary" className="museo-300 mb-2">View song requests</Button><br />
                                    </Link>
                                    <p className="museo-300 mb-2">If you're an admin of this playlist, log in to manage song requests.</p>
                                </div>
                            )}
                        </>
                    }
                </Col>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover className="museo-300">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Artist</th>
                            <th>Album</th>
                            <th>Date Added</th>
                            <th>Duration</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            Array.from(songs.entries()).map(([i, song]) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>{song.title}</td>
                                    <td>{song.artist}</td>
                                    <td>{song.album}</td>
                                    <td>{convertDate(song.addedAt)}</td>
                                    <td>{secondsToMinutesString(song.duration)}</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
}
