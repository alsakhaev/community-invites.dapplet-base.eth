import React from 'react';
import { Link } from "react-router-dom";
import { Button, Divider, Card, Accordion, Icon, Segment, Image, Comment, Label, Checkbox, Header } from 'semantic-ui-react';
import { Post } from '../dappletBus';
import { MyInvitation } from '../api';

interface IProps {
    invitation: MyInvitation;
    onClose: () => void;
    onPrivate: (checked: boolean) => void;
}

interface IState { }

export class InvitationCard extends React.Component<IProps, IState> {
    render() {
        const { invitation } = this.props;
        return <Segment>
            <Icon link name='close' title='Withdraw Invitation' style={{ zIndex: 9, position: 'absolute', top: '10px', right: '10px' }} onClick={() => this.props.onClose()} />
            <div>
                <Header as='h4' image style={{ margin: '0 auto 0 0', whiteSpace: 'nowrap' }}>
                    <Image src={invitation.author_img} rounded size='mini' style={{ display: 'inline-block' }} />
                    <Header.Content style={{ padding: '0 0 0 .75rem', display: 'inline-block' }}>
                        {invitation.author_fullname}
                        <Header.Subheader>@{invitation.author_username}</Header.Subheader>
                    </Header.Content>
                    <Label>{invitation.conference_short_name}</Label>
                </Header>
                <p style={{ margin: '10px 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>{invitation.post_text}</p>
                <div><Checkbox label='Private' checked={invitation.is_private} onChange={(e, d) => this.props.onPrivate(d.checked as boolean)} /></div>
            </div>
        </Segment>;
    }
}
