import React from 'react';
import { Link } from "react-router-dom";
import { Button, Divider, Card, Accordion, Icon, Segment, Image, Comment, Label } from 'semantic-ui-react';
import { Post } from '../dappletBus';

interface IProps {
    post: Post;
    card?: boolean;
}

interface IState { }

export class PostCard extends React.Component<IProps, IState> {
    render() {
        const p = this.props.post;
        if (this.props.card) return (<Card fluid>
            <Card.Content>
                <Image
                    floated='left'
                    size='mini'
                    style={{ borderRadius: 34 }}
                    src={p.authorImg}
                />
                <Card.Header>{p.authorFullname}</Card.Header>
                <Card.Meta>@{p.authorUsername}</Card.Meta>
                <Card.Description style={{ wordBreak: 'break-all'}}>
                    {p.text}
                </Card.Description>
            </Card.Content>
        </Card>);
        else return (<Segment>
            <Comment.Group>
                <Comment>
                    <Comment.Avatar src={p.authorImg} />
                    <Comment.Content>
                        <Comment.Author as='a'>{p.authorFullname}</Comment.Author>
                        <Comment.Metadata>
                            <div>@{p.authorUsername}</div>
                        </Comment.Metadata>
                        <Comment.Text>{p.text}</Comment.Text>
                    </Comment.Content>
                </Comment>
            </Comment.Group>
        </Segment>);
    }
}
