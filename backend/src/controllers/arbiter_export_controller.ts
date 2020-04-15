import {Request, Response} from 'express';
import path from 'path';
import fs from 'fs';
import Repository from '../repository';
import moment, { DATE_FROM_API_FORMAT } from '../moment';
import { ARBITER_EXPORT_SAVE_DIR } from '../arbiter_export';
import Game from '../game';
import Team from '../team';
import { TeamKind } from '../enums';


export default class ArbiterExportController {
  private repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  getExports = async (req: Request, res: Response) => {
    const arbiterExports = await this.repository.getArbiterExports();
    res.send({ok: true, exports: arbiterExports.map(ae => ae.toApi())} as ApiSchema.ArbiterExport_GET_RES);
  }

  getExport = async (req: Request, res: Response) => {
    const exportId = parseInt(req.params.id);
    const arbiterExport = await this.repository.getArbiterExport(exportId);
    res.send({ok: true, export: arbiterExport? arbiterExport.toApi(): null} as ApiSchema.ArbiterExport_Id_GET_RES);
  }

  createExport = async (req: Request, res: Response) => {
    const body = req.body as ApiSchema.ArbiterExport_POST_REQ;

    const hasSchoolIdsFilter = !!body.hasSchoolIdsFilter;
    const hasStartEndFilter = !!body.hasStartEndFilter;

    if (hasSchoolIdsFilter) {
      if (!body.schoolIdsFilter || !body.schoolIdsFilter.length) {
        return res.send({ok: false, reason: 'Expected schoolIdsFilter in body'});
      }

      if (new Set(body.schoolIdsFilter).size !== body.schoolIdsFilter.length) {
        return res.send({ok: false, reason: 'Contains duplicate Ids'});
      }

      const schools = await this.repository.getSchools();
      const allIdValid = body.schoolIdsFilter.reduce((ok, id) => 
        ok ? !!schools.find(s => s.id === id) : false, true);

      if (!allIdValid) {
        return res.send({ok: false, reason: 'Contains bad id value'});
      }
    }

    if (hasStartEndFilter) {
      const isValidStartFilter = moment(body.startFilter || '', DATE_FROM_API_FORMAT, true).isValid();
      const isValidEndFilter = moment(body.endFilter || '', DATE_FROM_API_FORMAT, true).isValid();

      if (!isValidStartFilter || !isValidEndFilter) {
        return res.send({ok: false, reason: 'Expected startFilter and endFilter with proper format in body'});
      }
    }

    let games = await this.repository.getGames();
    if (hasSchoolIdsFilter) {
      games = games.filter(g => body.schoolIdsFilter!.indexOf(g.homeTeam.school.id) >= 0
        || body.schoolIdsFilter!.indexOf(g.awayTeam.school.id) >= 0);
    }
    if (hasStartEndFilter) {
      const startFilter = moment(body.startFilter!);
      const endFilter = moment(body.endFilter!);
      games = games.filter(g => 
        startFilter.isSameOrBefore(g.start, 'day') && endFilter.isSameOrAfter(g.start, 'day'));
    }

    const filename = randFilename();

    console.log(`creating file ${filename}`);
    await (async () => {
      const where = path.join(ARBITER_EXPORT_SAVE_DIR, filename);
      return createArbiterExportFile(games, where);
    })();
    console.log(`file created ${filename}`);
    
    console.log('inserting db');
    const exportId = await this.repository.addArbiterExport({
      timestamp: moment(),
      filename,
      gameCount: games.length,
      hasSchoolIdsFilter,
      hasStartEndFilter,
      schoolIdsFilter: body.schoolIdsFilter,
      startFilter: hasStartEndFilter? moment(body.startFilter!): null,
      endFilter: hasStartEndFilter? moment(body.endFilter!): null,
      note: body.note,
      creatorId: req.user!.id
    });
    console.log('inserted db');

    res.send({ok: true, exportId} as ApiSchema.ArbiterExport_POST_RES);
  }

  editExportNote = async (req: Request, res: Response) => {
    const exportId = parseInt(req.params.id);
    const note = (req.body as ApiSchema.ArbiterExport_Id_Note_POST_REQ).note || null;

    const arbiterExport = await this.repository.getArbiterExport(exportId);
    if (!arbiterExport) {
      return res.send({ok: false, reason: 'Resource not found'});
    }

    await this.repository.editArbiterExport({
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
export const createArbiterExportFile = (() => {
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

