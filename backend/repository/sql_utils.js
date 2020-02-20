const { moment } = require('../moment');
const assert = require('assert');

/*
  @param array: Array<> 
  @return format that sql likes when inserting it

  e.g. [1, 2, 3, 'hello', null, undefined, moment()] to (1,2,3,'hello',null,null,'2019-10-21T02:07:56.752Z')
*/
function sqlValues(array) {
  assert.ok(Array.isArray(array));

  array = array
    .map(r => r instanceof Date || r instanceof moment
        ? moment(r).toISOString()
        : r)
    .map(r => typeof r === 'string'? `'${r}'`: r)
    .map(r => (r === null || r === undefined)? 'null': r);
    
  return '(' + array.join(',') + ')';
}
  
function sqlValue(v) {
  if (v instanceof moment || v instanceof Date) {      
    v = moment(v).toISOString();
  }
  if (typeof v === 'string') return `'${v}'`;
  if (v === null || v === undefined) return 'null';
  return v;
}

/*
  @param s: string
  @return escaped string for regex checks

  e.g. hello.world => hello\.world
       hello%world =>  hello\%world
       hello\world => hello\\world

  Note that if the string is already escaped then use this
  this will escape the escaped string, creating additional characters
  in the string

  e.g. hello\.world => hello\\\.world (escapes first the backspace then the dot)
*/
function regexEscapedString(s) {
  assert.ok(typeof s === 'string');

  const reg = /[\\%\$\.\+']/g;

  return s.replace(reg, char => `\\${char}`);  
}

module.exports = {
  sqlValues,
  sqlValue,
  regexEscapedString
};