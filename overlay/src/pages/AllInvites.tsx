import React from 'react';
import { Button, Divider, Accordion, Icon, Container, Grid, Loader, Dropdown, Segment, Checkbox, Placeholder } from 'semantic-ui-react';
import { Post, Profile, Settings } from '../dappletBus';
import { PostCard } from '../components/PostCard';
import { Api, Conference, ConferenceWithInvitations, MyInvitation } from '../api';
import { ProfileCard } from '../components/ProfileCard'
import { HoverButton } from '../components/HoverButton';
import Linkify from 'react-linkify';
import { InvitationCard } from '../components/InvitationCard';

interface IProps {
    // post?: Post;
    profile: Profile;
    settings: Settings;
    data: MyInvitation[];
    onWithdraw: (x: MyInvitation)=> void;
}

interface IState {
    // loading: boolean;
    // data: MyInvitation[];
}

export class AllInvites extends React.Component<IProps, IState> {
    private _api: Api;

    constructor(props: IProps) {
        super(props);

        this._api = new Api(this.props.settings.serverUrl);
        this.state = {
        }
    }

    

    render() {
        // if (this.state.loading) return <Placeholder>
        //     <Placeholder.Line />
        //     <Placeholder.Line />
        //     <Placeholder.Line />
        //     <Placeholder.Line />
        //     <Placeholder.Line />
        // </Placeholder>;

        if (this.props.data.length === 0) {
            return <Segment>No Invitations</Segment>
        }

        return <React.Fragment>
            {this.props.data.map((x, i) =>
                <InvitationCard
                    key={i}
                    invitation={x}
                    onClose={() => this.props.onWithdraw(x)}
                    onPrivate={console.log}
                />
            )}
        </React.Fragment>
    }
}
