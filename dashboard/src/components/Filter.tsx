import React from 'react';
//import './App.css';
import { List, Image, Table, Header, Feed, Comment, Input, Dropdown, Select } from 'semantic-ui-react';
import { Api, PostStat, UserStat } from '../api';

interface IProps {

}

interface IState {
}

export class Filter extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
        };
    }

    render() {

        const options = [
            { key: 'all', text: 'All', value: 'all' },
            { key: 'articles', text: 'Articles', value: 'articles' },
            { key: 'products', text: 'Products', value: 'products' },
        ]

        return (<Input
            fluid
            placeholder='Search...'
            value='topic:top100 wanted-by:top10'
            style={{ marginBottom: '0.5em' }}
            label={<Select style={{ width: '8em' }} compact options={options} defaultValue='all' />}
            labelPosition='left'
        />)
    }
}