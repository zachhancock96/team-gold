import React from 'react';
// import { Nav } from './nav_controller';
import { SchoolDetail } from './school_detail';
import { ListView } from './list_view';
import { Route } from '../routes/routes2';
import { api } from 'shared';

const getSchoolDetailId = routing => {
  if (isDetailPage(routing)) {
    return routing.next().childSegment.params.id;
  }
  return null;
}

const isDetailPage = routing => {
  return routing.next() && routing.next().childSegment && routing.next().childSegment.id === 'SchoolDetail';
}

export class School extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      schools: []
    }
  }

  componentDidMount() {
    this.refreshSchools();
  }

  refreshSchools = () => {
    const m = this.props;
    m.actions.showLoading('Schools');
    api.getSchools()
      .then(schools => {
        this.setState({schools});
      })
      .finally(() => {
        m.actions.hideLoading('Schools');
      })
  }

  // list item click from list view page
  handleSchoolClick = id => {
    const { actions, routing } = this.props;
    const r = routing.next().childRoute(Route.SchoolDetail({id}));
    actions.navigateTo(r);
  }

  getSchoolDetail = id => {
    return this.state.schools[id - 1]; 
  }

  //  
  //  --Can be repurposed to filter through schools?---
  //
  // const filterGamesByRoutingState = (games, routing) => {
  //   const s = routing.childSegment.id;
  
  //   const filterFn = s === 'AllGames'
  //     ? g => g
  //     : s === 'ApprovedGames'
  //       ? g => g.status === 'accepted'
  //       : s === 'PendingGames'
  //         ? g => ['pending_home', 'pending_assignor', 'pending_away'].indexOf(g.status) >= 0
  //         : g => g.status === 'rejected';
  
  //   return games.filter(filterFn);
  // }

  render() {
    const m = this.props;
    const schools = this.state.schools;

    const isDetail = isDetailPage(m.routing);

    const activeSchoolId = getSchoolDetailId(m.routing);
    const activeSchoolDetail = schools[activeSchoolId - 1];

    const list = <ListView
      schools={schools}
      activeSchoolId={activeSchoolId}
      onSchoolClick={this.handleSchoolClick} />;

    const detail = isDetail
      ? (
        <SchoolDetail
          actions={m.actions}
          schoolDetail={activeSchoolDetail}/>
      ): null;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {
          m.state.device === 'mobile' ?
            (
              <MobileLayout>
                Testing
              </MobileLayout>
            ) :
            (
              <DesktopLayout>
                {list}
                {detail}
              </DesktopLayout>
            )
        }
      </div>
    );
  }
}

const MobileLayout = ({ children }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      overflowY: 'scroll',
      overflowX: 'hidden',
      flex: 1
    }}>
      {children}
    </div>
  );
}

/*
  assumpiton: 2 or less child elements are passed
  firs child is attached to left,
  second to right
*/
const DesktopLayout = ({ children }) => {
  const left = children[0] || null;
  const right = children[1] || null;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'row'
    }}>
      <div style={{
        width: '400px',
        backgroundColor: 'white',
        overflowY: 'scroll',
        overflowX: 'hidden'
      }}>
        {left}
      </div>
      <div style={{
        marginLeft: '20px',
        flex: 1,
        backgroundColor: 'white',
        overflowY: 'scroll'
      }}>
        {right}
      </div>
    </div>
  );

}

School.showNavbar = true;
