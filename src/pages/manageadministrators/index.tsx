import React from 'react'
import { Button, Container, Row, Col, Modal, Form, FormControl, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { playlistMap, userMap } from "../../common/data";
import { ChangeEvent } from 'react';

interface Props {
    match: {
        params: {
            playlistId: string;
        }
    }
}

interface State {
    showHide: boolean;
    showHideRemove: boolean;
    searchQuery: string;
    selectedAdminUserId: string;
    searchFocused: boolean;
    removeAdminUserIds: string[];
}

export default class ManageAdmin extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            showHide: false,
            showHideRemove: false,
            searchQuery: "",
            selectedAdminUserId: "",
            searchFocused: false,
            removeAdminUserIds: []
        };
        this.handleModalShowHide = this.handleModalShowHide.bind(this);
        this.updateSearchQuery = this.updateSearchQuery.bind(this);
    }

    handleModalShowHide() {
        this.setState({ showHide: !this.state.showHide })
    }

    updateSearchQuery(event: ChangeEvent<HTMLInputElement>) {
        this.setState({
            searchQuery: event.target.value
        });
    }

    render() {
        const playlist = playlistMap[this.props.match.params.playlistId];
        const owner = userMap[playlist.owner];
        return (
            <Container className="museo-300">
                <Row className="my-4">
                    <Col xs={12}>
                        <Link to={`/playlists/${playlist.id}`}>&#8592; Go back to playlist</Link>
                        <h1 className="museo-display-black">Manage Administrators</h1>
                        <p>Playlist: <Link to={`/playlists/${playlist.id}`}>{playlist.title}</Link> by <Link to={`/user/${owner.userId}`}>{owner.displayName}</Link></p>
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col xs={12}>
                        <h3 className="museo-display-light">Current Administrators</h3>
                        {playlist.admins.length > 0 && 
                            <ul>
                                {playlist.admins.map((adminName) => (
                                    <li key={adminName}>
                                        <p className="m-0">{adminName}</p>
                                    </li>
                                ))}
                            </ul>
                        }
                        {!(playlist.admins.length > 0) && <p>There are no admins for this playlist. Add one to help manage requests.</p>}
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col xs={12}>
                        <Button variant="primary" onClick={() => this.handleModalShowHide()}>Add new Administrator</Button>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Button variant="danger" onClick={() => this.setState({showHideRemove: true})}>Remove an Administrator</Button>
                    </Col>
                </Row>

                <Modal show={this.state.showHide} backdrop="static" dialogClassName="museo-300">
                    <Modal.Header onClick={() => this.handleModalShowHide()}>
                        <Modal.Title className="museo-display-black">Add an Administrator</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onFocus={() => this.setState({ searchFocused: true })}>
                            <FormControl autoFocus
                                className="mx-3 my-2 w-auto"
                                placeholder="Type a userId..."
                                value={this.state.searchQuery}
                                onChange={this.updateSearchQuery} />
                            {
                                (this.state.searchQuery && (!this.state.selectedAdminUserId || this.state.searchFocused)) ?
                                    (
                                        <Table className="mx-3 w-auto">
                                            <thead>
                                                <tr>
                                                    <th>Users</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    Array.from(Object.entries(userMap))
                                                        .filter(([_, user]) =>
                                                            user.userId.toLowerCase().includes(this.state.searchQuery.toLowerCase()) && !playlist.admins.includes(user.userId))
                                                        .map(([_, user]) => (
                                                            <tr className="dropdown-item"
                                                                role="button"
                                                                style={{ display: "table-row" }}
                                                                onClick={() => { this.setState({ selectedAdminUserId: user.userId, searchFocused: false }); console.log(user.userId) }}
                                                            >
                                                                <td>{user.userId}</td>
                                                            </tr>
                                                        ))
                                                }
                                            </tbody>
                                        </Table>
                                    )
                                    : ""
                            }
                            {
                                this.state.selectedAdminUserId ? userMap[this.state.selectedAdminUserId].userId : ""
                            }
                            {/* <Button variant="secondary" style={{ borderRadius: "0px 5px 5px 0px", borderLeft: "none" }}>Search</Button> */}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer style={{ justifyContent: "flex-end" }}>
                        <Button variant="secondary" onClick={() => { this.setState({ searchQuery: "", searchFocused: false, selectedAdminUserId: "", showHide: false }) }}>
                            Close this window
                        </Button>
                        {
                            this.state.selectedAdminUserId ? (
                                <Button variant="primary" onClick={() => {
                                    playlistMap[playlist.id].admins.push(userMap[this.state.selectedAdminUserId].userId);
                                    this.setState({searchQuery: "", searchFocused: false, selectedAdminUserId: "", showHide: false});
                                }}>
                                    Add Administrator
                                </Button>
                            ) : ""
                        }
                    </Modal.Footer>
                </Modal>


                <Modal show={this.state.showHideRemove} backdrop="static" dialogClassName="museo-300 larger-width-modal">
                    <Modal.Header>
                        <Modal.Title className="museo-display-black">Remove an Administrator</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                            <th className="width-50">UserId</th>
                            <th className="width-50">Actions</th>
                            </tr>
                            </thead>
                            <tbody>{playlist.admins.map((adminName) => (
                                this.state.removeAdminUserIds.includes(adminName) ? (
                                        <tr key={adminName}>
                                            <td colSpan={2}>You removed {adminName}.&nbsp;
                                                <Button
                                                    variant="outline-secondary"
                                                    onClick={() => this.setState(prevState => ({
                                                        removeAdminUserIds: prevState.removeAdminUserIds.filter(userId => userId !== adminName)
                                                    }))}
                                                >
                                                    Undo
                                                </Button>
                                            </td>
                                        </tr>
                                    ) :
                                    <tr key={adminName}>
                                        <td>{adminName}</td>
                                        <td><Button variant="outline-danger"
                                                    onClick={() => this.setState(prevState =>
                                                        ({removeAdminUserIds: prevState.removeAdminUserIds.concat(adminName)}))}>
                                            Remove administrator
                                        </Button>
                                        </td>
                                    </tr>
                            ))
                            }
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer style={{ justifyContent: "flex-end" }}>
                        <Button variant="secondary" onClick={() => { this.setState({ removeAdminUserIds: [], showHideRemove: false }) }}>
                            Cancel and close this window
                        </Button>
                        {
                            this.state.removeAdminUserIds ? (
                                <Button variant="primary" onClick={() => {
                                    playlistMap[playlist.id].admins = playlist.admins.filter(admin => !this.state.removeAdminUserIds.includes(admin));
                                    this.setState({removeAdminUserIds: [], showHideRemove: false});
                                }}>
                                    Finish removing administrators
                                </Button>
                            ) : ""
                        }
                    </Modal.Footer>
                </Modal>
            </Container>
        )
    }
}
