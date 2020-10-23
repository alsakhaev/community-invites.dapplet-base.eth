import React from 'react';
import { Accordion, Icon, Segment, Comment, Input, InputOnChangeData, Loader, Divider, Label, Select, Message } from 'semantic-ui-react';
import { Api, DetailedPost, PostWithInvitations, PostWithTags, Tag } from '../api';
import { Profile, Settings } from '../dappletBus';
import { groupBy } from '../helpers';

interface IProps {
    defaultSearch: string;
    settings: Settings;
    profile?: Profile;
}

interface IState {
    posts: PostWithTags[];
    search: string;
    loading: { [key: string]: boolean };
    active1: string | null;
    active2: string | null;
    tags: Tag[];
    showMessage: boolean;
    filter: string;
}

const filterOptions = [{
    key: 'all',
    text: 'All',
    value: 'all'
}, {
    key: 'not-considered',
    text: 'Not Considered',
    value: 'not-considered'
}, {
    key: 'last-changed',
    text: 'Last Changed',
    value: 'last-changed'
}, {
    key: 'accepted',
    text: 'Accepted',
    value: 'accepted'
}, {
    key: 'rejected',
    text: 'Rejected',
    value: 'rejected'
}];


export class Topics extends React.Component<IProps, IState> {

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
            tags: [],
            showMessage: true,
            filter: 'not-considered'
        };
    }

    // setState<K extends keyof IState>(
    //     state: ((prevState: Readonly<IState>, props: Readonly<IProps>) => (Pick<IState, K> | IState | null)) | (Pick<IState, K> | IState | null),
    //     callback?: () => void
    // ): void {
    //     super.setState(state, callback);
    //     if ((state as any)?.showMessage !== undefined) {
    //         localStorage.setItem('showMessage', JSON.stringify((state as any).showMessage));
    //     }
    // }

    async componentDidMount() {
        const { profile } = this.props;
        if (profile) {
            const posts = await this._api.getAllTopicsWithMyTags(profile.namespace, profile.username);
            this.setState({ posts });
        }

        const tags = await this._api.getTags();
        this.setState({ tags });

        this._setLoading('list', false);
    }

    // _parseSearch(str: string) {
    //     const regex = /([a-zA-Z]*):([^ ]*)/gm;
    //     let m;

    //     const result: { [key: string]: any, search: string } = { search: str };

    //     while ((m = regex.exec(str)) !== null) {
    //         // This is necessary to avoid infinite loops with zero-width matches
    //         if (m.index === regex.lastIndex) {
    //             regex.lastIndex++;
    //         }

    //         result.search = result.search.replace(m[0], '');
    //         result[m[1]] = m[2];
    //     }

    //     result.search = result.search.trim();

    //     return result;
    // }

    _postFilter = (data: PostWithTags) => {
        let isFound = true;

        const { search, filter } = this.state;

        if (search) {
            const found = data.fullname.toLowerCase().indexOf(search.toLowerCase()) !== -1
                || data.username.toLowerCase().indexOf(search.toLowerCase()) !== -1
                || data.text.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            isFound = isFound && found;
        }

        switch (filter) {
            case 'not-considered':
                isFound = isFound && data.tags.length === 0;
                break;

            case 'last-changed':
                isFound = isFound && data.tags.length > 0;
                break;

            case 'accepted':
                isFound = isFound && !!data.tags.find(x => x.value === true);
                break;

            case 'rejected':
                isFound = isFound && !!data.tags.find(x => x.value === false);
                break;

            default:
                break;
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

    async tag(item_id: string, tag_id: string) {
        if (!this.props.profile) throw Error('You are not logged in');
        this._setLoading(item_id, true);
        await this._api.tag(item_id, tag_id, this.props.profile);
        const posts = await this._api.getAllTopicsWithMyTags(this.props.profile.namespace, this.props.profile.username);
        this._setLoading(item_id, false);
        this.setState({ posts });
    }

    async untag(item_id: string, tag_id: string) {
        this._setLoading(item_id, true);
        if (!this.props.profile) throw Error('You are not logged in');
        await this._api.untag(item_id, tag_id, this.props.profile);
        const posts = await this._api.getAllTopicsWithMyTags(this.props.profile.namespace, this.props.profile.username);
        this._setLoading(item_id, false);
        this.setState({ posts });
    }

    render() {
        const s = this.state;
        const filteredPosts = this.state.posts.filter(this._postFilter);

        return (<div>
            <div style={{ padding: '15px', position: 'fixed', top: '4em', left: '0', width: '100%', zIndex: 1000, backgroundColor: '#fff' }}>
                <Input
                    fluid
                    placeholder='Search...'
                    value={this.state.search}
                    label={<Select style={{ width: '11em' }} compact options={filterOptions} defaultValue={filterOptions[1].value} onChange={(e, d) => this.setState({ filter: d.value as string })} />}
                    labelPosition='left'
                    onChange={this.inputChangeHandler}
                />
            </div>
            <div style={{ marginTop: '8em' }}>
                {this._getLoading('list') ? <Segment>
                    <Loader active inline='centered'>Loading</Loader>
                </Segment> : <React.Fragment>
                        {s.showMessage ? <Message
                            warning
                            style={{ textAlign: 'center' }}
                            onDismiss={() => this.setState({ showMessage: false })}
                            content='Check the rejected topics and add in your conference list necessary ones'
                        /> : null}
                        {filteredPosts.map((p) =>
                            <Segment key={p.id} disabled={this._getLoading(p.id)}>
                                <Icon link name='close' disabled={this._getLoading(p.id)} title='Reject Topic' style={{ zIndex: 9, position: 'absolute', top: '10px', right: '10px' }} onClick={() => this.untag(p.id, s.tags[0]?.id)} />
                                <Comment.Group minimal style={{ margin: 0 }}>
                                    <Comment >
                                        <Comment.Avatar style={{ margin: 0 }} src={p.img} />
                                        <Comment.Content style={{ marginLeft: '3.3em', padding: 0 }} >
                                            <Comment.Author as='a' target='_blank' href={`https://twitter.com/${p.username}/status/${p.id}`}>
                                                {p.fullname}
                                            </Comment.Author>
                                            <Comment.Metadata>
                                                <div>@{p.username}</div>
                                                {s.tags.filter(x => !p.tags.find(y => y.id === x.id)).map(x => <Label key={x.id} color='blue' as='a' onClick={() => this.tag(p.id, x.id)} title='Add topic to conference'>
                                                    <Icon name='plus' />{x.name}
                                                </Label>)}
                                            </Comment.Metadata>
                                            <Comment.Text>{p.text}</Comment.Text>
                                            <div>{p.tags.map(x => <Label color='green' key={x.id} disabled={this._getLoading(p.id)}>{x.name}</Label>)}</div>
                                        </Comment.Content>
                                        {/* <div>
                                            {p.conferences.map(c => <React.Fragment key={c.id}>
                                                <b>{c.name}:</b> {c.users.filter(u => !(u.username === this.props.profile?.username && u.namespace === this.props.profile?.namespace)).map(u => `@${u.username}`).join(', ')} <br />
                                            </React.Fragment>)}
                                        </div> */}
                                    </Comment>
                                </Comment.Group>
                            </Segment>
                        )}

                        {(filteredPosts.length === 0) ? <Segment>No entries found</Segment> : null}
                    </React.Fragment>}
            </div>
        </div>);
    }
}
