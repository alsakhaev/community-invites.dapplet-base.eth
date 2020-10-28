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
    
}

export class AllInvites extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            loading: {}
        }
    }

    render() {
        if (this.props.loading) return <Placeholder>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
        </Placeholder>;

        if (this.props.data.length === 0) {
            return <Segment>No Invitations</Segment>
        }

        return <React.Fragment>
            {this.props.data.map((x, i) =>
                <InvitationCard
                    key={i}
                    highlight={x.id === this.props.highlightedInvitationId}
                    invitation={x}
                    onClose={() => this.props.onWithdraw(x)}
                    disabled={x.loading}
                />
            )}
        </React.Fragment>
    }
}
