import React from 'react'
import {Navbar, Button, Nav, Image} from 'react-bootstrap'
import PlaylistSearchBar from './PlaylistSearchBar'

interface CustomNavbarProps {
    user: any | null; // todo
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
        const logout = () => {
            // todo: factor out repeated code between here and other file
            localStorage.removeItem("sp-accessToken");
            localStorage.removeItem("sp-refreshToken");
            localStorage.removeItem("sp-userId");
            localStorage.removeItem("sp-displayName");
            localStorage.removeItem("sp-profilePictureURL");
            window.location.reload();
        };
        return (
            <Navbar style={{backgroundColor: "#6eaedd"}} variant="dark" className="museo-300">
                <Navbar.Brand href="/">
                    <p className="museo-display-black m-0">Spotify Collaborative Playlists</p>
                </Navbar.Brand>
                <Nav className="mr-auto">
                    {this.state.hash !== "/" && <PlaylistSearchBar placeholder="Search for playlists..."/>}
                </Nav>
                {
                    this.props.user ?
                        <>
                            <Navbar.Text>
                                Logged in as
                                <Nav.Link className="d-inline p-0 ml-2" href={`/user/${this.props.user.userId}`}
                                          style={{textDecorationLine: "underline"}}>
                                <span>
                                    {this.props.user.displayName}
                                    <Image fluid src={this.props.user.profilePictureURL}
                                           style={{maxWidth: "30px", marginLeft: "5px"}}/>
                                </span>
                                </Nav.Link>
                            </Navbar.Text>
                            <Button variant="light" className="ml-5" onClick={logout}>Log out</Button>
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
