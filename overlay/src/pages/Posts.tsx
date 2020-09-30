import React from 'react';
import { Link } from "react-router-dom";
import { Button, Divider, Card, Accordion, Icon, Segment, Image, Comment, Grid, Checkbox, Input, InputOnChangeData, Loader } from 'semantic-ui-react';
import { Api, DetailedPost, getPosts } from '../api';
import { Post, Profile, Settings } from '../dappletBus';
import { PostCard } from '../components/PostCard';
import { groupBy } from '../helpers';

interface IProps {
    defaultSearch: string;
    settings: Settings;
    profile?: Profile;
}

interface IState {
    posts: (DetailedPost & {
        target_user_namespace: string;
        target_user_username: string;
        target_user_fullname: string;        
    })[];
    search: string;
    loading: { [key: string]: boolean };
    active1: string | null;
    active2: string | null;
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
            },
            active1: null,
            active2: null
        };
    }

    async componentDidMount() {
        const { profile } = this.props;
        if (profile) {
            const posts = await this._api.getMyDetailedPosts(profile.namespace, profile.username);
            const posts2 = posts.map(p => ({ ...p, ...((profile.namespace === p.user_from_namespace && profile.username === p.user_from_username) ? {
                target_user_namespace: p.user_to_namespace,
                target_user_username: p.user_to_username,
                target_user_fullname: p.user_to_fullname
            } : {
                target_user_namespace: p.user_from_namespace,
                target_user_username: p.user_from_username,
                target_user_fullname: p.user_from_fullname
            })}))
            this.setState({ posts: posts2 });
        }

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

    _postFilter = (post: DetailedPost) => {
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
        const { active1, active2 } = this.state;
        return (<div>
            <Input fluid placeholder='Search...' value={this.state.search}
                icon='search'
                iconPosition='left'
                onChange={this.inputChangeHandler}
            />
            {this._getLoading('list') ? <Segment>
                <Loader active inline='centered'>Loading</Loader>
            </Segment> :
                    <Accordion style={{ marginTop: '14px'}}  styled>
                        {Object.entries(groupBy(this.state.posts.filter(this._postFilter), 'conference_id')).map(([conference_id, conf_posts]) => {
                            const conf = this.state.posts.filter(this._postFilter).find(x => x.conference_id === parseInt(conference_id))!;

                            return (<React.Fragment key={conference_id}>
                                <Accordion.Title active={active1 === conference_id} onClick={() => this.setState({ active1: conference_id, active2: null })}><Icon name='dropdown' />{conf.conference_name}</Accordion.Title>
                                <Accordion.Content active={active1 === conference_id}>
                                    <Accordion.Accordion style={{ margin: 0}}>
                                        {Object.entries(groupBy(conf_posts, 'target_user_username')).map(([username, user_posts]) => {
                                            const user = conf_posts.find(x => x.target_user_username === username)!;

                                            return (<React.Fragment key={username}>
                                                <Accordion.Title active={active2 === username} onClick={() => this.setState({ active2: username })}><Icon name='dropdown' />{user.target_user_fullname} @{user.target_user_username}</Accordion.Title>
                                                <Accordion.Content active={active2 === username}>
                                                    <Comment.Group minimal>
                                                        {user_posts.map((p, i) =>
                                                            <Comment key={i}>
                                                                <Comment.Avatar style={{ margin: 0 }} src={p.authorImg} />
                                                                <Comment.Content style={{ marginLeft: '3.3em', padding: 0 }} >
                                                                    <Comment.Author as='a'>{p.authorFullname}</Comment.Author>
                                                                    <Comment.Metadata>
                                                                        <div>@{p.authorUsername}</div>
                                                                    </Comment.Metadata>
                                                                    <Comment.Text>{p.text}</Comment.Text>
                                                                </Comment.Content>
                                                            </Comment>
                                                        )}
                                                    </Comment.Group>
                                                </Accordion.Content>
                                            </React.Fragment>);
                                        })}
                                    </Accordion.Accordion>
                                </Accordion.Content>
                            </React.Fragment>);
                        })}
                    </Accordion>}
        </div>);
    }
}
