import { createRouteSegments } from 'meiosis-routing/state';

export const Route = createRouteSegments([
  "Login",
  "School",
  "Calendar",

  "MySchool",
  "AllSchools",
  "SchoolDetail"
]);

export const routeConfig = {
  Login: "/login",
  School: "/school/:id",
  Schools: [
    "/school",
    {
      MySchool: "/my School",
      AllSchools: "All Schools"
    }
  ],
  Calendar: "/calendar",
};

export const redirect = route => {
  return { redirect: Array.isArray(route)? route: [route] };
}