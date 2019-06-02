import React from "react";
import Sidebar from "react-sidebar";
import "./sidebar.scss";

const mql = window.matchMedia(`(min-width: 900px)`);

export default class SidebarNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarDocked: mql.matches,
      sidebarOpen: false
    };

    this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
  }

  componentWillMount() {
    mql.addListener(this.mediaQueryChanged);
  }

  componentWillUnmount() {
    mql.removeListener(this.mediaQueryChanged);
  }

  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  mediaQueryChanged() {
    this.setState({ sidebarDocked: mql.matches, sidebarOpen: false });
  }

  render() {
    let admin = false;
    if (
      this.props.user &&
      this.props.user.info.email === "jewishbookcorner@gmail.com"
    ) {
      admin = true;
    }
    return (
      <React.Fragment>
        {!this.state.sidebarDocked && (
          <button
            className="open-sidebar"
            onClick={() => this.onSetSidebarOpen(!this.state.sidebarOpen)}
          >
            <i className="fa fa-bars" />
          </button>
        )}
        <Sidebar
          sidebar={
            <nav
              className="sidebar"
              style={{
                display: `${
                  !this.state.sidebarOpen && !this.state.sidebarDocked
                    ? "none"
                    : "inherit"
                }`
              }}
            >
              <button
                className="action-button-skin sidebar-button"
                onClick={() => {
                  this.onSetSidebarOpen(false);
                  this.props.changeCategory("allMedia");
                }}
              >
                Catalog
              </button>
              {!admin && (
                <React.Fragment>
                  <button
                    className="action-button-skin sidebar-button"
                    onClick={() => {
                      this.onSetSidebarOpen(false);
                      this.props.changeCategory("myCheckedOutMedia");
                    }}
                  >
                    Checked Out
                  </button>
                  <button
                    className="action-button-skin sidebar-button"
                    onClick={() => {
                      this.onSetSidebarOpen(false);
                      this.props.changeCategory("myCheckoutHistory");
                    }}
                  >
                    Checkout History
                  </button>
                  <button
                    className="action-button-skin sidebar-button"
                    onClick={() => {
                      this.onSetSidebarOpen(false);
                      this.props.changeCategory("myMediaOnHold");
                    }}
                  >
                    On Hold
                  </button>
                  <button
                    className="action-button-skin sidebar-button"
                    onClick={() => {
                      this.onSetSidebarOpen(false);
                      this.props.changeCategory("myOverdueMedia");
                    }}
                  >
                    Overdue
                  </button>
                </React.Fragment>
              )}
              {admin && (
                <React.Fragment>
                  <button
                    className="action-button-skin sidebar-button"
                    onClick={() => {
                      this.onSetSidebarOpen(false);
                      this.props.changeCategory("allUsers");
                    }}
                  >
                    User Directory
                  </button>
                  <button
                    className="action-button-skin sidebar-button"
                    onClick={() => {
                      this.onSetSidebarOpen(false);
                      this.props.changeCategory("allRequests");
                    }}
                  >
                    Requests
                  </button>
                  <button
                    className="action-button-skin sidebar-button"
                    onClick={() => {
                      this.onSetSidebarOpen(false);
                      this.props.changeCategory("allCheckedOutMedia");
                    }}
                  >
                    Checked Out
                  </button>
                  <button
                    className="action-button-skin sidebar-button"
                    onClick={() => {
                      this.onSetSidebarOpen(false);
                      this.props.changeCategory("allOverdueMedia");
                    }}
                  >
                    Overdue
                  </button>
                </React.Fragment>
              )}
              <button
                className="action-button-skin sidebar-button"
                onClick={() => {
                  this.onSetSidebarOpen(false);
                  this.props.changeCategory("About");
                }}
              >
                About
              </button>
              <button
                className="action-button-skin sidebar-button"
                onClick={() => {
                  this.onSetSidebarOpen(false);
                  this.props.changeCategory("Account");
                }}
              >
                Account
              </button>
              <button
                className="action-button-skin sidebar-button"
                onClick={() => {
                  this.onSetSidebarOpen(false);
                  this.props.logOut();
                }}
              >
                Logout
              </button>
            </nav>
          }
          children=""
          open={this.state.sidebarOpen}
          docked={this.state.sidebarDocked}
          onSetOpen={this.onSetSidebarOpen}
          styles={{
            sidebar: {
              position: "fixed",
              top: 90,
              background: "#030A43",
              width: 250
            },
            root: { position: "relative", boxShadow: 0 }
          }}
        />
      </React.Fragment>
    );
  }
}
