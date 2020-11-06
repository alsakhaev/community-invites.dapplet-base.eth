import React from 'react';
import { Segment, Placeholder } from 'semantic-ui-react';
import { Profile, Settings } from '../dappletBus';
import { MyInvitation } from '../api';
import { InvitationCard } from '../components/InvitationCard';

interface IProps {
    profile: Profile;
    settings: Settings;
    data: (MyInvitation & { loading: boolean })[];
    onWithdraw: (x: MyInvitation) => void;
    loading: boolean;
    highlightedInvitationId: number;
}

interface IState {
    loading: any;
    highlightedInvitationId: number;
}

export class AllInvites extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            loading: {},
            highlightedInvitationId: props.highlightedInvitationId
        }
    }

    selectInvitation(id: number) {
        if (id === this.state.highlightedInvitationId) {
            this.setState({ highlightedInvitationId: -1 });
        } else {
            this.setState({ highlightedInvitationId: id });
        }
    }

    render() {
        if (this.props.loading) return <React.Fragment>
            {/* <h4>All Invites</h4> */}
            <Placeholder>
                <Placeholder.Line />
                <Placeholder.Line />
                <Placeholder.Line />
                <Placeholder.Line />
                <Placeholder.Line />
            </Placeholder>
        </React.Fragment>;

        if (this.props.data.length === 0) {
            return <Segment>No Invitations</Segment>
        }

        return <React.Fragment>
            {/* <h4>All Invites</h4> */}
            {this.props.data.map((x, i) =>
                <InvitationCard
                    key={i}
                    highlight={x.id === this.state.highlightedInvitationId}
                    invitation={x}
                    onClose={() => this.props.onWithdraw(x)}
                    disabled={x.loading}
                    onClick={() => this.selectInvitation(x.id)}
                />
            )}
        </React.Fragment>
    }
}
