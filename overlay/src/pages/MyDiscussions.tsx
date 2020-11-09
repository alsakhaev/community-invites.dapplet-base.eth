import React from 'react';
import { Segment, Comment, Input, InputOnChangeData, Loader } from 'semantic-ui-react';
import { Api, PostWithInvitations } from '../api';
import { Post, Profile, Settings } from '../dappletBus';
import { AggInvitationCard } from '../components/AggInvitationCard';

interface IProps {
    defaultSearch: string;
    settings: Settings;
    profile: Profile;
    onEdit: (post: Post, user: Profile) => void;
}

interface IState {
    posts: PostWithInvitations[];
    search: string;
    loading: { [key: string]: boolean };
    active1: string | null;
    active2: string | null;
    highlightedId: string | null;
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
            active2: null,
            highlightedId: null
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

    _selectCard(id: string) {
        this.setState({
            highlightedId: (id === this.state.highlightedId) ? null : id
        })
    }

    _onEdit(p: PostWithInvitations) {
        const post: Post = {
            id: p.post.id,
            text: p.post.text,
            authorUsername: p.post.username,
            authorImg: p.post.img,
            authorFullname: p.post.fullname
        };

        const user: Profile = {
            namespace: p.post.namespace,
            username: p.post.username,
            img: p.post.img,
            fullname: p.post.fullname
        };

        this.props.onEdit(post, user);
    }

    render() {
        const filteredPosts = this.state.posts.filter(this._postFilter);

        return (<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: '15px' }}>
                <Input fluid placeholder='Search...' value={this.state.search}
                    icon='search'
                    iconPosition='left'
                    onChange={this.inputChangeHandler}
                />
            </div>
            <div style={{ flex: '1', overflow: 'auto', marginRight: '-15px', paddingRight: '15px' }}>
                {this._getLoading('list') ? <Segment>
                    <Loader active inline='centered'>Loading</Loader>
                </Segment> : <React.Fragment>
                        {(filteredPosts.length > 0) ? filteredPosts.map((p, i) =>
                            <AggInvitationCard 
                                post={p} 
                                key={p.post.id} 
                                profile={this.props.profile}
                                highlight={this.state.highlightedId === p.post.id}
                                //onClick={() => this._selectCard(p.post.id)}
                                onEdit={(p.post.namespace === this.props.profile.namespace && p.post.username === this.props.profile.username) ? undefined : () => this._onEdit(p)}
                                onMouseEnter={() => this._selectCard(p.post.id)}
                                onMouseLeave={() => this._selectCard(p.post.id)}
                            />
                        ) : <Segment>No entries found</Segment>}
                    </React.Fragment>}
            </div>
        </div>);
    }
}
