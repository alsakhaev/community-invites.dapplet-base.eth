import React from 'react';
//import './App.css';
import { Image, Table, Header, Accordion, Icon, Segment, Form, Checkbox, Modal, Button, Dropdown, Message } from 'semantic-ui-react';
import { Api, UserStat } from '../api';

interface IProps {
    open: boolean;
    onClose: () => void;
    onOpen: () => void;
}

interface IState {
    short_name: string;
    name: string;
    description: string;
    date_from: string;
    date_to: string;
    id: number | null | undefined;
    isLoading: boolean;
}

export class ConferenceForm extends React.Component<IProps, IState> {

    private _api = new Api(process.env.REACT_APP_API_URL as string);

    constructor(props: IProps) {
        super(props);
        this.state = {
            short_name: '',
            name: '',
            description: '',
            date_from: '',
            date_to: '',
            id: null,
            isLoading: false
        };
    }

    handleChange = (_: any, data: any) => this.setState({ [data.name]: data.value } as any);

    onCreateHandler = async () => {
        this.setState({ isLoading: true });
        const s = this.state;
        const data = {
            name: s.name,
            short_name: s.short_name,
            description: s.description,
            date_from: s.date_from,
            date_to: s.date_to
        }
        const conference = await this._api.createConference(data);
        this.setState({ isLoading: false, id: conference.id });
    }

    render() {
        const p = this.props;
        const s = this.state;

        return (
            <Modal
                closeIcon
                open={p.open}
                trigger={<Dropdown.Item>Create Conference</Dropdown.Item>}
                onClose={p.onClose}
                onOpen={p.onOpen}
            >
                <Header content='New Conference' />
                <Modal.Content>

                    {(s.id) ? <Message
                        success
                        header='Conference Created'
                        content={`ID of your conference: ${s.id}`}
                    /> :
                        <Form loading={s.isLoading}>
                            <Form.Input
                                placeholder='Conference Name'
                                name='name'
                                label='Conference Name'
                                value={s.name}
                                onChange={this.handleChange}
                            />
                            <Form.Input
                                placeholder='Short Name'
                                name='short_name'
                                label='Short Name'
                                value={s.short_name}
                                onChange={this.handleChange}
                            />
                            <Form.TextArea
                                placeholder='Description'
                                name='description'
                                label='Description'
                                value={s.description}
                                onChange={this.handleChange}
                            />
                            <Form.Input
                                placeholder='YYYY-MM-DD'
                                name='date_from'
                                label='Start Date'
                                value={s.date_from}
                                onChange={this.handleChange}
                            />
                            <Form.Input
                                placeholder='YYYY-MM-DD'
                                name='date_to'
                                label='Finish Date'
                                value={s.date_to}
                                onChange={this.handleChange}
                            />
                        </Form>}
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={p.onClose}>{(!s.id) ? 'Cancel' : 'Done'}</Button>
                    {(!s.id) ? <Button primary loading={s.isLoading} type='submit' onClick={this.onCreateHandler}>Create</Button> : null}
                </Modal.Actions>
            </Modal>
        );
    }
}