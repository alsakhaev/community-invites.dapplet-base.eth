import React from 'react';
import { Icon, Segment, Image, Label, Header, Comment, Button } from 'semantic-ui-react';
import { MyInvitation, PostWithInvitations } from '../api';
import { Profile } from '../dappletBus';

interface IProps {
    post: PostWithInvitations;
    profile: Profile;
    //onClose: () => void;
    //onClick: () => void;
    onEdit: () => void;
    highlight?: boolean;
    disabled?: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

interface IState { }

export class AggInvitationCard extends React.Component<IProps, IState> {
    render() {
        const p = this.props;

        return <Segment 
                className="invitation-card" 
                disabled={p.disabled ?? false} 
                style={(p.highlight) ? { boxShadow: '0 1px 2px 0 #2185d05e', borderColor: '#2185d0', cursor: 'default' } : {  cursor: 'default' }} 
                //onClick={() => p.onClick()} 
                onMouseEnter={this.props.onMouseEnter}
                onMouseLeave={this.props.onMouseLeave}
            >
            <Comment.Group minimal>
                <Comment >
                    <Comment.Avatar style={{ margin: 0 }} src={p.post.post.img} />
                    <Comment.Content style={{ marginLeft: '3.3em', padding: 0, display: 'flex' }} >
                        <div style={{ flex: '1' }}>
                            <Comment.Author>{p.post.post.fullname}</Comment.Author>
                            <Comment.Metadata style={{ margin: '0' }}>@{p.post.post.username}</Comment.Metadata>
                        </div>
                        <div>
                            {(p.highlight) ? <Button primary onClick={(e) => (e.stopPropagation(), this.props.onEdit())} size='mini'>Edit Invites</Button> : null}
                        </div>
                    </Comment.Content>
                    <Comment.Text style={{ margin: '0.5em 0 0.5em 47px' }}>{p.post.post.text} <Button icon='external' title='Open the post in Twitter' basic size='mini' style={{ boxShadow: 'none', padding: '2px', margin: '0', position: 'relative', top: '-1px' }} onClick={(e) => (e.stopPropagation(), window.open(`https://twitter.com/${p.post.post.username}/status/${p.post.post.id}`, '_blank'))} /></Comment.Text>
                    <div>
                        {p.post.conferences.map(c => {
                            const exceptMe = c.users.filter(u => !(u.username === this.props.profile?.username && u.namespace === this.props.profile?.namespace));
                            const isMe = !!c.users.find(u => u.username === this.props.profile?.username && u.namespace === this.props.profile?.namespace);
                            const public_users = exceptMe.filter(x => x.is_private === false);
                            const private_users = exceptMe.filter(x => x.is_private === true);

                            return <React.Fragment key={c.id}>
                                <b style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '20ch', display: 'block', float: 'left'}} title={c.name}>{c.name}</b><b>: </b>
                                {(isMe) ? 'me, ' : null}
                                {public_users.map((u, i) => <React.Fragment key={i}><span title={u.fullname}>{(i !== 0) ? ', ' : ''}@<span style={{ textDecoration: (u.username === p.post.post.username) ? 'underline' : undefined }}>{u.username}</span></span></React.Fragment>)}
                                {(private_users.length > 0) ? <React.Fragment> and {private_users.length} private person{(private_users.length > 1 ? 's' : '')}</React.Fragment> : null}
                                <br />
                            </React.Fragment>
                        })}
                    </div>
                </Comment>
            </Comment.Group>
        </Segment>
    }
}
