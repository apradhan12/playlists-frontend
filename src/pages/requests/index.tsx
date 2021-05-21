import React, {Component, SetStateAction} from 'react';
import { Alert, Button, Col, Container, Form, FormControl, Modal, Row, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import {addSongs, convertDate, secondsToMinutesString} from "../../common/utils";
import "./style.css";
import { ChangeEvent } from 'react';
import axios from "axios";
import {Song} from "../../common/types";

interface RequestsTableProps {
    requests: SongRequest[];
    adminPermissions: boolean;
    handleUpdateRequestStatus: (requestId: number, isApproved: boolean) => () => void;
    removeVote: (requestId: number) => () => void;
    addVote: (requestId: number) => () => void;
    loggedInUserId: string | null;
}

const play = (songId: string) => {
    axios({
        url: "https://api.spotify.com/v1/me/player/devices",
        method: "GET",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("sp-accessToken")}`
        }
    }).then(response => {
        console.log("song");
        console.log(songId);
        axios({
            url: `https://api.spotify.com/v1/me/player/play?device_id=${response.data.devices.filter((device: any) => device.name === "Web Playback SDK Quick Start Player")[0].id}`,
            method: 'PUT',
            data: {uris: [`spotify:track:${songId}`]},
            headers: {
                Authorization: `Bearer ${localStorage.getItem("sp-accessToken")}`
            }
        });
    });
};

class RequestsTable extends Component<RequestsTableProps> {
    render() {
        const headers = [
            ["#", 1],
            ["Title", 2],
            ["Artist", 2],
            ["Album", 2],
            ["Date Added", 1],
            ["Duration", 1],
            ["Votes", 1],
            ["Actions", 2]
        ];
        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                        {headers.map(header => <th className={`customHeader-${header[1]}`}>{header[0]}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {
                        Array.from(this.props.requests.entries()).map(([i, request]) => (
                            <tr key={request.requestId}>
                                <td>
                                    {i + 1}<br />
                                    <Button variant="primary" onClick={
                                        () => {
                                            console.log(window);
                                            // @ts-ignore
                                            play(request.songId);
                                        }}>
                                        Play song
                                    </Button>
                                </td>
                                <td>{request.title}</td>
                                <td>{request.artist}</td>
                                <td>{request.album}</td>
                                <td>{convertDate(request.dateAdded)}</td>
                                <td>{secondsToMinutesString(Math.floor(request.duration / 1000))}</td>
                                <td>{request.numVotes}</td>
                                <td>
                                    { // onClick={this.props.loggedInUserId === undefined ? this.props.toggleLoginModal(this.props.addVote(request.requestId)) : this.props.addVote(request.requestId) }
                                        this.props.adminPermissions ? <>
                                                <Button variant="primary"
                                                        onClick={this.props.handleUpdateRequestStatus(request.requestId, true)}>
                                                    Accept Request
                                                </Button>
                                                <Button variant="danger"
                                                        onClick={this.props.handleUpdateRequestStatus(request.requestId, false)}>
                                                    Reject Request
                                                </Button>
                                            </> :
                                            (request.hasYourVote ?
                                                <Button variant="outline-secondary"
                                                        onClick={this.props.removeVote(request.requestId)}>
                                                    Remove Vote for Request
                                                </Button> :
                                                <Button variant="outline-secondary" onClick={this.props.addVote(request.requestId)}>
                                                    Vote for Request
                                                </Button>)
                                    }
                                </td>
                            </tr>
                        ))
                    }
                    {this.props.requests.length === 0 && <tr><td colSpan={headers.length}>There are currently no requests.{!this.props.adminPermissions && " Why not make one?"}</td></tr>}
                </tbody>
            </Table>
        );
    }
}

interface Props {
    match: {
        params: {
            playlistId: string;
        }
    }
    location: {
        state?: LocationState;
    },
    loggedInUserId: string | null;
    history: any; // todo fix this
    appAccessToken: string | null;
}

interface State {
    showAddSong: boolean;
    showRemoveSong: boolean;
    addSearchQuery: string;
    selectedAddSong: Song | null;
    addSearchFocused: boolean;
    removeSongIds: string[];
    recentAddSongRequest: boolean;
    recentRemoveSongRequest: boolean;

    playlist?: Playlist;
    owner?: User;
    songs: Song[];

    areYouAdmin?: boolean;
    addRequests?: SongRequest[];
    removeRequests?: SongRequest[];

    results: any[];
}

interface SongRequest {
    requestId: number;
    songId: string;
    title: string;
    artist: string;
    album: string;
    dateAdded: string;
    duration: number;
    numVotes: number;
    hasYourVote: boolean;
}

export interface Playlist {
    id: string;
    title: string;
    pictureURL: string;
    description: string;
    ownerId: string;
    [otherOptions: string]: any;
}

interface User {
    userId: string; // unique
    displayName: string;
    [otherOptions: string]: any;
}

interface LocationState {
    showAddSong?: boolean;
    showRemoveSong?: boolean;
}

const REMOVE_REQUEST_TH_LABELS = {
    "#": 1,
    "Title": 2,
    "Artist": 2,
    "Album": 2,
    "Date Added": 2,
    "Duration": 1,
    "Actions": 2
}

export default class RequestsPage extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showAddSong: (this.props.location.state !== undefined) && (this.props.location.state.showAddSong === true),
            showRemoveSong: (this.props.location.state !== undefined) && (this.props.location.state.showRemoveSong === true),
            addSearchQuery: "",
            selectedAddSong: null,
            addSearchFocused: false,
            removeSongIds: [],
            recentAddSongRequest: false,
            recentRemoveSongRequest: false,
            playlist: undefined,
            owner: undefined,
            songs: [],
            results: []
        }
        this.toggleAddSong = this.toggleAddSong.bind(this);
        this.toggleRemoveSong = this.toggleRemoveSong.bind(this);
        this.updateSearchQuery = this.updateSearchQuery.bind(this);
        this.handleUpdateRequestStatus = this.handleUpdateRequestStatus.bind(this);
        this.removeVote = this.removeVote.bind(this);
        this.addVote = this.addVote.bind(this);
        this.populateRequests = this.populateRequests.bind(this);
    }

    toggleAddSong() {
        this.setState(prevState => ({ addSearchQuery: "", addSearchFocused: false, selectedAddSong: null, showAddSong: !prevState.showAddSong }));
    }

    toggleRemoveSong() {
        this.setState(prevState => ({ removeSongIds: [], showRemoveSong: !prevState.showRemoveSong }));
    }

    addVote(requestId: number) {
        return () => {
            axios({
                method: "POST",
                url: `http://localhost:8888/playlists/${this.props.match.params.playlistId}/requests/${requestId}/vote`,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("sp-accessToken")}`
                }
            }).then(response => {
                this.populateRequests(localStorage.getItem("sp-accessToken")!!);
            });
        };
    }

    removeVote(requestId: number) {
        return () => {
            axios({
                method: "DELETE",
                url: `http://localhost:8888/playlists/${this.props.match.params.playlistId}/requests/${requestId}/vote`,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("sp-accessToken")}`
                }
            }).then(response => {
                this.populateRequests(localStorage.getItem("sp-accessToken")!!);
            });
        };
    }

    updateSearchQuery(event: ChangeEvent<HTMLInputElement>) {
        this.setState({
            addSearchQuery: event.target.value
        });
        axios.get("https://api.spotify.com/v1/search", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("sp-accessToken")}`
            },
            params: {
                q: event.target.value,
                type: "track"
            }
            // todo: include market?
        }).then(response => {
            const tracks: Song[] = response.data.tracks.items.map((item: any) => ({
                album: item.album.name,
                id: item.id,
                name: item.name,
                artist: item.artists.map((artist: any) => artist.name).join(", "),
                duration: Math.floor(item.duration_ms / 1000)
            })).slice(0, 10);
            this.setState({
                results: tracks
            });
        });
    }

    handleUpdateRequestStatus(requestId: number, isApproved: boolean) {
        return () => {
            axios({
                method: "PUT",
                url: `http://localhost:8888/playlists/${this.props.match.params.playlistId}/requests/${requestId}`,
                data: {
                    status: isApproved ? "approved" : "rejected"
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("sp-accessToken")}`
                }
            }).then(response => {
                this.populateRequests(localStorage.getItem("sp-accessToken")!!);
            })
        }
    }

    populateRequests(accessToken: string) {

        axios.get(`http://localhost:8888/playlists/${this.props.match.params.playlistId}/requests`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        }).then(response => {

            interface SongRequestList {
                areYouAdmin: boolean;
                addRequests: SongRequest[];
                removeRequests: SongRequest[];
            }

            const data: SongRequestList = response.data;
            // TODO: create types (just copy/paste from types.ts and modify to use nullable/optional)
            // TODO: convert playlist, songs, owner consts in render() method to tolerate undefined,
            // and use state instead of these consts
            // TODO: translate API response properties into the needed data
            this.setState({
                areYouAdmin: data.areYouAdmin,
                addRequests: data.addRequests,
                removeRequests: data.removeRequests
            });
        });
    }

    componentDidMount() {
        const accessToken = localStorage.getItem("sp-accessToken") || this.props.appAccessToken;
        if (accessToken !== null) {
            axios.get(`https://api.spotify.com/v1/playlists/${this.props.match.params.playlistId}`, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            }).then(response => {
                // todo: catch private playlists?
                const data = response.data;
                this.setState({
                    playlist: {
                        id: this.props.match.params.playlistId,
                        title: data.name,
                        pictureURL: data.images[0].url,
                        description: data.description,
                        ownerId: data.owner.id,
                        isExternal: true
                    }
                });

                console.log(`Display name: '${data.owner.display_name}'`);
                this.setState({
                    owner: {
                        userId: data.owner.id,
                        displayName: data.owner.display_name
                    }
                });

                this.setState({songs: []});
                // todo: get rid of this
                const setSongs = (nextSongsStateAction: SetStateAction<Song[]>) => {
                    if (Array.isArray(nextSongsStateAction)) {
                        this.setState({
                            songs: nextSongsStateAction
                        });
                    } else {
                        this.setState((prevState: State) => ({
                            songs: nextSongsStateAction(prevState.songs)
                        }));
                    }
                }
                addSongs(setSongs, accessToken, data.tracks);
            });

            this.populateRequests(accessToken);
        }
    }

    render() {
        // replace instead of push because you can't push the same path
        const addRequestCallback = () => this.props.history.replace({
            state: {showAddSong: true}
        });

        const removeRequestCallback = () => this.props.history.replace({
            state: {showRemoveSong: true}
        });

        const finishRequestingSongAdditions = () => {
            // todo
            if (this.state.playlist !== undefined) {
                if (this.state.selectedAddSong) {
                    axios({
                        method: 'post',
                        url: `http://localhost:8888/playlists/${this.props.match.params.playlistId}/requests`,
                        data: {
                            songsToAdd: [this.state.selectedAddSong.id],
                            songsToRemove: []
                        },
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("sp-accessToken")}`
                        }
                    }).then(response => {
                        console.log("success");
                        this.populateRequests(localStorage.getItem("sp-accessToken")!!);
                        // todo: make the "recentAddSongRequest" a callback for after the requests have been populated?
                        this.setState({addSearchQuery: "", addSearchFocused: false, selectedAddSong: null, showAddSong: false, recentAddSongRequest: true});
                        // todo don't do this unless there's a selected add song
                        setTimeout(function() {
                            //@ts-ignore (sorry!)
                            this.setState({recentAddSongRequest: false})
                        }.bind(this), 3000);
                    }); // todo catch
                }
            }
        };

        const finishRequestingSongRemovals = () => {
            // todo
            if (this.state.playlist !== undefined) {
                axios({
                    method: "post",
                    url: `http://localhost:8888/playlists/${this.props.match.params.playlistId}/requests`,
                    data: {
                        songsToAdd: [],
                        songsToRemove: this.state.removeSongIds
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("sp-accessToken")}`
                    }
                }).then(response => {
                    console.log("success");
                    console.log(response);
                    // todo: make the "recentAddSongRequest" a callback for after the requests have been populated?
                    this.populateRequests(localStorage.getItem("sp-accessToken")!!);

                    // todo: should I move this out of the "then" block?
                    this.setState({addSearchQuery: "", addSearchFocused: false, removeSongIds: [], showAddSong: false, recentRemoveSongRequest: true, showRemoveSong: false});
                    setTimeout(function() {
                        //@ts-ignore (sorry!)
                        this.setState({recentRemoveSongRequest: false})
                    }.bind(this), 3000);
                });
            }
        };

        console.log(`Playlist ${this.state.playlist} owner ${this.state.owner}`);

        return (
            <Container className="museo-300">
                <Row className="mt-4">
                    <Col xs={12}>
                        <Link to={`/playlists/${this.props.match.params.playlistId}`}>&#8592; Go back to playlist</Link>
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col xs={8}>
                        <h1 className="museo-display-black">Song Requests</h1>
                        {
                            this.state.playlist && this.state.owner && <>
                                Playlist: <Link
                                to={`/playlists/${this.props.match.params.playlistId}`}>{this.state.playlist.title}</Link> by&nbsp;
                                {/*<Link to={`/users/${this.state.owner.userId}`}>*/}
                                    {this.state.owner.displayName}
                                {/*</Link>*/}
                            </>
                        }
                    </Col>
                    <Col xs={4} className="text-right">
                        {this.state.owner && this.state.owner.userId !== this.props.loggedInUserId &&
                        (
                            <div>
                                <Button variant="outline-primary" className="museo-300 mb-2"
                                        onClick={this.toggleAddSong}
                                >
                                    {/*onClick={this.props.loggedInUserId === undefined ? this.props.toggleLoginModal(addRequestCallback) : this.toggleAddSong}*/}
                                    Request to add a song
                                </Button>
                                <br />
                                <Button variant="outline-danger" className="museo-300 mb-2"
                                        onClick={this.toggleRemoveSong}
                                >
                                    {/*onClick={this.props.loggedInUserId === undefined ? this.props.toggleLoginModal(removeRequestCallback) : this.toggleRemoveSong}*/}
                                    Request to remove a song
                                </Button>
                            </div>
                        )}
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col>
                        <h2 className="museo-display-light">Add Song Requests</h2>
                        <Alert variant="success" show={this.state.recentAddSongRequest}>
                            Your request to add a song from the playlist was made successfully.
                        </Alert>
                        <RequestsTable handleUpdateRequestStatus={this.handleUpdateRequestStatus}
                                       adminPermissions={this.state.areYouAdmin || (this.state.playlist && this.props.loggedInUserId === this.state.playlist.ownerId) || false}
                                       requests={this.state.addRequests || []}
                                       removeVote={this.removeVote}
                                       addVote={this.addVote}
                                       loggedInUserId={this.props.loggedInUserId}
                        />
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col>
                        <h2 className="museo-display-light">Remove Song Requests</h2>
                        <Alert variant="success" show={this.state.recentRemoveSongRequest}>
                            Your request to remove a song from the playlist was made successfully.
                        </Alert>
                        <RequestsTable handleUpdateRequestStatus={this.handleUpdateRequestStatus}
                                       adminPermissions={this.state.areYouAdmin || (this.state.playlist && this.props.loggedInUserId === this.state.playlist.ownerId) || false}
                                       requests={this.state.removeRequests || []}
                                       removeVote={this.removeVote}
                                       addVote={this.addVote}
                                       loggedInUserId={this.props.loggedInUserId}
                        />
                    </Col>
                </Row>

                <Modal show={this.state.showAddSong} animation={false} dialogClassName="larger-width-modal museo-300" backdrop="static">
                    <Modal.Header>
                        <Modal.Title className="museo-display-black">Request to add a song</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-3">
                        <Form
                            onFocus={() => this.setState({ addSearchFocused: true })}
                        >
                            <FormControl
                                autoFocus
                                className="my-2 w-auto"
                                placeholder="Type the song title here..."
                                value={this.state.addSearchQuery}
                                onChange={this.updateSearchQuery}
                            />
                            {
                                (this.state.addSearchQuery && (!this.state.selectedAddSong || this.state.addSearchFocused)) ?
                                    (
                                        <Table className="mx-3 w-auto">
                                            <thead>
                                                <tr>
                                                    <th>Song</th>
                                                    <th>Artist</th>
                                                    <th>Album</th>
                                                    <th>Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    Array.from(Object.entries(this.state.results))
                                                        .map(([_, song]) => (
                                                            <tr role="button"
                                                                style={{
                                                                    display: "table-row",
                                                                    width: "100%",
                                                                    padding: ".25rem 1.5rem",
                                                                    clear: "both",
                                                                    fontWeight: 400,
                                                                    color: "#212529",
                                                                    textAlign: "inherit",
                                                                    backgroundColor: "transparent",
                                                                    border: 0
                                                                }}
                                                                onClick={() => this.setState({ selectedAddSong: song, addSearchFocused: false })}
                                                                key={song.id}
                                                            >
                                                                <td>{song.name}</td>
                                                                <td>{song.artist}</td>
                                                                <td>{song.album}</td>
                                                                <td>{secondsToMinutesString(song.duration)}</td>
                                                            </tr>
                                                        ))
                                                }
                                            </tbody>
                                        </Table>
                                    )
                                    : ""
                            }
                            {
                                this.state.selectedAddSong ? this.state.selectedAddSong.name : ""
                            }
                        </Form>
                    </Modal.Body>
                    <Modal.Footer style={{ justifyContent: "flex-end" }}>
                        <Button variant="outline-secondary" onClick={this.toggleAddSong}>
                            Cancel and Close
                        </Button>
                        {
                            this.state.selectedAddSong ? (
                                <Button variant="primary" onClick={finishRequestingSongAdditions}>
                                    Request this song
                                </Button>
                            ) : ""
                        }
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showRemoveSong} animation={false} dialogClassName="larger-width-modal museo-300" backdrop="static">
                    <Modal.Header>
                        <Modal.Title className="museo-display-black">Request to remove a song</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    {
                                        Array.from(Object.entries(REMOVE_REQUEST_TH_LABELS)).map(([label, colWidth]) =>
                                            <th key={label} className={"customHeader-" + colWidth}>{label}</th>
                                        )
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    Array.from(this.state.songs.entries()).map(([i, song]: [number, any]) => (
                                        this.state.removeSongIds.includes(song.id) ? (
                                            <tr key={song.id}>
                                                <td colSpan={Object.keys(REMOVE_REQUEST_TH_LABELS).length}>
                                                    You requested to remove {song.name}.&nbsp;
                                                <Button
                                                        variant="outline-secondary"
                                                        onClick={() => this.setState(prevState => ({ removeSongIds: prevState.removeSongIds.filter(id => id !== song.id) }))}
                                                    >
                                                        Undo
                                                </Button>
                                                </td>
                                            </tr>
                                        ) : (
                                                <tr key={song.id}>
                                                    <td>{i + 1}</td>
                                                    <td>{song.name}</td>
                                                    <td>{song.artist}</td>
                                                    <td>{song.album}</td>
                                                    <td>2021-03-30</td>
                                                    <td>{secondsToMinutesString(song.duration)}</td>
                                                    <td><Button variant="outline-danger" onClick={() => this.setState(prevState => {
                                                        if (!prevState.removeSongIds.includes(song.id)) {
                                                            return { removeSongIds: prevState.removeSongIds.concat(song.id) };
                                                        }
                                                        return { removeSongIds: prevState.removeSongIds };
                                                    })}>Request to remove</Button></td>
                                                </tr>
                                            )
                                    ))
                                }
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer style={{ justifyContent: "flex-end" }}>
                        <Button variant="outline-secondary" onClick={this.toggleRemoveSong}>
                            Cancel and Close
                        </Button>
                        <Button variant="primary" onClick={finishRequestingSongRemovals}>
                            Finish requesting song removals
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }
}