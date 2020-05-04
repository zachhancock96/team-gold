import m from 'mithril';

const EditView = ({state, actions}) => (
  <div>
    <input
      oninput={e => actions.editSchoolForm(state, "name", e.target.value)}
      value={state.editSchoolForm.name} />
    <button onclick={e => actions.confirmEdit(state)}>Confirm</button>
    <button onclick={e => actions.cancelEdit(state)}>Cancel</button>
  </div>
)

const ReadView = ({state, actions}) => (
  <div>
    <p>{state.selectedSchool.name}</p>
    <button onclick={e => actions.startEditing(state, state.selectedSchool.id)}>Start Editing</button>
  </div>
);

export const View = ({state, actions}) => (
  <div style={{display: 'flex'}}>
    <ul style={{width: '200px'}}>
      {
        state.schools.map(s => (
          <li 
            style={{cursor: 'pointer', padding: '8px'}} 
            onclick={() => actions.selectSchool(state, s.id)}>{s.name}</li>
        ))
      }
    </ul>
    <div style={{width: '400px', marginLeft: '50px'}}>
      {
        state.selectedSchool
        ? (
          [
            <h1>School:</h1>,
            state.isEditing? EditView({state, actions}): ReadView({state, actions})
          ]
        )
        : (
          <p>No school selected. Please select</p>
        )
      }
    </div>
  </div>
);