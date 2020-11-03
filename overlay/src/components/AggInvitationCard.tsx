import React from 'react';
import { Icon, Segment, Image, Label, Header, Comment, Button } from 'semantic-ui-react';
import { MyInvitation, PostWithInvitations } from '../api';
import { Profile } from '../dappletBus';

interface IProps {
    post: PostWithInvitations;
    profile: Profile;
    //onClose: () => void;
    onClick: () => void;
    onEdit: () => void;
    highlight?: boolean;
    disabled?: boolean;
}

interface IState { }

export class AggInvitationCard extends React.Component<IProps, IState> {
    render() {
        const p = this.props;

        return <Segment className="invitation-card" disabled={p.disabled ?? false} style={(p.highlight) ? { boxShadow: '0 1px 2px 0 #2185d05e', borderColor: '#2185d0', userSelect: 'none', cursor: 'pointer' } : { userSelect: 'none', cursor: 'pointer' }} onClick={() => p.onClick()} >
            <Comment.Group minimal>
                <Comment >
                    <Comment.Avatar style={{ margin: 0 }} src={p.post.post.img} />
                    <Comment.Content style={{ marginLeft: '3.3em', padding: 0 }} >
                        <Comment.Author as='a' target='_blank' href={`https://twitter.com/${p.post.post.username}/status/${p.post.post.id}`}>{p.post.post.fullname}</Comment.Author>
                        <Comment.Metadata>
                            <div>@{p.post.post.username}</div>
                        </Comment.Metadata>
                        <Comment.Text>{p.post.post.text}</Comment.Text>
                    </Comment.Content>
                    <div>
                        {p.post.conferences.map(c => {
                            const exceptMe = c.users.filter(u => !(u.username === this.props.profile?.username && u.namespace === this.props.profile?.namespace));
                            const public_users = exceptMe.filter(x => x.is_private === false);
                            const private_users = exceptMe.filter(x => x.is_private === true);

                            return <React.Fragment key={c.id}>
                                <b>{c.name}: </b>
                                {c.users.find(u => u.username === this.props.profile?.username && u.namespace === this.props.profile?.namespace) ? 'me' : null}
                                {public_users.map((u, i) => <React.Fragment key={i}><span title={u.fullname}>, @<span style={{ textDecoration: (u.username === p.post.post.username) ? 'underline' : undefined }}>{u.username}</span></span></React.Fragment>)}
                                {(private_users.length > 0) ? <React.Fragment> and {private_users.length} private person{(private_users.length > 1 ? 's' : '')}</React.Fragment> : null}
                                <br />
                            </React.Fragment>
                        })}
                    </div>
                    <div style={{ textAlign: 'end'}}>
                        {(p.highlight) ? <Button primary onClick={(e) => (e.stopPropagation(), this.props.onEdit())} size='mini'>Edit Invites</Button> : null}
                    </div>
                </Comment>
            </Comment.Group>
        </Segment>
    }
}
