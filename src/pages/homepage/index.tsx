import React from 'react'
import { Col, Container, Row, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PlaylistSearchBar from '../../common/components/PlaylistSearchBar';
import axios from "axios";
import _ from "lodash";

interface Props {}

interface State {
    playlists?: Playlist[];
    playlistsYouOwn: Playlist[];
    playlistsYouFollow: Playlist[];
}

interface SpotifyImage {
    height: number;
    width: number;
    url: string;
}

interface Playlist {
    description: string;
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    images: SpotifyImage[];
    name: string;
    owner: SpotifyUser;
    public: boolean;
    tracks: SpotifyPlaylistTracks;
    type: string; // "playlist", probably
    [otherOptions: string]: any;
}

interface SpotifyUser {
    "display_name": string;
    "external_urls": {
        "spotify": string
    };
    "href": string;
    "id": string;
    "type": string; // "user" or "artist" perhaps?
}

interface SpotifyPlaylistTracks {
    "href": string;
    "total": number;
}

function PlaylistsDisplay(props: {playlists: any[]}) {
    return (
        <>
            {props.playlists && props.playlists.map(playlist => (
                <Col xs="3" style={{padding: ".5em"}} key={playlist.id}>
                    <Link to={`/playlist/${playlist.id}`}>
                        <div style={{
                            boxShadow: "1px 1px 10px gray",
                            padding: ".75em",
                            borderRadius: "10px",
                            height: "100%"
                        }}>
                            <Image className="mb-3" fluid src={playlist.images[0].url}/>
                            <p className="mb-1 museo-700">{playlist.name}</p>
                            <p className="mb-1">{playlist.owner.display_name}</p>
                            <p className="mb-1">{playlist.tracks.total} {playlist.tracks.total === 1 ? "song" : "songs"}</p>
                        </div>
                    </Link>
                </Col>
            ))}
        </>
    );
}

class Homepage extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            playlists: undefined,
            playlistsYouOwn: [],
            playlistsYouFollow: []
        };
    }

    componentDidMount() {
        const accessToken = localStorage.getItem("sp-accessToken");
        if (accessToken !== null) {
            // // @ts-ignore
            // const queryParams: Params = window.location.search.slice(1).split("&").reduce(
            //     (accumulator, currentValue) => {
            //         const pair = currentValue.split("=");
            //         return {...accumulator, [pair[0]]: pair[1]}
            //     }, {});
            axios.get("https://api.spotify.com/v1/me/playlists", {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                },
                params: {
                    limit: 50 // todo: continue requesting w pagination if exceeds limit
                }
            }).then(response => {
                const playlists: Playlist[] = response.data.items;
                const [playlistsYouOwn, playlistsYouFollow] = _.partition(playlists, (playlist: any) => playlist.owner.id === localStorage.getItem("sp-userId"));
                this.setState({
                    playlists: playlists,
                    playlistsYouOwn: playlistsYouOwn,
                    playlistsYouFollow: playlistsYouFollow
                });
                console.log(JSON.stringify(response.data));
            });
        }
    }

    render() {
        return (
            <Container className="museo-300">
                <Row>
                    <Col className="text-left d-flex flex-column justify-content-center align-items-center" style={{height: "50vh"}}>
                        <h1 className="museo-display-black mb-3">
                            Spotify Collaborative Playlists
                        </h1>
                        {/*<PlaylistSearchBar placeholder="Search for playlists..." dark={true}/>*/}
                    </Col>
                </Row>
                {
                    this.state.playlists && <>
                        <Row>
                            <Col>
                                <h3 className="museo-display-light mb-1">Playlists you own</h3>
                                <hr style={{border: "1px solid lightgrey"}} />
                            </Col>
                        </Row>
                        <Row>
                            <PlaylistsDisplay playlists={this.state.playlistsYouOwn} />
                        </Row>
                        <Row>
                            <Col>
                                <h3 className="museo-display-light mb-1 mt-3">Playlists you follow</h3>
                                <hr style={{border: "1px solid lightgrey"}} />
                            </Col>
                        </Row>
                        <Row>
                            <PlaylistsDisplay playlists={this.state.playlistsYouFollow} />
                        </Row>
                    </>
                }


                {/*<Row>*/}
                {/*    <Col xs={12}>*/}
                {/*        <h3 className="museo-display-light mb-1 mt-3">*/}
                {/*            Recommended Playlists*/}
                {/*        </h3>*/}
                {/*        <hr style={{border: "1px solid lightgrey"}} />*/}
                {/*    </Col>*/}
                {/*</Row>*/}
                {/*<Row>*/}
                {/*    { Array.from(Object.entries(playlistMap))*/}
                {/*        .slice(0, 4)*/}
                {/*        .map(([_, playlist]) => {*/}
                {/*            return (   */}
                {/*                <Col xs="3" style={{padding: ".5em"}} key={playlist.id}>*/}
                {/*                    <Link to={`/playlist/${playlist.id}`}>*/}
                {/*                        <div style={{boxShadow: "1px 1px 10px gray", padding: ".75em", borderRadius: "10px", height: "100%"}}> */}
                {/*                            <Image className="mb-3" fluid src={process.env.PUBLIC_URL + playlist.pictureURL} />*/}
                {/*                            <p className="mb-1 museo-700">{playlist.title}</p>*/}
                {/*                            <p className="mb-1">{userMap[playlist.owner].displayName}</p>*/}
                {/*                            <p className="mb-1">{playlist.songIds.length} {playlist.songIds.length === 1 ? "song" : "songs"}</p>*/}
                {/*                        </div>*/}
                {/*                    </Link>*/}
                {/*                </Col>*/}
                {/*            )*/}
                {/*        })*/}


                {/*    }*/}
                {/*</Row>*/}
            </Container>
        )
    }
}

export default Homepage;