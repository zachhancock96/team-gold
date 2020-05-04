import Jasmine from 'jasmine';
import path from 'path';
import fs from 'fs';
import { init } from './test-helper';

const testFiles = (() => {
  const here = fname => path.join(__dirname, fname);
  let testFnames = fs.readdirSync(__dirname).filter(fname => /\.test.js/.test(fname));
  const i = testFnames.indexOf('test_setup_works.test.js');

  //running test_setup_works.test first
  testFnames = [...testFnames.splice(i, 1), ...testFnames];

  return testFnames.map(fname => here(fname));
})();

init()
  .then(() => {
    const j = new Jasmine(null);
    j.addSpecFiles(testFiles);
    j.stopSpecOnExpectationFailure(false);
    j.randomizeTests(false);
    j.configureDefaultReporter({ showColors: false });
    j.execute();
  });
