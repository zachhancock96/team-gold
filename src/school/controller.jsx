import React from 'react';
// import { Nav } from './nav_controller';
import { SchoolDetail } from './school_detail';
import { ListView } from './list_view';
import { Route } from '../routes';
import { api } from 'shared';

const getSchoolDetailId = routing => {
  if (isDetailPage(routing)) {
    return parseInt(routing.childSegment.params.id);
  }
  return null;
}

const isDetailPage = routing => {
  //return routing.next() && routing.next().childSegment && routing.next().childSegment.id === 'SchoolDetail';
  return routing.childSegment.id === 'SchoolDetail';
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
    const r = routing.childRoute(Route.SchoolDetail({id}));
    actions.navigateTo(r);
    this.refreshSchools();
  }

  getSchoolDetail = id => {
    return this.state.schools[id - 1]; 
  }

  render() {
    const m = this.props;
    const schools = this.state.schools;

    console.log(m.routing.localSegment);
    console.log(m.routing.childSegment);

    const isDetail = isDetailPage(m.routing);

    const activeSchoolId = getSchoolDetailId(m.routing);
    

    const list = <ListView
      schools={schools}
      activeSchoolId={activeSchoolId}
      onSchoolClick={this.handleSchoolClick} />;

    const detail = isDetail
      ? (
        <SchoolDetail
          actions={m.actions}
          schoolDetailId={activeSchoolId} />
      ): null;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        marginTop: '20px',
        height: '100%',
      }}>
        {
          m.state.device === 'mobile' ?
            (
              <MobileLayout>
                {detail? detail: list}
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
      flex: 1,
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
        overflowY: 'auto',
        overflowX: 'hidden',
        height: '700px',
        marginTop: '15px',
        borderRadius: '8px',
        boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.19), 0 8px 17px 0 rgba(0, 0, 0, 0.2)'

      }}>
        {left}
      </div>
      <div style={{
        marginLeft: '20px',
        flex: 1,
        backgroundColor: 'white',
        overflowY: 'auto',
        height: '700px',
        marginTop: '15px',
        borderRadius: '8px',
        boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.19), 0 8px 17px 0 rgba(0, 0, 0, 0.2)'

      }}>
        {right}
      </div>
    </div>
  );

}

School.showNavbar = true;
