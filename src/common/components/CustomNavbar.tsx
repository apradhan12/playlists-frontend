import React from 'react'
import {Navbar, Button, Nav, Image} from 'react-bootstrap'
import {User} from '../types'
import PlaylistSearchBar from './PlaylistSearchBar'

interface CustomNavbarProps {
    user: User | null;
    toggleLoginModal: (callback?: () => void) => () => void;
}

interface CustomNavbarState {
    hash: string;
}

export default class CustomNavbar extends React.Component<CustomNavbarProps, CustomNavbarState> {

    constructor(props: CustomNavbarProps) {
        super(props);

        this.state = {
            hash: window.location.hash
        }
    }

    componentDidMount() {
        window.addEventListener('hashchange', () => {
            this.setState({
                hash: window.location.hash
            })
        })
    }

    render() {
        return (
            <Navbar style={{backgroundColor: "#6eaedd"}} variant="dark" className="museo-300">
                <Navbar.Brand href="/">
                    <p className="museo-display-black m-0">Spotify Collaborative Playlists</p>
                </Navbar.Brand>
                <Nav className="mr-auto">
                    {this.state.hash !== "#/" && <PlaylistSearchBar placeholder="Search for playlists..."/>}
                </Nav>
                {
                    this.props.user ?
                        <>
                            <Navbar.Text>
                                Logged in as
                                <Nav.Link className="d-inline p-0 ml-2" href={`#/user/${this.props.user.username}`}
                                          style={{textDecorationLine: "underline"}}>
                                <span>
                                    {this.props.user.displayName}
                                    <Image fluid src={process.env.PUBLIC_URL + this.props.user.profilePictureURL}
                                           style={{maxWidth: "30px", marginLeft: "5px"}}/>
                                </span>
                                </Nav.Link>
                            </Navbar.Text>
                            <Button variant="light" className="ml-5" onClick={() => window.location.reload()}>Log
                                out</Button>
                        </> :
                        <>
                            <Button variant="light"
                                    onClick={() => window.open('http://localhost:8888/login', "login", "height=600,width=600")}>
                                Log in with Spotify
                            </Button>
                        </>
                }
            </Navbar>
        )
    }
}

