import React from 'react';
import { Segment, Comment, Input, InputOnChangeData, Loader, Dropdown, Button } from 'semantic-ui-react';
import { Api, PostWithInvitations, PostWithTags, Tag, UserSettings } from '../api';
import { Post, Profile, Settings } from '../dappletBus';
import { AggInvitationCard } from '../components/AggInvitationCard';
import { SortingDropdown } from '../components/SortingDropdown';
import { DoubleClickButton } from '../components/DoubleClickButton';

interface IProps {
    defaultSearch: string;
    settings: Settings;
    profile: Profile;
    onEdit: (post: Post, user: Profile, conferenceId: number) => void;
    highlightedPostId: string | null;
    userSettings?: UserSettings;
}

interface IState {
    posts: PostWithInvitations[];
    search: string;
    loading: { [key: string]: boolean };
    active1: string | null;
    active2: string | null;
    highlightedId: string | null;
    postsWithTags: PostWithTags[];
    tags: Tag[];

    sortingValue: SortingValues;
    sortingDirection: SortingDirection;
    sortingOptions: SortingValues[];

    filterValue: FilterValues;
    filterOptions: FilterValues[];

    autoupdate: boolean;

    isFilterLoading: boolean;
    isFilterChanged: boolean;
}

export enum SortingValues {
    TimeOfCreation = 'time of creation',
    TimeOfTagging = 'time of tagging'
}

export enum FilterValues {
    All = 'all',
    Tagged = 'tagged',
    NotTagged = 'not tagged'
}

export enum SortingDirection {
    Desc = 'desc',
    Asc = 'asc'
}

export class MyDiscussions extends React.Component<IProps, IState> {

    private _api: Api;
    private _allData: PostWithInvitations[] = [];

    constructor(props: IProps) {
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
            highlightedId: null,
            tags: [],
            postsWithTags: [],
            sortingValue: SortingValues.TimeOfCreation,
            sortingDirection: SortingDirection.Desc,
            sortingOptions: (props.userSettings?.teamId) ? [SortingValues.TimeOfCreation, SortingValues.TimeOfTagging] : [SortingValues.TimeOfCreation],
            filterValue: FilterValues.All,
            filterOptions: (props.userSettings?.teamId) ? [FilterValues.All, FilterValues.Tagged, FilterValues.NotTagged] : [FilterValues.All],
            autoupdate: false,
            isFilterLoading: false,
            isFilterChanged: false
        };
    }

    async componentDidMount() {
        try {
            const { profile } = this.props;
            if (profile) {
                const posts = await this._api.getInvitationPosts(profile.namespace, profile.username);
                const postsWithTags = await this._api.getAllTopicsWithMyTags(profile.namespace, profile.username, this.props.userSettings?.teamId);
                this.setState({ posts, postsWithTags });
                this._allData = posts;
                this._update();
            }

            const tags = await this._api.getTags(this.props.userSettings?.teamId);
            this.setState({ tags });

            this._setLoading('list', false);
        } catch (err) {
            if (err.name !== 'AbortError') console.error(err);
        }
    }

    _getTagsForPost(p: PostWithInvitations) {
        const tagged = this.state.postsWithTags;
        const post = tagged.find(x => x.id === p.post.id);
        const allTags = post?.tags || [];
        return allTags.filter(x => x.value === true);
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

    _onEdit(p: PostWithInvitations, c: {
        id: number;
        name: string;
        short_name: string
    }, u: {
        namespace: string;
        username: string;
        fullname: string;
        is_private: boolean;
        is_from_me: boolean;
    }) {
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

        this.props.onEdit(post, user, c.id);
    }

    async tag(item_id: string, tag_id: string) {
        if (!this.props.profile) throw Error('You are not logged in');
        this._setLoading(item_id, true);
        await this._api.tag(item_id, tag_id, this.props.profile, this.props.userSettings?.teamId);
        const postsWithTags = await this._api.getAllTopicsWithMyTags(this.props.profile.namespace, this.props.profile.username, this.props.userSettings?.teamId);
        this._setLoading(item_id, false);
        this.setState({ postsWithTags });
        this._filterChanged();
    }

    async untag(item_id: string, tag_id: string) {
        this._setLoading(item_id, true);
        if (!this.props.profile) throw Error('You are not logged in');
        await this._api.untag(item_id, tag_id, this.props.profile, this.props.userSettings?.teamId);
        const postsWithTags = await this._api.getAllTopicsWithMyTags(this.props.profile.namespace, this.props.profile.username, this.props.userSettings?.teamId);
        this._setLoading(item_id, false);
        this.setState({ postsWithTags });
        this._filterChanged();
    }

    private _filterChanged() {
        if (this.state.autoupdate) {
            this._update();
        }
    }

    private async _update() {
        this.setState({ isFilterChanged: false, isFilterLoading: true });

        await new Promise((res) => setTimeout(res, 500));

        const s = this.state;
        let posts = [...this._allData]
            .filter(x => {
                if (s.filterValue === FilterValues.All) { // all
                    return true;
                } else if (s.filterValue === FilterValues.Tagged) { // tagged
                    return this._getTagsForPost(x).length !== 0;
                } else if (s.filterValue === FilterValues.NotTagged) { // not tagged
                    return this._getTagsForPost(x).length === 0;
                }
            })
            .sort((a, b) => {
                const result = (() => {
                    const defaultResult = BigInt(a.post.id) < BigInt(b.post.id) ? -1 : 1;

                    if (s.sortingValue === SortingValues.TimeOfCreation) { // by created
                        return defaultResult;
                    }

                    if (s.sortingValue === SortingValues.TimeOfTagging) { // by last tagging
                        const tagsA = [...this._getTagsForPost(a)];
                        const tagsB = [...this._getTagsForPost(b)];

                        const lastA = (tagsA.length > 0) ? tagsA.sort((a, b) => (new Date(a.modified) > new Date(b.modified) ? 1 : -1))[tagsA.length - 1].modified : null;
                        const lastB = (tagsB.length > 0) ? tagsB.sort((a, b) => (new Date(a.modified) > new Date(b.modified) ? 1 : -1))[tagsB.length - 1].modified : null;

                        if (lastA === null && lastB === null) {
                            return defaultResult;
                        } else if (lastA === null && lastB !== null) {
                            return -1;
                        } else if (lastA !== null && lastB === null) {
                            return 1;
                        } else {
                            return (new Date(lastA as string) > new Date(lastB as string) ? 1 : -1);
                        }
                    }

                    return defaultResult;
                })();

                return (s.sortingDirection === SortingDirection.Desc) ? result * -1 : result;
            });

        this.setState({ posts, isFilterLoading: false });
    }

    render() {
        const s = this.state;
        const filteredPosts = this.state.posts.filter(this._postFilter);

        return (<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            <div style={{ display: 'flex', marginBottom: '15px' }}>
                <div style={{ flex: '1' }}>
                    <span>filter: </span>
                    <Dropdown
                        icon={false}
                        style={{ color: 'rgb(33, 133, 208)' }}
                        options={s.filterOptions.map((x, i) => ({ text: x, value: x }))}
                        defaultValue={s.filterValue}
                        onChange={(_, d) => (this._update(), this.setState({ filterValue: d.value as FilterValues, isFilterChanged: true }))}
                    />
                </div>
                <div style={{ flex: '1' }}>
                    <span>sorting: </span>
                    <SortingDropdown
                        options={s.sortingOptions}
                        value={s.sortingValue}
                        direction={s.sortingDirection}
                        onDirectionChange={(x) => (this._update(), this.setState({ sortingDirection: x, isFilterChanged: true }))}
                        onValueChange={(x) => (this._update(), this.setState({ sortingValue: x as SortingValues, isFilterChanged: true, sortingDirection: SortingDirection.Desc }))}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '15px', display: 'flex' }}>
                <Input
                    style={{ marginRight: '8px', flex: 'auto' }}
                    placeholder='Search...'
                    value={this.state.search}
                    icon='search'
                    iconPosition='left'
                    onChange={this.inputChangeHandler}
                />
                <DoubleClickButton
                    icon='filter'
                    primary
                    //toggle
                    //active={this.state.autoupdate}
                    basic={!this.state.autoupdate}
                    onClick={() => this._update()}
                    onDoubleClick={() => (this.setState({ autoupdate: !this.state.autoupdate }), this._update())}
                    loading={s.isFilterLoading}
                    disabled={s.isFilterLoading}
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
                                highlight={this.props.highlightedPostId === p.post.id}
                                tags={this._getTagsForPost(p)}
                                availableTags={this.state.tags}
                                //onClick={() => this._selectCard(p.post.id)}
                                //onEdit={(p.post.namespace === this.props.profile.namespace && p.post.username === this.props.profile.username) ? undefined : () => this._onEdit(p)}
                                // onMouseEnter={() => this._selectCard(p.post.id)}
                                // onMouseLeave={() => this._selectCard(p.post.id)}
                                onUserClick={(c, u) => this._onEdit(p, c, u)}
                                onTag={this.tag.bind(this)}
                                onUntag={this.untag.bind(this)}
                                onTagFilter={console.log}
                                loading={this._getLoading(p.post.id)}
                                tagging={!!this.props.userSettings?.teamId}
                            />
                        ) : <Segment>No entries found</Segment>}
                    </React.Fragment>}
            </div>
        </div>);
    }
}
