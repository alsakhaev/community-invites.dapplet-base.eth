import React from 'react';
//import './App.css';
import { List, Image, Table, Header, Accordion, Icon } from 'semantic-ui-react';
import { Api, PostStat, UserStat } from '../api';
import sortBy from 'lodash.sortby';

interface IProps {
    users: UserStat[];
}

interface IState {
    column: string;
    direction: 'ascending' | 'descending';
    activeIndex: number;
}

const panels = [
    {
        key: 'what-is-dog',
        title: 'What is a dog?',
        content: [
            'A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome',
            'guest in many households across the world.',
        ].join(' '),
    },
    {
        key: 'kinds-of-dogs',
        title: 'What kinds of dogs are there?',
        content: [
            'There are many breeds of dogs. Each breed varies in size and temperament. Owners often select a breed of dog',
            'that they find to be compatible with their own lifestyle and desires from a companion.',
        ].join(' '),
    },
    {
        key: 'acquire-dog',
        title: 'How do you acquire a dog?',
        content: {
            content: (
                <div>
                    <p>
                        Three common ways for a prospective owner to acquire a dog is from
                        pet shops, private owners, or shelters.
            </p>
                    <p>
                        A pet shop may be the most convenient way to buy a dog. Buying a dog
                        from a private owner allows you to assess the pedigree and
                        upbringing of your dog before choosing to take it home. Lastly,
                        finding your dog from a shelter, helps give a good home to a dog who
                        may not find one so readily.
            </p>
                </div>
            ),
        },
    },
]

export class UsersTableMini extends React.Component<IProps, IState> {

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

        this.setState({ activeIndex: newIndex })
    }

    render() {
        const { users } = this.props;
        const { column, direction, activeIndex } = this.state;
        const data = (direction === 'ascending') ? sortBy(users, [column]) : sortBy(users, [column]).reverse();
        const panels = data.map(u => ({
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

        /*
            {<Table sortable celled fixed>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={2} sorted={column === 'username' ? direction : undefined} onClick={() => this.sortBy('username')}>User</Table.HeaderCell>
                        <Table.HeaderCell width={1} sorted={column === 'invitations_to_count' ? direction : undefined} onClick={() => this.sortBy('invitations_to_count')}>Invite In</Table.HeaderCell>
                        <Table.HeaderCell width={1} sorted={column === 'invitations_from_count' ? direction : undefined} onClick={() => this.sortBy('invitations_from_count')}>Invite Out</Table.HeaderCell>
                        <Table.HeaderCell width={1} sorted={column === 'attendance_count' ? direction : undefined} onClick={() => this.sortBy('attendance_count')}>Attendance</Table.HeaderCell>
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
                            <Table.Cell>{u.invitations_to_count}</Table.Cell>
                            <Table.Cell>{u.invitations_from_count}</Table.Cell>
                            <Table.Cell>{u.attendance_count}</Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>}
        */

        return (
            <Accordion as={Table} sortable celled fixed unstackable>
                <Table.Body>
                    {data.map((d, i) => (
                        <Table.Row key={i}>
                            <Table.Cell style={{ width: '3em' }} verticalAlign='top'>{i + 1}</Table.Cell>
                            <Table.Cell>
                                <Accordion.Title style={{ padding: '0' }} active={activeIndex === i} onClick={() => this.setActive(i)}>
                                    <Icon name='dropdown' style={{ top: '0.5em', position: 'relative' }} />
                                    <div style={{ display: 'flex', marginLeft: '1.5em', top: '-1.5em', position: 'relative', height: '1em' }}>
                                        <Header as='h4' image style={{ flex: 'auto' }}>
                                            <Image src={d.img} rounded size='mini' />
                                            <Header.Content style={{ padding: '0 0 0 .75rem' }}>
                                                {d.fullname}
                                                <Header.Subheader>@{d.username}</Header.Subheader>
                                            </Header.Content>
                                        </Header>
                                        <div style={{ width: '10em' }}>
                                            <div>Rating: {d.invitations_to_count}</div>
                                            <div>Wanted by: {d.users_to_count}</div>
                                        </div>
                                    </div>
                                </Accordion.Title>
                                <Accordion.Content active={activeIndex === i}>
                                    <div>
                                        <b>Wanted by:</b><br/>
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
        )

        return (
            <Accordion styled defaultActiveIndex={0} panels={panels} />
        );
    }
}