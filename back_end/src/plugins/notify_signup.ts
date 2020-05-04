import { ServerPlugin, Server } from '../server';
import User from '../user';
import School from '../school';

function use(server: Server) {
  const repo = server.repository;
  const signup$ = server.gatewayController.signup$;

  signup$.subscribe(async userId => {
    const user = (await repo.getUser(userId))!;
    const school = (await repo.getSchool(user.schoolId!))!;
    const schoolAdmin = school.schoolAdmin;
    const assignor = await repo.getAssignor();
    const admin = await repo.getAdmin();
  
    const userMsg = composeUserMsg(user, school);
    const assignorMsg = composeAuthorityMsg(user, school, assignor);
    const adminMsg = composeAuthorityMsg(user, school, admin);
    
    server.dispatch({
      to: user.email,
      subject: 'Onboarding to team-gold soccer scheduling system',
      html: userMsg
    });

    server.dispatch({
      to: assignor.email,
      subject: 'User signed up',
      html: assignorMsg
    });

    server.dispatch({
      to: admin.email,
      subject: 'User signed up',
      html: adminMsg
    });

    if (schoolAdmin) {
      server.dispatch({
        to: admin.email,
        subject: 'User signed up',
        html: composeAuthorityMsg(user, school, schoolAdmin)
      });
    }
  });
}

const composeUserMsg = (user: User, school: School) => {
  return `
    <p>Hey ${user.firstName},</p>
    <p>Your request to join as a ${user.prettyRole} for ${school.name} has been recieved, and it is currently under review.
      You will hear from us again.
    </p>
    <p>Thanks.</p>
  `;
}

const composeAuthorityMsg = (user: User, school: School, authority: User) => {
  return `
    <p>Hello ${authority.firstName},</p>
    <p>${user.name} (${user.email}) wants to join as a ${user.prettyRole} for ${school.name}</p>
  `;
}


const e: ServerPlugin = { use };

export default e;