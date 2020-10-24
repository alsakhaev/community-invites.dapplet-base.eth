import React from 'react';
import { Link } from "react-router-dom";
import { Button, Divider, Card, Accordion, Icon, Segment, Image, Comment, Label, Checkbox, Header } from 'semantic-ui-react';
import { Post } from '../dappletBus';
import { MyInvitation } from '../api';

interface IProps {
    invitation: MyInvitation;
    onClose: () => void;
    highlight?: boolean;
    disabled: boolean;
}

interface IState { }

export class InvitationCard extends React.Component<IProps, IState> {
    render() {
        const p = this.props;
        const { invitation, highlight } = this.props;
        return <Segment disabled={p.disabled} style={(highlight) ? { boxShadow: '0 1px 2px 0 #2185d05e', borderColor: '#2185d0'} : undefined}>
            <Icon disabled={p.disabled} link={!p.disabled} name='close' title='Withdraw Invitation' style={{ zIndex: 9, position: 'absolute', top: '10px', right: '10px' }} onClick={() => this.props.onClose()} />
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
