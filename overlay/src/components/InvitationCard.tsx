import React from 'react';
import { Icon, Segment, Image, Label, Header } from 'semantic-ui-react';
import { MyInvitation } from '../api';

interface IProps {
    invitation: MyInvitation;
    onClose: () => void;
    onClick: () => void;
    highlight?: boolean;
    disabled: boolean;
}

interface IState { }

export class InvitationCard extends React.Component<IProps, IState> {
    render() {
        const p = this.props;
        const { invitation, highlight } = this.props;
        return <Segment className="invitation-card" disabled={p.disabled} style={(highlight) ? { boxShadow: '0 1px 2px 0 #2185d05e', borderColor: '#2185d0', userSelect: 'none', cursor: 'pointer' } : { userSelect: 'none', cursor: 'pointer' }}  onClick={() => this.props.onClick()}>
                <Icon disabled={p.disabled} link={!p.disabled} name='close' title='Withdraw Invitation' style={{ zIndex: 9, position: 'absolute', top: '10px', right: '10px' }} onClick={(e: any) => (e.stopPropagation(), this.props.onClose())} />
                <div>
                    <Header as='h4' image style={{ margin: '0 auto 0 0', whiteSpace: 'nowrap' }}>
                        <Image src={invitation.author_img} rounded size='mini' style={{ display: 'inline-block' }} />
                        <Header.Content style={{ padding: '0 0 0 .75rem', display: 'inline-block' }}>
                            {invitation.author_fullname}
                            <Header.Subheader>@{invitation.author_username}</Header.Subheader>
                        </Header.Content>
                        <Label>{invitation.conference_short_name}</Label>
                        {(invitation.is_private) ? <Label title='This invitation is private'>Private</Label> : null}
                    </Header>
                    <p style={{ margin: '10px 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>{invitation.post_text}</p>
                </div>
            </Segment>;
    }
}
