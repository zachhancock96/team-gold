import { ServerPlugin, Server } from '../server';
import User from '../user';
import School from '../school';

function use(server: Server) {
  const repo = server.repository;
  const nonLhsaaSchool$ = server.schoolController.nonLhsaaSchool$

  nonLhsaaSchool$.subscribe(async schoolId => {
    const school = await repo.getSchool(schoolId);
    const assignor = await repo.getAssignor();

    const msg = compose(assignor, school!);

    server.dispatch({
      to: assignor.email,
      subject: 'New School Added',
      html: msg
    });
  })
}

const compose = (assignor: User, school: School) => {
  return `
    <p>Hello ${assignor.firstName},</p>
    <p>
      A new school, ${school.name} has been added in the system. School admins
      and School coaches may not be added to this school however. Thus, if any team
      books a game against ${school.name}, it would just need your approval.
    </p>
  `;
}

const e: ServerPlugin = { use };
export default e;