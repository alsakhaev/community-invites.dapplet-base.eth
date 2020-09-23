import React from 'react';
import { Link } from "react-router-dom";
import { Button, Divider, Card, Accordion, Icon, Segment, Image, Comment, Label } from 'semantic-ui-react';
import { Profile } from '../dappletBus';

interface IProps {
    profile: Profile;
    card?: boolean;
    badge?: string;
}

interface IState { }

export class ProfileCard extends React.Component<IProps, IState> {
    render() {
        const p = this.props.profile;
        if (this.props.card) return (<Card fluid>
            <Card.Content>
                <Image
                    floated='left'
                    size='mini'
                    style={{ borderRadius: 34, marginBottom: 0 }}
                    src={p.img}
                />
                <Card.Header>{p.fullname} {(this.props.badge) ? <Label style={{ position: 'relative', top: '-3px' }} color='blue' size='tiny'>{this.props.badge}</Label> : <Label title='You can change this setting in conference details' style={{ position: 'relative', top: '-3px' }} basic color='grey' size='tiny'>No label</Label>}</Card.Header>
                <Card.Meta>@{p.username}</Card.Meta>
            </Card.Content>
        </Card>);
        else return (<Segment>
            <Comment.Group>
                <Comment>
                    <Comment.Avatar src={p.img} />
                    <Comment.Content>
                        <Comment.Author as='a'>{p.fullname}</Comment.Author>
                        <Comment.Metadata>
                            <div>@{p.username}</div>
                        </Comment.Metadata>
                    </Comment.Content>
                </Comment>
            </Comment.Group>
        </Segment>);
    }
}
