import m from 'mithril';

export const School = ({ state, actions, routing }) => [
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    height: '100%'
  }}>
    <div style={{
      width: '300px',
      backgroundColor: 'white',
      height: '100%'
    }}>
      {SchoolList({state: state.school, actions})}
    </div>
    <div style={{
      marginLeft: '20px',
      flex: 1,
    }}>
      {SchoolDetail({state: state.school, actions})}
    </div>    
  </div>
];

School.showNavbar = true;

const SchoolList = ({ state, actions }) => {
  const filter = state.filter;
  const schools = state.schools.filter(s => s.name.toLowerCase().indexOf(filter) >= 0);

  return [
    <input style={{
      placeHolder: 'Filter by name...', 
      padding: '8px', 
      width: '100%'}} 
      oninput={e => { actions.setSchoolFilter(e.target.value) }} />,
    <ul>
      {
        schools.map(s => <li onclick={e => { actions.selectSchool(s.id) }} class='school-list-item'>{s.name}</li>)
      }
    </ul>
  ]
}

const SchoolDetail = (() => {
  const style = {
    backgroundColor: 'white',
    padding: '20px',
    marginBottom: '20px'
  }
  return ({state, actions}) => [
    <div style={style}>
      SchoolName
    </div>,
  
    <div style={style}>
      Assignor
    </div>,
    
    <div style={style}>
      School Admin
    </div>,
  
    <div style={style}>
      School Representatives
    </div>
  ];
})();
