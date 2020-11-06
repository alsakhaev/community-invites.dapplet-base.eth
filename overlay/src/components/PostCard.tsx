import React from 'react';
import { Card, Segment, Image, Comment, Button } from 'semantic-ui-react';
import { Post } from '../dappletBus';

interface IProps {
    post: Post;
    card?: boolean;
    style?: any;
}

interface IState { }

export class PostCard extends React.Component<IProps, IState> {
    render() {
        const p = this.props.post;
        if (this.props.card) return (<Card fluid style={this.props.style}>
            <Card.Content>
                <Image
                    floated='left'
                    size='mini'
                    style={{ borderRadius: 34 }}
                    src={p.authorImg}
                />
                <Card.Header style={{ fontSize: '1.15em'}}>{p.authorFullname}</Card.Header>
                <Card.Meta>@{p.authorUsername}</Card.Meta>
                <Card.Description style={{ textOverflow: 'ellipsis', overflow: 'hidden'}}>
                    {p.text}
                </Card.Description>
            </Card.Content>
        </Card>);
        else return (<Segment style={this.props.style}>
            <Comment.Group>
                <Comment>
                    <Comment.Avatar src={p.authorImg} />
                    <Comment.Content>
                        <Comment.Author>{p.authorFullname}</Comment.Author>
                        <Comment.Metadata>
                            @{p.authorUsername} <Button icon='external' title='Open the post in Twitter' basic size='mini' style={{ boxShadow: 'none', padding: '2px', margin: '0', position: 'relative', top: '-1px' }} onClick={() => window.open(`https://twitter.com/${p.authorUsername}/status/${p.id}`, '_blank')} />
                        </Comment.Metadata>
                        <Comment.Text>{p.text}</Comment.Text>
                    </Comment.Content>
                </Comment>
            </Comment.Group>
        </Segment>);
    }
}
