import {Component} from "react";

interface Params {
    access_token: string;
    refresh_token: string;
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
        window.close();
    }

    render() {
        return <p>Loading...</p>;
    }
}

export default Callback;
