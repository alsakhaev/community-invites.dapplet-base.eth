import React from 'react';
import { Icon, Segment, Comment, Input, InputOnChangeData, Loader, Label, Select, Message, Dropdown, Button } from 'semantic-ui-react';
import { Api, PostWithTags, Tag, UserSettings } from '../api';
import { Profile, Settings } from '../dappletBus';
import Twemoji from 'react-twemoji';

interface IProps {
    defaultSearch: string;
    settings: Settings;
    profile?: Profile;
    userSettings?: UserSettings;
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

    async componentDidMount() {
        try {
            const { profile } = this.props;
            if (profile) {
                const posts = await this._api.getAllTopicsWithMyTags(profile.namespace, profile.username, this.props.userSettings?.teamId);
                this.setState({ posts });
            }

            const tags = await this._api.getTags(this.props.userSettings?.teamId);
            this.setState({ tags });

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

            if (!result[m[1]]) result[m[1]] = [];

            result[m[1]].push(m[2]);
        }

        result.search = result.search.trim();

        return result;
    }

    _postFilter = (data: PostWithTags) => {
        let isFound = true;

        const { search, filter } = this.state;

        const parsed = this._parseSearch(search);

        if (parsed.search) {
            const found = data.fullname.toLowerCase().indexOf(parsed.search.toLowerCase()) !== -1
                || data.username.toLowerCase().indexOf(parsed.search.toLowerCase()) !== -1
                || data.text.toLowerCase().indexOf(parsed.search.toLowerCase()) !== -1;
            isFound = isFound && found;
        }

        if (parsed.tag) {
            parsed.tag.forEach((t: string) => {
                const found = !!data.tags.find(x => x.name === t && x.value === true);
                isFound = isFound && found;
            })
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

    _tagFilter(tag: string) {
        const expression = 'tag:' + tag;

        // remove filter is it exists
        if (this.state.search.indexOf(expression) !== -1) {
            this.setState({ search: this.state.search.replace(expression, '').trim() });
        } else {
            this.setState({ search: (this.state.search + ' ' + expression).trim() });
        }
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
        await this._api.tag(item_id, tag_id, this.props.profile, this.props.userSettings?.teamId);
        const posts = await this._api.getAllTopicsWithMyTags(this.props.profile.namespace, this.props.profile.username, this.props.userSettings?.teamId);
        this._setLoading(item_id, false);
        this.setState({ posts });
    }

    async untag(item_id: string, tag_id: string) {
        this._setLoading(item_id, true);
        if (!this.props.profile) throw Error('You are not logged in');
        await this._api.untag(item_id, tag_id, this.props.profile, this.props.userSettings?.teamId);
        const posts = await this._api.getAllTopicsWithMyTags(this.props.profile.namespace, this.props.profile.username, this.props.userSettings?.teamId);
        this._setLoading(item_id, false);
        this.setState({ posts });
    }

    render() {
        const s = this.state;
        const filteredPosts = this.state.posts.filter(this._postFilter);

        return (<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: '15px' }}>
                <Input
                    fluid
                    placeholder='Search...'
                    value={this.state.search}
                    label={<Select style={{ width: '11em' }} compact options={filterOptions} defaultValue={filterOptions[1].value} onChange={(e, d) => this.setState({ filter: d.value as string })} />}
                    labelPosition='left'
                    onChange={this.inputChangeHandler}
                />
            </div>
            <div style={{ flex: '1', overflow: 'auto', marginRight: '-15px', paddingRight: '15px' }}>
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
                                <Comment.Group minimal style={{ margin: 0 }}>
                                    <Comment >
                                        <Comment.Avatar style={{ margin: 0 }} src={p.img} />
                                        <Comment.Content style={{ marginLeft: '3.3em', padding: 0 }} >
                                            <Comment.Author><Twemoji>{p.fullname}</Twemoji></Comment.Author>
                                            <Comment.Metadata style={{ margin: '0' }}>@{p.username}</Comment.Metadata>
                                        </Comment.Content>
                                        <Comment.Text style={{ margin: '0.5em 0px 0.5em 46px' }}>{p.text} <Button icon='external' title='Open the post in Twitter' basic size='mini' style={{ boxShadow: 'none', padding: '2px', margin: '0', position: 'relative', top: '-1px' }} onClick={(e) => (e.stopPropagation(), window.open(`https://twitter.com/${p.username}/status/${p.id}`, '_blank'))} /></Comment.Text>

                                        <div>
                                            {p.tags.filter(x => x.value === true).map(x => <Label onClick={() => this._tagFilter(x.name)} style={{ marginTop: '.14285714em' }} as='a' color='green' key={x.id} disabled={this._getLoading(p.id)}>{x.name}<Icon name='delete' disabled={this._getLoading(p.id)} link onClick={(e: any) => (e.stopPropagation(), this.untag(p.id, x.id))} /></Label>)}
                                            {(s.tags.filter(x => !p.tags.find(y => y.id === x.id && y.value === true)).length > 0) ? <Dropdown
                                                trigger={<Label style={{ marginTop: '.14285714em' }} color='blue' disabled={this._getLoading(p.id)}><Icon name='plus' /> Add conference</Label>}
                                                pointing='top right'
                                                icon={null}
                                            >
                                                <Dropdown.Menu>
                                                    {s.tags.filter(x => !p.tags.find(y => y.id === x.id && y.value === true)).map(x => <Dropdown.Item key={x.id} onClick={() => this.tag(p.id, x.id)}>{x.name}</Dropdown.Item>)}
                                                </Dropdown.Menu>
                                            </Dropdown> : null}
                                        </div>
                                    </Comment>
                                </Comment.Group>
                            </Segment>
                        )}

                        {(filteredPosts.length === 0) ? <Segment>No entries found</Segment> : null}
                    </React.Fragment>}
            </div>
        </div >);
    }
}
