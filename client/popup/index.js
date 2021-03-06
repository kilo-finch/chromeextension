/* eslint-disable no-return-assign */
// chrome.extension.getBackgroundPage().console.log() console logs in extension
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const getTabs = function(object) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(object, function(data) {
      resolve(data);
    });
  });
};

if (process.env.NODE_ENV === 'development') {
  var host = 'http://localhost:8080';
} else {
  host = 'https://nak-tabs.herokuapp.com';
}

const initialState = {
  collections: [],
  tabs: [],
  collectionId: undefined,
};
class App extends Component {
  constructor() {
    super();
    this.state = initialState;

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.setState({
      collections: JSON.parse(localStorage.getItem('collections')) || [],
    });

    getTabs({}).then(tabs => this.setState({ tabs }));

    axios
      .get(`${host}/api/collections/`)
      .then(res => {
        const collections = res.data.map(team => {
          return team.collections;
        });
        return collections;
      })
      .then(teams => {
        return teams.reduce((acc, team) => {
          acc = [...acc, ...team];
          return acc;
        }, []);
      })
      .then(collections => {
        this.setState(
          { collections, collectionId: collections[0].id },
          function() {
            localStorage.setItem(
              'collections',
              JSON.stringify(this.state.collections)
            );
          }
        );
      })
      .catch(error => {
        chrome.extension.getBackgroundPage().console.log(error);
        if (error && error.response.status === 403) {
          localStorage.clear();
          this.setState(initialState);
        }
      });
  }

  sendToHomePage() {
    chrome.tabs.create({ url: `${host}/home` });
  }
  saveTab(tab) {
    const formattedTab = {
      title: tab.title,
      url: tab.url,
      favicon: tab.favIconUrl,
      collectionId: this.state.collectionId,
    };

    axios
      .post(`${host}/api/links/`, [formattedTab])
      .then(this.closeTab(tab.id))
      .catch(error => {
        chrome.extension.getBackgroundPage().console.log(error);
      });
  }

  saveAllTabs(allTabs) {
    this.sendToHomePage();
    let formattedTabs = allTabs.map(tab => {
      return {
        title: tab.title,
        url: tab.url,
        favicon: tab.favIconUrl,
        collectionId: this.state.collectionId,
      };
    });
    formattedTabs = formattedTabs.filter(tab => tab.title !== 'nak');
    axios.post(`${host}/api/links/`, formattedTabs).then(
      allTabs
        .filter(tab => tab.title !== 'nak')
        .forEach(tab => {
          return this.closeTab(tab.id);
        })
    );
  }

  closeTab(id) {
    chrome.tabs.remove(id);
    this.setState(state => {
      return { tabs: state.tabs.filter(el => el.id !== id) };
    });
  }

  handleChange(event) {
    this.setState({
      collectionId: event.target.value,
    });
  }

  render() {
    const tabs = this.state.tabs;
    const collections = this.state.collections;
    return collections.length ? (
      <div className="message is-paddingless is-marginless is-clearfix">
        <form>
          <div className="field message is-small is-primary is-paddingless is-marginless">
            <div className="control level message-header">
              <p className="level-left">Collection: </p>
              <div className="select is-info is-small">
                <select
                  value={this.state.collectionId}
                  onChange={this.handleChange}
                >
                  {collections
                    ? collections.map(collection => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))
                    : null}
                </select>
              </div>
            </div>
          </div>
        </form>
        {tabs ? (
          <div>
            <table className="">
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  className="field is-grouped is-grouped-multiline has-icons-left has-icons-right"
                >
                  <tr className="">
                    <div className="control">
                      <div className="tags has-addons">
                        <span
                          className="icon is-small has-text-success"
                          onClick={() => this.saveTab(tab)}
                        >
                          <i
                            className="fas fa-check-square"
                            aria-hidden="true"
                          />
                        </span>
                        <a className="tag">
                          <figure className="image is-16x16">
                            <img src={tab.favIconUrl} />
                          </figure>
                          <div className="field" style={{ width: '210px' }}>
                            {tab.title.slice(0, 34)}
                          </div>
                        </a>
                        <a
                          className="delete is-small"
                          onClick={() => this.closeTab(tab.id)}
                        />
                      </div>
                    </div>
                  </tr>
                </div>
              ))}
            </table>
            <br />
            <button
              className="button is-info is-outlined"
              type="button"
              onClick={() => {
                this.saveAllTabs(tabs);
              }}
            >
              Save All Tabs
            </button>{' '}
            <button
              className="button is-info is-outlined"
              type="submit"
              onClick={this.sendToHomePage}
            >
              My Collection
            </button>
          </div>
        ) : (
          <h1>loading</h1>
        )}
      </div>
    ) : (
      <div className="level">
        <div className="field message is-small is-primary is-paddingless is-marginless">
          <div className="control level message-header">
            <p style={{ paddingLeft: '20px' }} className="level-item">
              Please visit NAK to login!
            </p>
          </div>{' '}
        </div>
        <br />
        <div style={{ paddingLeft: '83px' }}>
          <button
            type="button"
            className="button is-link level-item is-size-6 has-text-weight-bold"
            onClick={this.sendToHomePage}
          >
            Visit NAK
          </button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
