import React from 'react';
//import './App.css';
import { List, Image, Table, Header, Feed, Comment, Input, Dropdown, Select } from 'semantic-ui-react';
import { Api, PostStat, UserStat } from '../api';
import SearchString from 'search-string';

type Condition = {
    keyword: string;
    value: string;
    negated: boolean;
}

interface IProps {
    options: { default?: boolean, text: string, filter: Condition[] }[];
    defaultValue: string;
}

interface IState {
    searchString: string;
    parsed: string;
}

const toQueryString = (conditions: Condition[]) => {
    const searchString = SearchString.parse('');
    conditions.forEach(c => searchString.addEntry(c.keyword, c.value, c.negated));
    return searchString.toString();
}

export class Filter extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            searchString: toQueryString(this.props.options.find(x => x.default === true)!.filter),
            parsed: ''
        };
    }

    setFilter(searchString: string) {
        this.setState({
            searchString
        });
    }

    render() {

        return (<Input
            fluid
            placeholder='Search...'
            value={this.state.searchString}
            style={{ marginBottom: '0.5em' }}
            onChange={(e, d) => this.setFilter(d.value)}
            label={
                <Select
                    style={{ width: '10em' }}
                    compact
                    options={this.props.options.map((x, i) => ({ ...x, key: i, value: toQueryString(x.filter) }))}
                    defaultValue={toQueryString(this.props.options.find(x => x.default === true)!.filter)}
                    onChange={(e, d) => this.setFilter(d.value as string)}
                />
            }
            labelPosition='left'
        />)
    }
}