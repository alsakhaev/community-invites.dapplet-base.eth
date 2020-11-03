import React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { ConferenceWithInvitations, MyInvitation, PostWithInvitations } from '../api';
import { Profile } from '../dappletBus';

interface IProps {
    data: ConferenceWithInvitations[];
    selectedConferenceId: number;
    onChange: (id: number) => void;
    profileTo: Profile;
}

interface IState {

}

export class ConferencesDropdown extends React.Component<IProps, IState> {

    description(from: boolean, to: boolean): string {
        if (from === true && to === true) {
            return `You and @${this.props.profileTo.username} are going to attend`;
        } else if (from === true && to === false) {
            return `You are going to attend`;
        } else if (from === false && to === true) {
            return `@${this.props.profileTo.username} is going to attend`;
        } else {
            return '';
        }
    }

    dropdownItem(x: ConferenceWithInvitations) {
        const p = this.props;
        return <Dropdown.Item
            content={<div>
                <div>{x.conference.name}</div>
                <div style={{ fontWeight: 'initial', padding: '0.5em 0 0 0', color: '#666' }}>{this.description(x.attendance_from, x.attendance_to!)}</div>
            </div>}
            active={p.selectedConferenceId === x.conference.id}
            selected={p.selectedConferenceId === x.conference.id}
            value={x.conference.id}
            key={x.conference.id}
            onClick={() => this.props.onChange(x.conference.id)}
        />;
    }

    render() {
        const p = this.props;
        const s = this.state;

        const invited = p.data.filter(x => x.invitations.find(y => y.to.namespace === p.profileTo.namespace && y.to.username === p.profileTo.username));
        const notInvited = p.data.filter(x => !x.invitations.find(y => y.to.namespace === p.profileTo.namespace && y.to.username === p.profileTo.username));

        return <Dropdown
                placeholder='Choose Conference'
                fluid
                className='selection'
                value={p.selectedConferenceId}
                text={p.data.find(x => x.conference.id === p.selectedConferenceId)?.conference.name}
            >
                <Dropdown.Menu style={{ maxHeight: '32em' }} >
                    {(invited.length > 0) ? <React.Fragment>
                        <Dropdown.Header content={`You already invited @${p.profileTo.username}`} />
                        <Dropdown.Divider />
                        {invited.map(x => this.dropdownItem(x))}
                    </React.Fragment> : null}

                    {(notInvited.length > 0) ? <React.Fragment>
                        <Dropdown.Header content={`You haven't invited @${p.profileTo.username} yet`} />
                        <Dropdown.Divider />
                        {notInvited.map(x => this.dropdownItem(x))}
                    </React.Fragment> : null}
                </Dropdown.Menu>
            </Dropdown>;
    }
}
