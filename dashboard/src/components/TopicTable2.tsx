import React from 'react';
//import './App.css';
import { List, Image, Table, Header, Feed, Comment, Button, Checkbox, Icon } from 'semantic-ui-react';
import { Api, PostStat, UserStat } from '../api';
import sortBy from 'lodash.sortby';

interface IProps {
    posts: PostStat[];
    onPostCheck: (post: PostStat, checked: boolean) => void;
}

interface IState {
    column: string;
    direction: 'ascending' | 'descending';
}

export class TopicTable2 extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            column: 'invitations_count',
            direction: 'descending'
        };
    }

    sortBy(column: string) {
        const direction = (column === this.state.column) ? ((this.state.direction === 'ascending') ? 'descending' : 'ascending') : 'ascending';
        this.setState({ column, direction });
    }

    render() {
        const { posts: users } = this.props;
        const { column, direction } = this.state;
        const data = (direction === 'ascending') ? sortBy(users, [column]) : sortBy(users, [column]).reverse();

        return (
            <div className="App-container">
                <Table sortable celled fixed unstackable >
                    <Table.Body>
                        {data.map((d, i) => (
                            <Table.Row key={d.id}>
                                <Table.Cell style={{ width: '3em' }} verticalAlign='top'>{i + 1}</Table.Cell>
                                <Table.Cell>
                                    <Comment.Group minimal>
                                        <Comment>
                                            <Comment.Avatar as='a' src={d.img} />
                                            <Comment.Content>
                                                <Comment.Author style={{ display: 'inline' }}>{d.fullname}</Comment.Author>
                                                <Comment.Metadata>@{d.username} <Button icon='external' title='Open the post in Twitter' basic size='mini' style={{ boxShadow: 'none', padding: '2px', margin: '0', position: 'relative', top: '-1px' }} onClick={() => window.open(`https://twitter.com/${d.username}/status/${d.id}`, '_blank')} /></Comment.Metadata>
                                                <Comment.Text>{d.text}</Comment.Text>
                                            </Comment.Content>
                                        </Comment>
                                    </Comment.Group>
                                </Table.Cell>
                                <Table.Cell style={{ width: '3em', overflow: 'hidden', textOverflow: 'clip' }} verticalAlign='top'>
                                    <Checkbox onChange={(_, data) => this.props.onPostCheck(d, data.checked as boolean)} defaultChecked />
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        );
    }
}