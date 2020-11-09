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

    sortConferences(a: ConferenceWithInvitations, b: ConferenceWithInvitations) {
        const weight = (x: ConferenceWithInvitations) => (x.attendance_from && x.attendance_to) ? 2 : (x.attendance_from || x.attendance_to) ? 1 : 0;
        const aWeight = weight(a);
        const bWeight = weight(b);
        
        return (aWeight === bWeight) ? 0 : (aWeight > bWeight) ? -1 : 1;
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

        const headerStyle = { borderTop: '1px solid #dadada', borderBottom: '1px solid #dadada', backgroundColor: 'rgba(0,0,0,.05)', margin: '0', padding: '1rem 1.14285714rem' };

        return <Dropdown
            placeholder='Choose Conference'
            fluid
            className='selection'
            value={p.selectedConferenceId}
            text={p.data.find(x => x.conference.id === p.selectedConferenceId)?.conference.name}
            style={{ fontWeight: 'bold', borderRadius: '.28571429rem .28571429rem 0 0' }}
        >
            <Dropdown.Menu style={{ maxHeight: '24em' }} >
                {(invited.length > 0) ? <React.Fragment>
                    <Dropdown.Header style={headerStyle} content={`You already invited @${p.profileTo.username}`} />
                    {/* <Dropdown.Divider /> */}
                    {invited.sort(this.sortConferences).map(x => this.dropdownItem(x))}
                </React.Fragment> : null}

                {(notInvited.length > 0) ? <React.Fragment>
                    <Dropdown.Header style={headerStyle} content={`You haven't invited @${p.profileTo.username} yet`} />
                    {/* <Dropdown.Divider /> */}
                    {notInvited.sort(this.sortConferences).map(x => this.dropdownItem(x))}
                </React.Fragment> : null}
            </Dropdown.Menu>
        </Dropdown>;
    }
}
