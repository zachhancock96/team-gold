import cp from 'child_process';

export const execSql = (args: {
  host: string;
  user: string;
  database: string;
  password?: string;
  sqlSourceFilePath: string;
}): { (): { ok: boolean; result: string; } } => {
  
  const command = (() => {
    let s = `mysql -h ${args.host} -u ${args.user} --table`;
    s = args.password? `${s} -p ${args.password}`: s;
    s = args.database? `${s} ${args.database}`: s;
  
    return `${s} < ${args.sqlSourceFilePath}`;
  })();

  return () => {
    try {
      const result = cp.execSync(`${command}`, { stdio: 'pipe', encoding: 'ascii', maxBuffer: 1024 * 1024 * 10 });
      return { ok: true, result };
    } catch(error) {
      return { ok: false, result: error.stderr as string };
    }
  };
}