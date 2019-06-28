import React, { Component } from "react";
import ReactDOM from "react-dom";

const getTabs = function(object) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(object, function(data) {
      resolve(data);
    });
  });
};

class App extends Component {
  constructor() {
    super();
    this.state = {};
    this.closeTab = this.closeTab.bind(this);
  }

  closeTab(id) {
    chrome.tabs.remove(id);
    this.setState(state => {
      return { tabs: state.tabs.filter(el => el.id !== id) };
    });
  }

  componentDidMount() {
    getTabs({}).then(tabs => this.setState({ tabs }));
  }

  render() {
    const tabs = this.state.tabs;
    return tabs ? (
      tabs.map(tab => (
        <div className="field is-grouped is-grouped-multiline has-icons-left has-icons-right">
          <div className="control">
            <div className="tags has-addons">
            <span className="icon is-small">
                    <i className="fas fa-plus" aria-hidden="true" />
                  </span>
              <a className="tag is-link">
                <figure className="image is-16x16">
                  <img src={tab.favIconUrl} />

                </figure>
                <div className='field' style={{width:"200px"}}>{tab.title.slice(0, 35)}</div>
              </a>
              <a
                className="tag is-delete"
                onClick={() => this.closeTab(tab.id)}
              />
            </div>
          </div>
        </div>
      ))
    ) : (
      <h1>loading</h1>
    );
  }
}


ReactDOM.render(<App />, document.getElementById("container"));
