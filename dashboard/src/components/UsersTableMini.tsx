import React from 'react';
//import './App.css';
import { List, Image, Table, Header } from 'semantic-ui-react';
import { Api, PostStat, UserStat } from '../api';
import sortBy from 'lodash.sortby';

interface IProps {
    users: UserStat[];
}

interface IState {
    column: string;
    direction: 'ascending' | 'descending';
}

export class UsersTableMini extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            column: 'invitations_to_count',
            direction: 'descending'
        };
    }

    sortBy(column: string) {
        const direction = (column === this.state.column) ? ((this.state.direction === 'ascending') ? 'descending' : 'ascending') : 'ascending';
        this.setState({ column, direction });
    }

    render() {
        const { users } = this.props;
        const { column, direction } = this.state;
        const data = (direction === 'ascending') ? sortBy(users, [column]) : sortBy(users, [column]).reverse();

        return (
            <div className="App-container">
                <Table sortable celled fixed>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell width={2} sorted={column === 'username' ? direction : undefined} onClick={() => this.sortBy('username')}>User</Table.HeaderCell>
                            {/* <Table.HeaderCell width={1} sorted={column === 'invitations_to_count' ? direction : undefined} onClick={() => this.sortBy('invitations_to_count')}>Invite In</Table.HeaderCell>
                            <Table.HeaderCell width={1} sorted={column === 'invitations_from_count' ? direction : undefined} onClick={() => this.sortBy('invitations_from_count')}>Invite Out</Table.HeaderCell>
                            <Table.HeaderCell width={1} sorted={column === 'attendance_count' ? direction : undefined} onClick={() => this.sortBy('attendance_count')}>Attendance</Table.HeaderCell> */}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {data.map(u => (
                            <Table.Row key={u.username}>
                                <Table.Cell style={{ display: 'flex'}}>
                                    <Header as='h4' image style={{ flex: 'auto'}}>
                                        <Image src={u.img} rounded size='mini' />
                                        <Header.Content>
                                            <a href={`https://twitter.com/${u.username}`} target="_blank" style={{ cursor: 'pointer', color: '#000' }}>{u.fullname}</a>
                                            <Header.Subheader>@{u.username}</Header.Subheader>
                                        </Header.Content>
                                    </Header>
                                    <div style={{ width: '10em'}}>
                                        <div>Rating: {u.invitations_to_count}</div>
                                        <div>Wanted by: {u.invitations_to_count}</div>
                                    </div>
                                </Table.Cell>
                                {/* <Table.Cell>{u.invitations_to_count}</Table.Cell>
                                <Table.Cell>{u.invitations_from_count}</Table.Cell>
                                <Table.Cell>{u.attendance_count}</Table.Cell> */}
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        );
    }
}