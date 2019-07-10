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

class App extends Component {
  constructor() {
    super();
    this.state = {
      collections: [],
      collectionId: undefined,
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
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
        this.setState({ collections, collectionId: collections[0].id });
      })
      .catch(error => {
        chrome.extension.getBackgroundPage().console.log(error);
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
    const formattedTabs = allTabs.map(tab => {
      return {
        title: tab.title,
        url: tab.url,
        favicon: tab.favIconUrl,
        collectionId: this.state.collectionId,
      };
    });

    axios.post(`${host}/api/links/`, formattedTabs).then(
      allTabs.forEach(tab => {
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
    return (
      <div className="message is-paddingless is-marginless is-clearfix">
        <form>
          <div className="field message is-small is-primary is-paddingless is-marginless">
            <div className="control message-header">
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
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
