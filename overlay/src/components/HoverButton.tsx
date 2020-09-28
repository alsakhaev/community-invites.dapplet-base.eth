import React from 'react';
import { Button, ButtonProps } from 'semantic-ui-react';
import { SemanticCOLORS } from 'semantic-ui-react/dist/commonjs/generic';

interface HoverButtonProps extends ButtonProps {
    hoverColor?: SemanticCOLORS;
    hoverText?: string;
}

interface HoverButtonState {
    isHover: boolean;
}

export class HoverButton extends React.Component<HoverButtonProps, HoverButtonState> {
    constructor(props: HoverButtonProps) {
        super(props);
        this.state = {
            isHover: false
        }
    }

    mouseOverHandler = () => {
        this.setState({ isHover: true });
    }

    mouseOutHandler = () => {
        this.setState({ isHover: false });
    }

    render() {
        const p = this.props;
        const s = this.state;
        const color = (s.isHover) ? (p.hoverColor ?? p.color) : p.color;
        const text = (s.isHover) ? (p.hoverText ?? p.children) : p.children;

        return <Button 
            onMouseOver={this.mouseOverHandler} 
            onMouseOut={this.mouseOutHandler} 
            color={color} 
            floated={p.floated}
            size={p.size}
            loading={p.loading}
            disabled={p.disabled}
            onClick={(e,d) => (this.mouseOutHandler(), p.onClick?.(e,d))}
            index={p.index}
        >{text}</Button>;
    }
}