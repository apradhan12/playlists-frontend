import React from 'react'
import { Col, Container, Row, Image, Table } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { playlistMap, userMap } from "../../common/data";

interface Props {
    match: {
        params: {
            userId: string;
        }
    }
}

export default class UserProfile extends React.Component<Props> {
    render() {
        const user = userMap[this.props.match.params.userId];
        const playlists = user.playlistIds.map(id => playlistMap[id]);
        return (
            <Container className="museo-300">
                <Row className="my-4">
                    <Col xs={4}>
                        <Image src={user.profilePictureURL} alt={`${user.displayName}'s profile`} fluid />
                    </Col>
                    <Col xs={8}>
                        <h1 className="museo-display-black">{user.displayName}</h1>
                        <p className="m-0">{user.followers} followers</p>
                        <p>{playlists.length} playlists</p>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h3 className="museo-display-light">User Playlists</h3>
                        <Table striped bordered hover className="museo-300">
                            <thead>
                            <tr>
                                <th>Title</th>
                                <th>Date Created</th>
                                <th>Number of Songs</th>
                                <th>Duration</th>
                            </tr>
                            </thead>
                            <tbody>
                                {
                                Array.from(Object.entries(playlistMap))
                                    .filter(([_, playlist]) => playlist.creator === user.userId)
                                    .map(([_, playlist]) => {
                                        return (
                                            <tr key={playlist.id}>
                                                <td><Link to={`/playlist/${playlist.id}`}>{playlist.title}</Link></td>
                                                <td>2021-03-30</td>
                                                <td>{playlist.songIds.length}</td>
                                                <td>9 min</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        )
    }
}

