import React from 'react';
//import './App.css';
import { List, Image, Table, Header, Feed, Comment, Button, Checkbox } from 'semantic-ui-react';
import { Api, PostStat, UserStat } from '../api';
import sortBy from 'lodash.sortby';

interface IProps {
    posts: PostStat[];
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
                                <Table.Cell style={{ width: '3em'}} verticalAlign='top'>{i + 1}</Table.Cell>
                                <Table.Cell>
                                    <Comment.Group minimal>
                                        <Comment>
                                            <Comment.Avatar as='a' src={d.img} />
                                            <Comment.Content>
                                                <Comment.Author as='a' href={`https://twitter.com/${d.username}/status/${d.id}`} target="_blank" style={{ cursor: 'pointer' }}>{d.fullname}</Comment.Author>
                                                <Comment.Metadata><span>@{d.username}</span></Comment.Metadata>
                                                <Comment.Text><p>{d.text}</p></Comment.Text>
                                            </Comment.Content>
                                        </Comment>
                                    </Comment.Group>
                                </Table.Cell>
                                <Table.Cell style={{ width: '3em'}} verticalAlign='top'><Checkbox defaultChecked/></Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        );
    }
}