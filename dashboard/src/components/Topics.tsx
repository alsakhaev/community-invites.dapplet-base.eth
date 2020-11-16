import React from 'react';
//import './App.css';
import { Table, Comment, Button, Segment } from 'semantic-ui-react';
import { PostStat } from '../api';
import sortBy from 'lodash.sortby';
import Twemoji from 'react-twemoji';

interface IProps {
    posts: (PostStat & { checked?: boolean })[];
    onPostCheck: (post: PostStat, checked: boolean) => void;
    loading: boolean;
}

interface IState {
    column: string | null;
    direction: 'ascending' | 'descending';
}

export class Topics extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            column: null,
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
        const data = (column) ? ((direction === 'ascending') ? sortBy(users, [column]) : sortBy(users, [column]).reverse()) : users;

        if (data.length === 0) {
            return <Segment textAlign='center'>No matching entries found</Segment>
        }

        return (
            <Segment loading={this.props.loading} style={{ padding: '0', boxShadow: 'initial', border: 'initial' }}>
                <Table sortable celled fixed unstackable >
                    <Table.Body>
                        {data.map((d, i) => (
                            <Table.Row key={d.id}>
                                <Table.Cell style={{ width: '3em' }} verticalAlign='top'>{i + 1}</Table.Cell>
                                <Table.Cell>
                                    <Comment.Group minimal>
                                        <Comment>
                                            <Comment.Avatar as='a' src={d.img} />
                                            <Comment.Content style={{ display: 'flex' }}>
                                                <div style={{ flex: 'auto' }}>
                                                    <Comment.Author style={{ display: 'inline' }}><Twemoji style={{ display: 'inline' }}>{d.fullname}</Twemoji></Comment.Author>
                                                    <Comment.Metadata>@{d.username} <Button icon='external' title='Open the post in Twitter' basic size='mini' style={{ boxShadow: 'none', padding: '2px', margin: '0', position: 'relative', top: '-1px' }} onClick={() => window.open(`https://twitter.com/${d.username}/status/${d.id}`, '_blank')} /></Comment.Metadata>
                                                    <Comment.Text style={{ wordBreak: 'break-word' }}>{d.text}</Comment.Text>
                                                </div>
                                                <div style={{ minWidth: '8em', marginLeft: '10px', lineHeight: '19px' }} >
                                                    {d.team_rating !== undefined ? <div>Team Rating: {d.team_rating}</div> : null}
                                                    <div>Discussed by: {d.discussed_by}</div>
                                                </div>
                                            </Comment.Content>
                                        </Comment>
                                    </Comment.Group>
                                </Table.Cell>
                                {/* <Table.Cell style={{ width: '3em', overflow: 'hidden', textOverflow: 'clip' }} verticalAlign='top'>
                                    <Checkbox onChange={(_, data) => this.props.onPostCheck(d, data.checked as boolean)} defaultChecked={d.checked} defaultIndeterminate={d.checked === undefined}/>
                                </Table.Cell> */}
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}