import React from 'react';
//import './App.css';
import { Container, Placeholder, Button, Table, Comment } from 'semantic-ui-react';
import { Api, ContextVariant } from '../api';
import Twemoji from 'react-twemoji';

interface IProps { }

interface IState {
  contexts: ContextVariant[];
  isLoading: boolean;
}

export class App extends React.Component<IProps, IState> {

  private _api: Api;

  constructor(props: IProps) {
    super(props);
    this._api = new Api(process.env.REACT_APP_API_URL as string);
    this.state = {
      contexts: [],
      isLoading: true,
    };
  }

  async componentDidMount() {
    const contexts = await this._api.getContextVariants();
    this.setState({ isLoading: false, contexts });
  }

  render() {
    const s = this.state;

    if (s.isLoading) {
      return <div style={{ padding: '20px 0 0 0' }}>
        <Container>
          <h1 style={{ textAlign: 'center' }}>Top Contexts</h1>
          <Placeholder fluid>
            <Placeholder.Paragraph>
              <Placeholder.Line />
              <Placeholder.Line />
              <Placeholder.Line />
            </Placeholder.Paragraph>
          </Placeholder>
        </Container>
      </div>
    }

    return (
      <div style={{ padding: '20px 0 0 0' }}>
        <Container >
          <h2 style={{ textAlign: 'center' }}>Top Contexts</h2>

          <Table sortable celled fixed unstackable >
            <Table.Body>
              {this.state.contexts.map((x, i) => (
                <Table.Row key={x.id}>
                  <Table.Cell style={{ width: '3em' }} verticalAlign='top'>{i + 1}</Table.Cell>
                  <Table.Cell>
                    <Comment.Group minimal>
                      <Comment>
                        <Comment.Avatar as='a' src={x.parsed.authorImg} />
                        <Comment.Content>
                          <div style={{ flex: 'auto' }}>
                            <Comment.Author style={{ display: 'inline' }}><Twemoji style={{ display: 'inline' }}>{x.parsed.authorFullname}</Twemoji></Comment.Author>
                            <Comment.Metadata>@{x.parsed.authorUsername} <Button icon='external' title='Open the post in Twitter' basic size='mini' style={{ boxShadow: 'none', padding: '2px', margin: '0', position: 'relative', top: '-1px' }} onClick={() => window.open(`https://twitter.com/${x.parsed.authorUsername}/status/${x.parsed.id}`, '_blank')} /></Comment.Metadata>
                            <Comment.Text style={{ wordBreak: 'break-word' }}>{x.parsed.text}</Comment.Text>
                          </div>
                          <div style={{ lineHeight: '19px' }} >
                            <div>Views: {x.views}</div>
                          </div>
                        </Comment.Content>
                      </Comment>
                    </Comment.Group>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Container>
      </div>
    );
  }
}