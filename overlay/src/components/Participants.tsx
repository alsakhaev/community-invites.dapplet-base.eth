import React from 'react';
import { Icon, Grid } from 'semantic-ui-react';

interface IProps {
}

interface IState { }

export class Participants extends React.Component<IProps, IState> {

    render() {

        const data = [{
            fullname: 'Dmitry Palchun',
            username: 'ethernian',
            isWant: true,
            isMatch: true,
            isWantsMe: true
        }, {
            fullname: 'Alexander Sakhaev',
            username: 'alsakhaev',
            isWant: true,
            isMatch: false,
            isWantsMe: false
        }, {
            fullname: 'Petr Petrov',
            username: 'ppetrov',
            isWant: true,
            isMatch: false,
            isWantsMe: false
        }, {
            fullname: 'Sidorov',
            username: 'sidorov',
            isWant: false,
            isMatch: false,
            isWantsMe: true
        }];

        return (<div>
            {/* <Grid columns='equal'>
                <Grid.Row style={{ padding: 0, fontSize: '10px', lineHeight: '10px' }}>
                    <Grid.Column >

                    </Grid.Column>
                    <Grid.Column width={2}>
                        I want
                </Grid.Column>
                    <Grid.Column width={2}>
                        MATCH
                </Grid.Column>
                    <Grid.Column width={2}>
                        Want me
                </Grid.Column>
                </Grid.Row>
                {data.map((r, i) => <Grid.Row style={{ padding: 0 }} key={i}>
                    <Grid.Column >
                        {r.fullname} @{r.username}
                    </Grid.Column>
                    <Grid.Column width={2}>
                        <Checkbox checked={r.isWant} />
                    </Grid.Column>
                    <Grid.Column width={2}>
                        {(r.isMatch) ? <Icon name='handshake' /> : null}
                    </Grid.Column>
                    <Grid.Column width={2}>
                        {(r.isWantsMe) ? <Icon name='circle' /> : null}
                    </Grid.Column>
                </Grid.Row>)}
            </Grid>
            <br/><br/> */}<br/> 
            <Grid columns='equal'>
                {data.map((r, i) => <Grid.Row style={{ padding: 0 }} key={i}>
                    <Grid.Column width={1}>
                        {this.getIcon(r)}
                    </Grid.Column>
                    <Grid.Column >
                        {r.fullname} @{r.username} <a style={{ cursor: 'pointer' }}>by 3 topics</a>
                    </Grid.Column>
                </Grid.Row>)}
            </Grid>
        </div>);
    }

    getIcon(r: any) {
        if (r.isWant && r.isWantsMe) {
            return <Icon name='handshake outline' />
        } else if (r.isWant) {
            return <Icon name='hand paper outline' rotated='clockwise' style={{ position: 'relative', left: '3px' }} />
        } else if (r.isWantsMe) {
            return <Icon name='hand paper outline' style={{ transform: 'scale(-1, 1) rotate(90deg)', position: 'relative', left: '-1px' }} />
        } else {
            return null;
        }
    }
}
