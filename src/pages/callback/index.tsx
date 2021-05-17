import {Component} from "react";

interface Params {
    access_token: string;
    refresh_token: string;
    user_id: string;
    display_name: string;
    profile_picture_url: string;
}

class Callback extends Component<{}, {}> {
    constructor(props: {}) {
        super(props);

        console.log("the callback worked");
        this.getToken = this.getToken.bind(this);
        this.getToken();
    }

    getToken() {
        // @ts-ignore
        const queryParams: Params = window.location.search.slice(1).split("&").reduce(
            (accumulator, currentValue) => {
                const pair = currentValue.split("=");
                return {...accumulator, [pair[0]]: pair[1]}
            }, {});
        localStorage.setItem("sp-accessToken", queryParams.access_token);
        localStorage.setItem("sp-refreshToken", queryParams.refresh_token);
        localStorage.setItem("sp-userId", queryParams.user_id);
        localStorage.setItem("sp-displayName", queryParams.display_name);
        localStorage.setItem("sp-profilePictureURL", decodeURIComponent(queryParams.profile_picture_url));
        // window.close();
    }

    render() {
        return <p>Loading...</p>;
    }
}

export default Callback;
