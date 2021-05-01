import React, { ChangeEvent } from 'react';
import {Button, Container, Modal} from 'react-bootstrap';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import CustomNavbar from './common/components/CustomNavbar';

import Homepage from './pages/homepage';
import PlaylistPage from './pages/playlist';

import './common/css/typography.css';
import RequestsPage from "./pages/requests";
import UserProfile from './pages/userprofilepage';
import ManageAdmin from './pages/manageadministrators';

import { User } from './common/types';
import { Form } from 'react-bootstrap';
import { userMap } from './common/data';
import Callback from "./pages/callback";


interface State {
    showHide: boolean;
    loggedInUser: User | null;
    inputUsername: string;
    inputPassword: string;
    loginCallback?: () => void;
    error: "username" | "password" | "not-filled" | "";
}

class PLAYLISTS_APP extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props);

        this.state = {
            showHide: false,
            loggedInUser: null,
            inputUsername: "",
            inputPassword: "",
            error: ""
        }

        this.handleModalShowHide = this.handleModalShowHide.bind(this);
        this.handleLoginSubmission = this.handleLoginSubmission.bind(this);
    }

    handleModalShowHide(callback?: () => void): () => void {
        return () => {
            this.setState(prevState => ({ showHide: !prevState.showHide, loginCallback: callback }));
        };
    }

    handleLoginInput(type: 'username' | 'password'): (event: ChangeEvent<HTMLInputElement>) => void {
        if (type === "username") {
            return (event: ChangeEvent<HTMLInputElement>) => {
                this.setState({inputUsername: event.target.value, error: ""})
            }
        } else {
            return (event: ChangeEvent<HTMLInputElement>) => {
                this.setState({inputPassword: event.target.value, error: ""})
            }
        }
    }

    handleLoginSubmission(): void {
        if (this.state.inputUsername && this.state.inputPassword) {
            if (this.state.inputPassword.toLowerCase() === "password" && this.state.inputUsername.toLowerCase() === "hci2021") {
                if (this.state.loginCallback !== undefined) {
                    this.state.loginCallback();
                }
                this.setState({
                    loggedInUser: userMap['hci2021'],
                    showHide: false,
                    inputPassword: "",
                    inputUsername: "",
                    loginCallback: undefined
                });
            } else {
                if (this.state.inputUsername.toLowerCase() !== "hci2021") {
                    this.setState({
                        inputPassword: "",
                        inputUsername: "",
                        error: "username"
                    })
                } else {
                    this.setState({
                        inputPassword: "",
                        error: "password"
                    })
                }
            }
        } else {
            this.setState({
                error: "not-filled"
            })
        }
    }

    render() {

        let { loggedInUser } = this.state;

        return (
            <div>
                <CustomNavbar user={loggedInUser} toggleLoginModal={this.handleModalShowHide}/>
                <Container fluid>
                    <Router>
                        <Route path="/" component={Homepage} exact/>

                        {/* In order to access this playlist ID from the pages that need it, you need to use props.match.params.<VARIABLE_NAME> in that component */}

                        {/*@ts-ignore */}
                        <Route path="/playlist/:playlistId" component={({ match }) =>
                                   <PlaylistPage loggedInUsername={loggedInUser ? loggedInUser.username : undefined} match={match} toggleLoginModal={this.handleModalShowHide} />
                               }
                               exact
                        />
                        {/*@ts-ignore */}
                        <Route path="/playlist/:playlistId/requests" component={({ match, location, history }) =>
                                   <RequestsPage loggedInUsername={loggedInUser ? loggedInUser.username : undefined}
                                                 match={match}
                                                 location={location}
                                                 history={history}
                                                 toggleLoginModal={this.handleModalShowHide} />
                               }
                               exact
                        />

                        {/* Route to User profile page */}
                        <Route path="/user/:username" component={UserProfile} exact/>

                        {/* Route to Manage admins page */}
                        <Route path="/playlist/:playlistId/admins" component={ManageAdmin} exact/>

                        <Route path="/callback" component={Callback} exact />
                    </Router>

                    <Modal show={this.state.showHide} animation={false} backdrop="static" dialogClassName="museo-300">
                    <Modal.Header onClick={() => this.handleModalShowHide()}>
                        <Modal.Title className="museo-display-black">Log into your account</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" placeholder="Enter username..." value={this.state.inputUsername} onChange={this.handleLoginInput('username')} isInvalid={this.state.error === "username"} />
                                <Form.Control.Feedback type="invalid">
                                    Username not found, please try again.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group controlId="formPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" placeholder="Enter password..." value={this.state.inputPassword} onChange={this.handleLoginInput('password')} isInvalid={this.state.error === "password"} />
                                <Form.Control.Feedback type="invalid">
                                    Incorrect password, please try again.
                                </Form.Control.Feedback>
                            </Form.Group>
                            {
                                (this.state.error === "not-filled") 
                                    && 
                                <p className="text-danger" style={{fontSize: "80%", marginBottom: 0}}>
                                    Please fill out all login fields.
                                </p>
                            }
                        </Form>
                    </Modal.Body>
                    <Modal.Footer style={{justifyContent: "flex-end"}}>
                        <Button variant="primary" onClick={this.handleLoginSubmission}>
                            Log in
                        </Button>
                        <Button variant="outline-danger" onClick={() => {this.setState({inputPassword: "", inputUsername: "", showHide: false, loginCallback: undefined})}}>
                            Close this window
                        </Button>
                    </Modal.Footer>
                </Modal>
                </Container>
            </div>
        );
    }
}

export default PLAYLISTS_APP;
