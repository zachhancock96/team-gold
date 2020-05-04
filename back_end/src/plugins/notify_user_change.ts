import { ServerPlugin, Server } from '../server';
import User from '../user';
import School from '../school';

function use(server: Server) {
  const repo = server.repository;
  const accept$ = server.schoolController.acceptUser$;
  const reject$ = server.schoolController.rejectUser$;
  const remove$ = server.schoolController.removeUser$;

  const subscriberFactory = (subject: string, composer: (user: User, school: School) => string) => async userId => {
    const user = (await repo.getUser(userId))!;
    const school = (await repo.getSchool(user.schoolId!))!;

    server.dispatch({
      to: user.email,
      subject,
      html: composer(user, school),
    })
  }

  accept$.subscribe(subscriberFactory('Green card to team-gold soccer scheduling system', composeAccept));

  reject$.subscribe(subscriberFactory('Disapproved during Onboarding', composeReject));

  remove$.subscribe(subscriberFactory('Farewell from team-gold soccer scheduling family', composeRemove));
}

const composeAccept = (user: User, school: School) => {
  return `
    <p>Hello ${user.firstName},</p>
    <p>You have been granted access as <b>${user.prettyRole}</b>!.
      You may now login and manage games for the <b>${school.name}</b></p>
    <p>Thanks</p>
  `;
}

const composeReject = (user: User, school: School) => {
  return `
    <p>Hello ${user.firstName},</p>
    <p>Unfortunately your request to join in as <b>${user.prettyRole}</b> for <b>${school.name}</b> has been disapproved.</p>
    <p>We are sorry</p>
  `;
}

const composeRemove = (user: User, school: School) => {
  return `
    <p>Hello ${user.firstName},</p>
    <p>Unfortunately your account has been removed from the system.
      You are no longer serving <b>${school.name}</b> as <b>${user.prettyRole}</b> in the system.<p>
    <p>We are sorry</p>
  `;
}

const e: ServerPlugin = { use };

export default e;