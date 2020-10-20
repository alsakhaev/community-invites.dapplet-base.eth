import React from 'react';
//import './App.css';
import { List, Image, Table, Header, Accordion, Icon, Container, Segment } from 'semantic-ui-react';
import { Api, PostStat, UserStat } from '../api';
import sortBy from 'lodash.sortby';

interface IProps {
    users: UserStat[];
    onUserSelect: (user: UserStat | null) => void;
    loading: boolean;
}

interface IState {
    column: string;
    direction: 'ascending' | 'descending';
    activeIndex: number;
}

export class People extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            column: 'invitations_to_count',
            direction: 'descending',
            activeIndex: -1
        };
    }

    sortBy(column: string) {
        const direction = (column === this.state.column) ? ((this.state.direction === 'ascending') ? 'descending' : 'ascending') : 'ascending';
        this.setState({ column, direction });
    }

    setActive(index: number) {
        const { activeIndex } = this.state
        const newIndex = activeIndex === index ? -1 : index

        this.setState({ activeIndex: newIndex });
        this.props.onUserSelect(newIndex === -1 ? null : this.props.users[newIndex]);
    }

    render() {
        const { users } = this.props;
        const { column, direction, activeIndex } = this.state;

        //const data = (direction === 'ascending') ? sortBy(users, [column]) : sortBy(users, [column]).reverse();

        if (users.length === 0) {
            return <Segment textAlign='center'>No matching entries found</Segment>
        }

        const panels = users.map(u => ({
            key: u.namespace + '/' + u.username,
            title: {
                icon: {
                    style: { top: '0.5em', position: 'relative' },
                    name: 'dropdown icon'
                },
                content: <div style={{ display: 'flex', marginLeft: '1.5em', top: '-1.5em', position: 'relative', height: '1em' }}>
                    <Header as='h4' image style={{ flex: 'auto' }}>
                        <Image src={u.img} rounded size='mini' />
                        <Header.Content style={{ padding: '0 0 0 .75rem' }}>
                            {u.fullname}
                            <Header.Subheader>@{u.username}</Header.Subheader>
                        </Header.Content>
                    </Header>
                    <div style={{ width: '10em' }}>
                        <div>Rating: {u.invitations_to_count}</div>
                        <div>Wanted by: {u.users_to_count}</div>
                    </div>
                </div>
            },
            content: {
                content: <div>
                    Incoming: {u.invitations_to_count} <br />
                    Outgoing: {u.invitations_from_count} <br />
                    Attendance: {u.attendance_count}
                </div>
            }
        }));

        return (
            <Segment loading={this.props.loading} style={{ padding: '0', boxShadow: 'initial', border: 'initial' }}>
                <Accordion as={Table} sortable celled fixed unstackable>
                    <Table.Body>
                        {users.map((d, i) => (
                            <Table.Row key={i}>
                                <Table.Cell style={{ width: '3em' }} verticalAlign='top'>{i + 1}</Table.Cell>
                                <Table.Cell>
                                    <Accordion.Title style={{ padding: '0' }} active={activeIndex === i} onClick={() => this.setActive(i)}>
                                        <Icon name='dropdown' style={{ top: '0.5em', position: 'relative' }} />
                                        <div style={{ display: 'flex', marginLeft: '1.5em', top: '-1.5em', position: 'relative', height: '1em' }}>
                                            <Header as='h4' image style={{ margin: '0 auto 0 0', whiteSpace: 'nowrap' }}>
                                                <Image src={d.img} rounded size='mini' style={{ display: 'inline-block' }} />
                                                <Header.Content style={{ padding: '0 0 0 .75rem', display: 'inline-block' }}>
                                                    {d.fullname}
                                                    <Header.Subheader>@{d.username}</Header.Subheader>
                                                </Header.Content>
                                            </Header>
                                            <div style={{ width: '10em' }} >
                                                <div>Rating: {d.invitations_to_count}</div>
                                                <div>Wanted by: {d.users_to_count}</div>
                                            </div>
                                        </div>
                                    </Accordion.Title>
                                    <Accordion.Content active={activeIndex === i}>
                                        <div>
                                            <b>Wanted by:</b><br />
                                            {d.users_to_count} people at {d.confrences_to_count} conferences to discuss {d.posts_to_count} topics
                                        {/* Incoming: {d.invitations_to_count} <br />
                                        Outgoing: {d.invitations_from_count} <br />
                                        Attendance: {d.attendance_count} */}
                                        </div>
                                    </Accordion.Content>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Accordion>
            </Segment>
        )
    }
}