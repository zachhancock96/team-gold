import {Request, Response} from 'express';
import path from 'path';
import fs from 'fs';
import Repository from '../repository';
import moment from '../moment';
import { CSV_EXPORT_SAVE_DIR } from '../csv_export';
import Game from '../game';
import Team from '../team';
import { TeamKind, Roles, GameStatus } from '../enums';


export default class CsvExportController {
  private repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  getExports = async (req: Request, res: Response) => {
    let csvExports = await this.repository.getCsvExports();
    csvExports = csvExports.filter(c => c.creatorId === req.user!.id);
    res.send({ok: true, exports: csvExports.map(ae => ae.toApi())} as ApiSchema.CsvExport_GET_RES);
  }

  getExport = async (req: Request, res: Response) => {
    const exportId = parseInt(req.params.id);
    const csvExport = await this.repository.getCsvExport(exportId);
    res.send({ok: true, export: csvExport? csvExport.toApi(): null} as ApiSchema.CsvExport_Id_GET_RES);
  }

  createExport = async (req: Request, res: Response) => {
    const user = req.user!;
    const body = req.body as ApiSchema.CsvExport_POST_REQ;

    let games = await this.repository.getGames();
    games = games.filter(g => g.status !== GameStatus.REJECTED);

    if (body.gameIds) {
      if (!Array.isArray(body.gameIds) || !body.gameIds.length) {
        res.send({ ok: false, reason: 'At least one game is to be exported.' });
        return;
      }
      if (new Set(body.gameIds).size !== body.gameIds.length) {
        res.send({ ok: false, reason: 'Bad request.' });
        return;
      }
      const games_ = body.gameIds.map(gid => games.find(g => g.id === gid));
      if (games_.filter(g => !g).length > 0) {
        res.send({ ok: false, reason: 'Could not find one or more games with given ids.' });
        return;
      }
      games = games_ as Game[];
    }

    const note = body.note || null;
    if (note && typeof note !== 'string') {
      res.send({ ok: false, reason: 'note body parameter should be string or null.' });
      return;
    }

    const filename = randFilename();
    console.log(`creating file ${filename}`);
    await (async () => {
      const where = path.join(CSV_EXPORT_SAVE_DIR, filename);
      return exports.createCsvExportFile(games, where);
    })();
    console.log(`file created ${filename}`);

    console.log('inserting db');
    const exportId = await this.repository.addCsvExport({
      timestamp: moment(),
      filename,
      gameCount: games.length,
      note: note,
      creatorId: user.id
    });
    console.log('inserted db');

    if ((user.role === Roles.ASSIGNOR || user.role === Roles.ADMIN)
        && !!body.shouldApprovePendingGames) {
      const pendingGames = games.filter(g => g.isPending());

      if (pendingGames.length > 0) {
        console.log(`approving games with ids: ${pendingGames.map(g => g.id)}`);
        
        const approveGame = (() => {
          const updaterType = user.role === Roles.ASSIGNOR
              ? 'assignor'
              : 'admin';
          const updateType = 'accept';
          const timestamp = moment();

          return async (game: Game) => {
            try {
              await this.repository.editGame({
                id: game.id,
                start: game.start,
                location: game.location,
                status: GameStatus.ACCEPTED
              });

              await this.repository.addGameHistory({
                gameId: game.id,
                start: game.start,
                location: game.location,
                status: GameStatus.ACCEPTED,
                timestamp,
                updateType,
                updaterType,
                updaterId: user.id
              });
            }
            catch (error) {
              console.log(`Error approving game ${game.id}`);
              console.log(error);
            }
          };
        })();
        
        await Promise.all([pendingGames.map(g => approveGame(g))]);
      }
    }

    res.send({ok: true, exportId} as ApiSchema.CsvExport_POST_RES);
  }

  removeExport = async (req: Request, res: Response) => {
    const exportId = parseInt(req.params.id);
    const csvExport = await this.repository.getCsvExport(exportId);

    if (!csvExport) {
      res.send({ ok: false, reason: 'Export not found.' });
      return;
    }
    if (csvExport.creatorId !==  req.user!.id) {
      res.send({ ok: false, reason: 'Do not have permission to remove this export.'});
      return;
    }

    await this.repository.removeCsvExport(exportId);

    await (async () => {
        const where = path.join(CSV_EXPORT_SAVE_DIR, csvExport.filename);
        return removeCsvExportFileIfExists(where);
    })();

    res.send({ ok: true });
  }

  editExportNote = async (req: Request, res: Response) => {
    const exportId = parseInt(req.params.id);
    const note = (req.body as ApiSchema.CsvExport_Id_Note_POST_REQ).note || null;

    const csvExport = await this.repository.getCsvExport(exportId);
    if (!csvExport) {
      return res.send({ok: false, reason: 'Resource not found'});
    }
    if (csvExport.creatorId !==  req.user!.id) {
      res.send({ ok: false, reason: 'Do not have permission to edit this export.'});
      return;
    }

    await this.repository.editCsvExport({
      id: exportId,
      note
    });

    res.send({ok: true});
  }
}

//1586985448_333.csv
const randFilename = () => {
  return parseInt(Date.now() / 1000 + '')   //time in seconds
  + '_' 
  + Math.round((Math.random() * 899) + 100) //random digit between 100 and 999
  + '.csv';
}

//exported for testing
export const createCsvExportFile = (() => {
  const toDate = m => moment(m).format('YYYY/MM/DD');
  const toTime = m => moment(m).format('hh:mm A');
  const levelMap: { [k: string]: string} = {
    [TeamKind.VB]: 'Varsity',
    [TeamKind.VG]: 'Varsity',
    [TeamKind.JVB]: 'JV',
    [TeamKind.JVG]: 'JV'
  };
  const teamKindMap: { [k: string]: string } = {
    [TeamKind.VB]: 'VB',
    [TeamKind.VG]: 'VG',
    [TeamKind.JVB]: 'JVB',
    [TeamKind.JVG]: 'JVG'
  };

  const teamName = (team: Team) => `${team.school.name} - ${teamKindMap[team.teamKind]}`;
  
  return async (games: Game[], path: string) => {
    const title = `Date,Time,Level,Home-Team,Home-Level,Away-Team,Away-Level`;

    const rows = games.map(g => {
      const date = toDate(g.start);
      const time = toTime(g.start);
      const level = levelMap[g.homeTeam.teamKind];
      const homeTeam = teamName(g.homeTeam);
      const homeLevel = level;
      const awayTeam = teamName(g.awayTeam);
      const awayLevel = level;
      return `${date},${time},${level},${homeTeam},${homeLevel},${awayTeam},${awayLevel}`;
    });
    
    const data = [title, ...rows].join('\n');

    fs.writeFileSync(path, data, { encoding: 'utf8' });    
  }
})();

const removeCsvExportFileIfExists = (path: string) => {
  try {
    fs.unlinkSync(path);
  }
  catch (error) {
    console.log(`error removing file ${path}`);
    console.log(error);
  }
};