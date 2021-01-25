import React from 'react';
import { Button, ButtonProps, Dropdown, DropdownItemProps, Icon } from 'semantic-ui-react';
import { SemanticCOLORS } from 'semantic-ui-react/dist/commonjs/generic';
import { SortingDirection } from '../pages/MyDiscussions';

interface IProps {
    options: string[];
    value: string;
    direction: SortingDirection;
    onDirectionChange: (direction: SortingDirection) => void;
    onValueChange: (value: string) => void;
}

interface IState {

}

export class SortingDropdown extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {

        }
    }

    _onItemClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: DropdownItemProps) => {
        const p = this.props;

        if (data.value === p.value) {
            const newDirection = (p.direction === SortingDirection.Desc) ? SortingDirection.Asc : SortingDirection.Desc;
            p.onDirectionChange(newDirection);
        } else {
            p.onValueChange(data.value as string);
        }
    }

    render() {
        const p = this.props;
        const s = this.state;

        return <Dropdown
            style={{ 
                color: 'rgb(33, 133, 208)'
            }}
            text={p.value}
            icon={<Icon
                name='dropdown'
                flipped={p.direction === SortingDirection.Desc ? undefined : 'vertically'}
                style={{ marginLeft: '0.4em' }}
            />}
        >
            <Dropdown.Menu>
                {p.options.map((x, i) => <Dropdown.Item value={x} key={x} onClick={this._onItemClick}>{x}</Dropdown.Item>)}
            </Dropdown.Menu>
        </Dropdown>;
    }
}