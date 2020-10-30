import React from 'react';
import { Segment, Comment, Input, InputOnChangeData, Loader } from 'semantic-ui-react';
import { Api, PostWithInvitations } from '../api';
import { Profile, Settings } from '../dappletBus';

interface IProps {
    defaultSearch: string;
    settings: Settings;
    profile?: Profile;
}

interface IState {
    posts: PostWithInvitations[];
    search: string;
    loading: { [key: string]: boolean };
    active1: string | null;
    active2: string | null;
}

export class MyDiscussions extends React.Component<IProps, IState> {

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
        try {
            const { profile } = this.props;
            if (profile) {
                const posts = await this._api.getInvitationPosts(profile.namespace, profile.username);
                this.setState({ posts });
            }

            this._setLoading('list', false);
        } catch (err) {
            if (err.name !== 'AbortError') console.error(err);
        }
    }

    async componentWillUnmount() {
        this._api.controller.abort();
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

    _postFilter = (data: PostWithInvitations) => {
        let isFound = true;

        const parsed = this._parseSearch(this.state.search);

        const { user, search, conference } = parsed;

        if (user) {
            for (const conf of data.conferences) {
                if (!!conf.users.find(u => user.toLowerCase() === u.username.toLowerCase())) {
                    isFound = isFound && true;
                    break;
                }
            }
        }

        if (conference) {
            const filteredByConference = data.conferences.find(c => conference.toLowerCase() === c.short_name.toLowerCase());
            if (!user) {
                isFound = isFound && !!filteredByConference;
            } else if (filteredByConference) {
                isFound = isFound && !!filteredByConference.users.find(u => user.toLowerCase() === u.username.toLowerCase())
            } else {
                isFound = isFound && false;
            }
        }

        if (search && search.length > 0) {
            const found = data.post.fullname.toLowerCase().indexOf(search.toLowerCase()) !== -1
                || data.post.username.toLowerCase().indexOf(search.toLowerCase()) !== -1
                || data.post.text.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            isFound = isFound && found;
        }

        return isFound;
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
        const filteredPosts = this.state.posts.filter(this._postFilter);

        return (<div>
            <div style={{ padding: '15px', position: 'fixed', top: '90px', left: '0', width: '100%', zIndex: 1000, backgroundColor: '#fff' }}>
                <Input fluid placeholder='Search...' value={this.state.search}
                    icon='search'
                    iconPosition='left'
                    onChange={this.inputChangeHandler}
                />
            </div>
            <div style={{ marginTop: '145px' }}>
                {this._getLoading('list') ? <Segment>
                    <Loader active inline='centered'>Loading</Loader>
                </Segment> : <React.Fragment>
                        {(filteredPosts.length > 0) ? filteredPosts.map((p, i) =>
                            <Segment key={i}>
                                <Comment.Group minimal>
                                    <Comment >
                                        <Comment.Avatar style={{ margin: 0 }} src={p.post.img} />
                                        <Comment.Content style={{ marginLeft: '3.3em', padding: 0 }} >
                                            <Comment.Author as='a' target='_blank' href={`https://twitter.com/${p.post.username}/status/${p.post.id}`}>{p.post.fullname}</Comment.Author>
                                            <Comment.Metadata>
                                                <div>@{p.post.username}</div>
                                            </Comment.Metadata>
                                            <Comment.Text>{p.post.text}</Comment.Text>
                                        </Comment.Content>
                                        <div>
                                            {p.conferences.map(c => {
                                                const exceptMe = c.users.filter(u => !(u.username === this.props.profile?.username && u.namespace === this.props.profile?.namespace));
                                                const public_users = exceptMe.filter(x => x.is_private === false);
                                                const private_users = exceptMe.filter(x => x.is_private === true);

                                                return <React.Fragment key={c.id}>
                                                    <b>{c.name}: </b>
                                                    {c.users.find(u => u.username === this.props.profile?.username && u.namespace === this.props.profile?.namespace) ? 'me' : null}
                                                    {public_users.map((u, i) => <React.Fragment key={i}><span title={u.fullname}>, @<span style={{ textDecoration: (u.username === p.post.username) ? 'underline' : undefined }}>{u.username}</span></span></React.Fragment>)}
                                                    {(private_users.length > 0) ? <React.Fragment> and {private_users.length} private person{(private_users.length > 1 ? 's' : '')}</React.Fragment> : null}
                                                    <br />
                                                </React.Fragment>
                                            })}
                                        </div>
                                    </Comment>
                                </Comment.Group>
                            </Segment>
                        ) : <Segment>No entries found</Segment>}
                    </React.Fragment>}
            </div>
        </div>);
    }
}
