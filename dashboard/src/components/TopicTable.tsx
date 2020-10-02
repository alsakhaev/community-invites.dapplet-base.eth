import React from 'react';
//import './App.css';
import { List, Image, Table, Header, Feed, Comment } from 'semantic-ui-react';
import { Api, PostStat, UserStat } from '../api';
import sortBy from 'lodash.sortby';

interface IProps {
    posts: PostStat[];
}

interface IState {
    column: string;
    direction: 'ascending' | 'descending';
}

export class TopicTable extends React.Component<IProps, IState> {

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
                <Table sortable celled fixed>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell width={4} sorted={column === 'username' ? direction : undefined} onClick={() => this.sortBy('username')}>Post</Table.HeaderCell>
                            <Table.HeaderCell width={1} sorted={column === 'invitations_count' ? direction : undefined} onClick={() => this.sortBy('invitations_count')}>Invitations</Table.HeaderCell>
                            <Table.HeaderCell width={1} sorted={column === 'conferences_count' ? direction : undefined} onClick={() => this.sortBy('conferences_count')}>Conferences</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {data.map(d => (
                            <Table.Row key={d.id}>
                                <Table.Cell>
                                    <Comment.Group minimal>
                                        <Comment>
                                            <Comment.Avatar as='a' src={d.img} />
                                            <Comment.Content>
                                                <Comment.Author as='a'><a href={`https://twitter.com/${d.username}/status/${d.id}`} target="_blank" style={{ cursor: 'pointer' }}>{d.fullname}</a></Comment.Author>
                                                <Comment.Metadata><span>@{d.username}</span></Comment.Metadata>
                                                <Comment.Text><p>{d.text}</p></Comment.Text>
                                            </Comment.Content>
                                        </Comment>
                                    </Comment.Group>
                                </Table.Cell>
                                <Table.Cell>{d.invitations_count}</Table.Cell>
                                <Table.Cell>{d.conferences_count}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        );
    }
}