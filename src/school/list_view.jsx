import React from 'react';

/* 
  @param school: Array<School>
  @param onSchoolClick: function, call this with school id, whenever clicked,
  @param activeSchoolId: number, if this matches with one of the schools in the schools array, highlight that school
*/
export const ListView = ({ schools, onSchoolClick, activeSchoolId }) => {
  
  // class names are unchanged from game page to keep style
  const getClassName = school => {
    return school.id === activeSchoolId
      ? `game-list-item active`
      : `game-list-item`;
  }

  const schoolItems = schools.map(s =>
    <li style={{
      padding: '10px',
      cursor: 'pointer'
    }}
      className={getClassName(s)}
      key={s.id}
      onClick={() => { onSchoolClick(s.id) }}
    >
      <div className="game-box">

        <div className="contents">
          <p className='font-before'>{s.name}</p>
        </div>

      </div>
      
    </li>
  );

  return <ul>{schoolItems}</ul>
}