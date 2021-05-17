import React, { ChangeEvent, Component } from 'react'
import { Form, FormControl, Table } from 'react-bootstrap';
import { playlistMap } from '../data';


interface Props {
  placeholder: string;
  dark?: boolean; 
}

interface State {
  searchQuery: string;
  searchFocused: boolean;
}

export default class PlaylistSearchBar extends Component<Props, State>  {

  constructor(props: Props) {
    super(props);

    this.state = {
      searchQuery: "",
      searchFocused: false
    }

    this.updateSearchQuery = this.updateSearchQuery.bind(this);
  }

  updateSearchQuery(event: ChangeEvent<HTMLInputElement>) {
    this.setState({
        searchQuery: event.target.value
    });
  }

  render() {

   let results = Array.from(Object.entries(playlistMap))
                      .filter(([_, playlist]) =>
                          playlist.title.toLowerCase().includes(this.state.searchQuery.toLowerCase()))

    return (
      <Form className="d-flex mx-3" style={{width: "305px"}} onFocus={() => {this.setState({})}}>
        <FormControl
                autoFocus
                style={{borderColor: this.props.dark ? "black" : "white"}}
                placeholder={this.props.placeholder}
                value={this.state.searchQuery}
                onChange={this.updateSearchQuery}
            />
            {
                this.state.searchQuery ?
                    (
                        <Table className="w-auto" style={{position: "absolute", backgroundColor: "white", marginTop: "35px", zIndex: 1000, border: "lightgray 2px solid", borderRadius: "0px 0px 5px 5px"}}>
                            <thead>
                            <tr>
                                <th>Title</th>
                                <th>Owner</th>
                            </tr>
                            </thead>
                            <tbody>
                            { results.length === 0 && 
                                <tr>
                                  <td>
                                    <span style={{color: 'gray'}}>Nothing found.</span>
                                  </td>
                                  <td>
                                    
                                  </td>
                                </tr> 
                            }

                            {
                                results.map(([_, playlist]) => (
                                        <tr className="dropdown-item"
                                            role="button"
                                            style={{display: "table-row"}}
                                            onClick={() => { 
                                              window.location.href = `/playlist/${playlist.id}`
                                              this.setState({searchFocused: false, searchQuery: ""}); 
                                            }}
                                            key={playlist.id}
                                        >
                                            <td>{playlist.title}</td>
                                            <td>{playlist.owner}</td>
                                        </tr>
                                    ))
                            }
                            </tbody>
                        </Table>
                    )
                    : ""
            }
    </Form>
    )
  }
}
