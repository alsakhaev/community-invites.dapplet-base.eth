import React from 'react';
import { Link } from "react-router-dom";
import { Button, Divider, Card, Accordion, Icon, Segment, Image, Comment, Grid, Checkbox, Input, InputOnChangeData, Loader } from 'semantic-ui-react';
import { Api, getPosts } from '../api';
import { Post, Profile, Settings } from '../dappletBus';
import { PostCard } from '../components/PostCard';

interface IProps {
    defaultSearch: string;
    settings: Settings;
}

interface IState {
    posts: Post[];
    search: string;
    loading: { [key: string]: boolean };
}

export class Posts extends React.Component<IProps, IState> {

    private _api: Api;

    constructor(props: any) {
        super(props);
        this._api = new Api(this.props.settings.serverUrl);
        this.state = {
            posts: [],
            search: this.props.defaultSearch,
            loading: {
                'list': true
            }
        };
    }

    async componentDidMount() {
        const posts = await this._api.getPosts();
        this.setState({ posts });
        this._setLoading('list', false);
    }

    _parseSearch(str: string) {
        const regex = /([a-zA-Z]*):([^ ]*)/gm;
        let m;

        const result: { [key: string]: any, search: string } = { search: str };

        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            result.search = result.search.replace(m[0], '');
            result[m[1]] = m[2];
        }

        result.search = result.search.trim();

        return result;
    }

    _postFilter = (post: Post) => {
        const parsed = this._parseSearch(this.state.search);

        // parsed.conferenceId !== undefined && parsed.conferenceId === post.conferenceId
        return (!parsed.username || parsed.username.toLowerCase() === post.authorUsername.toLowerCase()) &&
            (parsed.search === '' || post.text.toLowerCase().indexOf(parsed.search.toLowerCase()) !== -1 || post.authorUsername.toLowerCase().indexOf(parsed.search.toLowerCase()) !== -1 || post.authorFullname.toLowerCase().indexOf(parsed.search.toLowerCase()) !== -1);
    }

    inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        this.setState({ search: event.target.value });
    }

    _setLoading(key: string, value: boolean) {
        const loading = this.state.loading;
        loading[key] = value;
        this.setState({ loading });
    }

    _getLoading(key: string) {
        return this.state.loading[key] || false;
    }

    render() {
        return (<div>
            <Input fluid placeholder='Search...' value={this.state.search}
                icon='search'
                iconPosition='left'
                onChange={this.inputChangeHandler} />
            {this._getLoading('list') ? <Segment><Loader active inline='centered'>Loading</Loader></Segment> : this.state.posts.filter(this._postFilter).map((p, i) => <PostCard key={i} post={p} />)}
        </div>);
    }
}
