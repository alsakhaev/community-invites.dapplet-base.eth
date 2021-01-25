import React from 'react';
import { Button, ButtonProps, Dropdown, DropdownItemProps, Icon } from 'semantic-ui-react';
import { SemanticCOLORS } from 'semantic-ui-react/dist/commonjs/generic';

interface IProps {
    icon: string;
    primary: boolean;
    toggle: boolean;
    active: boolean;
    onClick: () => void;
    onDoubleClick: () => void;
    loading: boolean;
    disabled: boolean;
}

interface IState {

}

export class DoubleClickButton extends React.Component<IProps, IState> {

    _prevent = false;
    _delay = 500;
    _timer: any = 0;

    _handleClick() {
        let me = this;
        me._timer = setTimeout(function () {
            if (!me._prevent) {
                me.props.onClick?.();
            }
            me._prevent = false;
        }, me._delay);
    }

    _handleDoubleClick() {
        clearTimeout(this._timer);
        this._prevent = true;
        this.props.onDoubleClick?.();
    }

    render() {
        // const p = this.props;
        // const s = this.state;

        return <Button
            icon={this.props.icon}
            primary={this.props.primary}
            toggle={this.props.toggle}
            active={this.props.active}
            loading={this.props.loading}
            disabled={this.props.disabled}
            onClick={this._handleClick.bind(this)}
            onDoubleClick={this._handleDoubleClick.bind(this)}
        />
    }
}