import React, {useEffect} from 'react';
import {Button, Col, Container, Row, Table, Image} from "react-bootstrap";
import {addSongs, convertDate, secondsToHoursString, secondsToMinutesString, sum} from "../../common/utils";
import {Link} from "react-router-dom";
import {useHistory} from "react-router";
import axios from "axios";
import {Song} from "../../common/types";

interface Props {
    match: {
        params: {
            playlistId: string;
        }
    },
    loggedInUserId: string | null;
    appAccessToken: string | null;
}

interface Playlist {
    id: string;
    title: string;
    pictureURL: string;
    description: string;
    // songIds: string[];
    // owner: string; // userId
    // admins: string[]; // userIds
    [otherOptions: string]: any;
}

interface User {
    userId: string; // unique
    displayName: string;
    [otherOptions: string]: any;
}

export default function PlaylistPage(props: Props) {
    const history = useHistory();

    const [playlist, setPlaylist] = React.useState<Playlist | null>(null);
    const [owner, setOwner] = React.useState<User | null>(null);
    const [songs, setSongs] = React.useState<Song[]>([]);

    useEffect(() => {
        const accessToken = localStorage.getItem("sp-accessToken") || props.appAccessToken;
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
                setOwner({
                    userId: data.owner.id,
                    displayName: data.owner.display_name
                });

                setSongs([]);
                addSongs(setSongs, accessToken, data.tracks);
            });
        }
        // const playlist = playlistMap[props.match.params.playlistId];
        // const owner = userMap[playlist.owner];
        // const songs = playlist.songIds.map(id => songMap[id]);
    }, [props.match.params.playlistId, props.appAccessToken]);

    const addRequestCallback = () => history.push({
        pathname: `/playlist/${props.match.params.playlistId}/requests`,
        state: {showAddSong: true}
    });

    const removeRequestCallback = () => history.push({
        pathname: `/playlist/${props.match.params.playlistId}/requests`,
        state: {showRemoveSong: true}
    });

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
                        owner && <p className="museo-300 mb-0">Created by&nbsp;
                            {/*<Link to={`/users/${owner.userId}`}>*/}
                                {owner.displayName}
                            {/*</Link>*/}
                        </p>
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
                        owner && playlist && <>
                            {/* TODO: This should be based on areYouAdmin, not owner.userId */}
                            {
                            //     (owner.userId === props.loggedInUserId) ? (
                            //     <div>
                            //         <Link to={`/playlists/${playlist.id}/requests`}>
                            //             <Button variant="primary" className="museo-300 mb-2">Manage Song Requests</Button><br />
                            //         </Link>
                            //         <Link to={`/playlists/${playlist.id}/administrators`}>
                            //             <Button variant="outline-secondary" className="museo-300 mb-2">Manage Administrators</Button><br />
                            //         </Link>
                            //     </div>
                            // ) :
                                    (
                                <div>
                                    {/*<Button variant="outline-primary" className="museo-300 mb-2">*/}
                                    {/*    /!*onClick={props.loggedInUserId === undefined ? props.toggleLoginModal(addRequestCallback) : addRequestCallback}*!/*/}
                                    {/*    Request to add a song*/}
                                    {/*</Button>*/}
                                    {/*<br />*/}
                                    {/*<Button variant="outline-danger" className="museo-300 mb-2">*/}
                                    {/*    /!*onClick={props.loggedInUserId === undefined ? props.toggleLoginModal(removeRequestCallback) : removeRequestCallback}*!/*/}
                                    {/*    Request to remove a song*/}
                                    {/*</Button>*/}
                                    <Link to={`/playlists/${playlist.id}/requests`}>
                                        <Button variant="outline-primary" className="museo-300 mb-2">View song requests</Button><br />
                                    </Link>
                                    {/*<p className="museo-300 mb-2">If you're an admin of this playlist, log in to manage song requests.</p>*/}
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
                                    <td>{song.name}</td>
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
