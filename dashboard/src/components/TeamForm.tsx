import React from 'react';
//import './App.css';
import { Image, Table, Header, Accordion, Icon, Segment, Form, Checkbox, Modal, Button, InputOnChangeData, Message, Dropdown } from 'semantic-ui-react';
import { Api, UserStat } from '../api';

interface IProps {
    open: boolean;
    onClose: () => void;
    onOpen: () => void;
}

interface IState {
    name: string;
    tags: string;
    id: string | null;
    isLoading: boolean;
    copied: boolean;
}

export class TeamForm extends React.Component<IProps, IState> {

    private _api = new Api(process.env.REACT_APP_API_URL as string);

    constructor(props: IProps) {
        super(props);
        this.state = {
            name: '',
            tags: '',
            id: null,
            isLoading: false,
            copied: false
        };
    }

    handleChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => this.setState({ [data.name]: data.value } as any);

    onCreateHandler = async () => {
        this.setState({ isLoading: true });
        const s = this.state;
        const data = {
            name: s.name,
            tags: s.tags.split(';').map(x => ({ name: x }))
        }
        const team = await this._api.createTeam(data);
        this.setState({ isLoading: false, id: team.id });
    }

    render() {
        const p = this.props;
        const s = this.state;

        return (
            <Modal
                closeIcon
                open={p.open}
                trigger={<Dropdown.Item>Create Team</Dropdown.Item>}
                onClose={p.onClose}
                onOpen={p.onOpen}
            >
                <Header content='New Team' />
                <Modal.Content>

                    {(s.id) ? <Message
                        success
                        header='Team Created'
                        content={<span>
                            Private ID of your team: {s.id}
                            <Icon
                                style={{ marginLeft: '4px' }}
                                name={(this.state.copied) ? 'checkmark' : 'copy outline'}
                                link
                                title={(this.state.copied) ? 'Copied' : 'Copy'}
                                onClick={() => {
                                    s.id && navigator.clipboard.writeText(s.id);
                                    this.setState({ copied: true });
                                    setTimeout(() => this.setState({ copied: false }), 3000);
                                }}
                            />
                        </span>}
                    /> :
                        <Form loading={s.isLoading}>
                            <Form.Input
                                placeholder='Team Name'
                                name='name'
                                label='Team Name'
                                value={s.name}
                                onChange={this.handleChange}
                            />
                            <Form.Input
                                placeholder='Tags'
                                name='tags'
                                label='Tags (semicolon separated)'
                                value={s.tags}
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