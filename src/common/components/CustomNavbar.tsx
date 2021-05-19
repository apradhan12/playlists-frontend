import React from 'react'
import {Navbar, Button, Nav, Image} from 'react-bootstrap'
import PlaylistSearchBar from './PlaylistSearchBar'
import {useLocation} from "react-router-dom";

interface CustomNavbarProps {
    user: any | null; // todo
}

export default function CustomNavbar(props: CustomNavbarProps) {
    // const location = useLocation();
    // todo: figure out problem with useLocation

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
                {/*{window.location.pathname !== "/" && <PlaylistSearchBar placeholder="Search for playlists..."/>}*/}
            </Nav>
            {
                props.user ?
                    <>
                        <Navbar.Text>
                            Logged in as&nbsp;
                            {/*<Nav.Link className="d-inline p-0" href={`/user/${this.props.user.userId}`}*/}
                            {/*          style={{textDecorationLine: "underline"}}>*/}
                            <span>
                                    {props.user.displayName}
                                <Image fluid src={props.user.profilePictureURL}
                                       style={{maxWidth: "30px", marginLeft: "5px"}}/>
                                </span>
                            {/*</Nav.Link>*/}
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
