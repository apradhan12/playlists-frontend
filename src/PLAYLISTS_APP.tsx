import React from 'react';
import {Container} from 'react-bootstrap';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import CustomNavbar from './common/components/CustomNavbar';

import Homepage from './pages/homepage';
import PlaylistPage from './pages/playlist';

import './common/css/typography.css';
import RequestsPage from "./pages/requests";
import UserProfile from './pages/userprofilepage';
import ManageAdmin from './pages/manageadministrators';

import Callback from "./pages/callback";
import axios from "axios";


interface State {
    showHide: boolean;
    loggedInUser: User | null;
    inputUserId: string;
    inputPassword: string;
    loginCallback?: () => void;
    error: "userId" | "password" | "not-filled" | "";
    appAccessToken: string | null;
}

interface User {
    accessToken: string;
    refreshToken: string;
    userId: string;
    displayName: string;
    profilePictureURL: string;
}

class PLAYLISTS_APP extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props);

        this.state = {
            showHide: false,
            loggedInUser: null,
            inputUserId: "",
            inputPassword: "",
            error: "",
            appAccessToken: null
        }
    }

    componentDidMount() {
        const localStorageKeys = ["sp-accessToken", "sp-refreshToken", "sp-userId", "sp-displayName", "sp-profilePictureURL"];
        const localStorageValues = localStorageKeys.map(key => localStorage.getItem(key));
        if (localStorageValues.some(value => value === null)) {
            this.setState({loggedInUser: null});
            axios.get("http://localhost:8888/client_credentials")
                .then(response => this.setState({appAccessToken: response.data.access_token}));
        } else {
            this.setState({
                loggedInUser: {
                    accessToken: localStorageValues[0]!!,
                    refreshToken: localStorageValues[1]!!,
                    userId: localStorageValues[2]!!,
                    displayName: localStorageValues[3]!!,
                    profilePictureURL: localStorageValues[4]!!
                }
            });
        }
    }

    render() {
        return (
            <div>
                <CustomNavbar user={this.state.loggedInUser}/>
                <Container fluid>
                    <Router>
                        <Route path="/" component={Homepage} exact/>

                        {/* In order to access this playlist ID from the pages that need it, you need to use props.match.params.<VARIABLE_NAME> in that component */}

                        {/*@ts-ignore */}
                        <Route path="/playlist/:playlistId" component={({ match }) =>
                                   <PlaylistPage loggedInUserId={this.state.loggedInUser ? this.state.loggedInUser.userId : null} match={match}
                                                 appAccessToken={this.state.appAccessToken}
                                   />
                               }
                               exact
                        />
                        {/*@ts-ignore */}
                        <Route path="/playlist/:playlistId/requests" component={({ match, location, history }) =>
                                   <RequestsPage loggedInUserId={this.state.loggedInUser ? this.state.loggedInUser.userId : null}
                                                 match={match}
                                                 location={location}
                                                 history={history} />
                               }
                               exact
                        />

                        {/* Route to User profile page */}
                        <Route path="/user/:userId" component={UserProfile} exact/>

                        {/* Route to Manage admins page */}
                        <Route path="/playlist/:playlistId/admins" component={ManageAdmin} exact/>

                        <Route path="/callback" component={Callback} exact />
                    </Router>
                </Container>
            </div>
        );
    }
}

export default PLAYLISTS_APP;
