import createRouteMatcher from "feather-route-matcher"
import { createFeatherRouter } from "meiosis-routing/router-helper"
import { routeConfig, Route } from '../routes';

export const router = createFeatherRouter({
  createRouteMatcher,
  routeConfig,
  defaultRoute: [Route.School()]
});