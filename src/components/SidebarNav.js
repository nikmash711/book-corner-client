import React from 'react';
import Sidebar from "react-sidebar";
import {Link} from 'react-router-dom';

const mql = window.matchMedia(`(min-width: 900px)`);

export default class SidebarNav extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      sidebarDocked: mql.matches,
      sidebarOpen: false,
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

 render(){
   let admin=false;
   if(this.props.user && this.props.user.info.email==='jewishbookcorner@gmail.com'){
    admin=true;
   }
    return(
      <React.Fragment>
        {!this.state.sidebarDocked && 
        <button 
          className="open-sidebar" 
          onClick={() => this.onSetSidebarOpen(!this.state.sidebarOpen)}>
          <i className="fa fa-bars"></i>
        </button>}
        <Sidebar
          sidebar=
          {
            <nav className="sidebar" style={{display: `${!this.state.sidebarOpen && !this.state.sidebarDocked ? 'none' : 'inherit'}`}}>
              <button 
                onClick={() => {
                  this.onSetSidebarOpen(false)
                  this.props.changeCategory('allMedia')
                  }
                }>
                Catalog
              </button>     
              {!admin && 
              <React.Fragment>
              <button 
              onClick={() => {
                this.onSetSidebarOpen(false)
                this.props.changeCategory('myCheckedOutMedia')
                }
              }>
              Currently Checked Out
            </button>
            <button 
              onClick={() => {
                this.onSetSidebarOpen(false)
                this.props.changeCategory('myMediaOnHold')
                }
              }>
              On Hold
            </button>
            <button 
              onClick={() => {
                this.onSetSidebarOpen(false)
                this.props.changeCategory('myOverdueMedia')
                }
              }>
              Overdue
            </button>
              </React.Fragment>
              }       
              {admin && 
              <React.Fragment>
                <button 
                  onClick={() => {
                    this.onSetSidebarOpen(false)
                    this.props.changeCategory('allRequests')
                    }
                  }>
                  Requests
                </button>
                <button 
                  onClick={() => {
                    this.onSetSidebarOpen(false)
                    this.props.changeCategory('allCheckedOutMedia')
                    }
                  }>
                  Checked Out
                </button>
              </React.Fragment>
            }
              <button 
                onClick={() => {
                  this.onSetSidebarOpen(false)
                  this.props.logOut()
                  }
                }>
                Logout
              </button>
            </nav>
          }
          children=""
          open={this.state.sidebarOpen}
          docked={this.state.sidebarDocked}
          onSetOpen={this.onSetSidebarOpen}
          styles={{ sidebar: { position: 'fixed', top: 55, background: 'rgb(237, 236, 217)', width: 200, }, root: {position: 'relative', boxShadow: 0}, }}
        >
        </Sidebar>
        </React.Fragment>
    );
  }
}