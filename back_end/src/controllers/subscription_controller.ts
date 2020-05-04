import { Request, Response } from 'express';
import Repository from '../repository';

export default class SubscriptionController {

  private repository: Repository;
  
  constructor(repository: Repository) {
    this.repository = repository;
  }

  subscribeTeamGameDay = async (req: Request, res: Response) => {
    const user = req.user!;
    const repo = this.repository;
    const teamId = req.body.teamId;
    if (!teamId) {
      return res.send({ok: false, reason: 'teamId missing in body'});
    }

    const team = await repo.getTeam(teamId);
    if (!team) {
      return res.send({ok: false, reason: 'team is missing'});
    }
    
    const subscriptions = await repo.getEmailSubscriptionsOfSubscriber(user.id);
    const subscription = subscriptions.find(s => s.subscriptionType === 'team_game_day' && s.teamId === teamId);

    if (subscription) {
      res.send({ ok: true, subscriptionId: subscription.id } as ApiSchema.Subscription_TeamGameDay_SUB_POST_RES);
    } else {
      const subscriptionId = await repo.addEmailSubscription({
        subscriberId: user.id,
        subscriptionType: 'team_game_day',
        teamId,
      });

      res.send({ok: true, subscriptionId} as ApiSchema.Subscription_TeamGameDay_SUB_POST_RES);
    }
  }

  subscribeGameUpdate = async (req: Request, res: Response) => {
    const user = req.user!;
    const repo = this.repository;
    const gameId = req.body.gameId;
    if (!gameId) {
      return res.send({ok: false, reason: 'gameId is missing in body'});
    }

    const game = await repo.getGame(gameId);
    if (!game) {
      return res.send({ok: false, reason: 'game is missing'});
    }

    const subscriptions = await repo.getEmailSubscriptionsOfSubscriber(user.id);
    const subscription = subscriptions.find(s => s.subscriptionType === 'game_update' && s.gameId === gameId);

    if (subscription) {
      res.send({ok: true, subscriptionId: subscription.id} as ApiSchema.Subscription_GameUpdate_SUB_POST_RES);
    } else {
      const subscriptionId = await repo.addEmailSubscription({
        subscriberId: user.id,
        subscriptionType: 'game_update',
        gameId
      });
      
      res.send({ok: true, subscriptionId: subscriptionId} as ApiSchema.Subscription_GameUpdate_SUB_POST_RES);
    }
  }

  unsubscribe = async (req: Request, res: Response) => {
    const user = req.user!;
    const subscriptionId = parseInt(req.params.subscriptionId);

    const subscription = await this.repository.getEmailSubscription(subscriptionId);
    if (!subscription) {
      res.send({ok: false, reason: 'Subscription not found'});
      return;
    }
    if (subscription.subscriberId !== user.id) {
      res.send({ok: false, reason: 'Has no permission over this subscription'});
      return;
    }

    await this.repository.removeEmailSubscription(subscriptionId);
    res.send({ok: true} as ApiSchema.Subscription_Id_UNSUB_POST_RES);
  }

  getTeamGameDaySubscriptions = async (req: Request, res: Response) => {
    const user = req.user!;
    
    let subscriptions = await this.repository.getEmailSubscriptionsOfSubscriber(user.id);
    subscriptions = subscriptions.filter(s => s.subscriptionType === 'team_game_day');
    
    res.send({
      ok: true, 
      subscriptions: subscriptions.map(s => ({subscriptionId: s.id, teamId: s.teamId!}))
    } as ApiSchema.Subscription_TeamGameDay_RES);
  }
  
  getGameUpdateSubscriptions = async (req: Request, res: Response) => {
    const user = req.user!;
    
    let subscriptions = await this.repository.getEmailSubscriptionsOfSubscriber(user.id);
    subscriptions = subscriptions.filter(s => s.subscriptionType === 'game_update');
    
    res.send({
      ok: true, 
      subscriptions: subscriptions.map(s => ({subscriptionId: s.id, gameId: s.gameId!}))
    } as ApiSchema.Subscription_GameUpdate_RES);
  }
}
