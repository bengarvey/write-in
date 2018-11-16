'use strict';

const fs = require('fs');
const FILENAME = process.argv[2];

loadData(processData, FILENAME);

function loadData(callback, filename) {
  fs.readFile(filename, 'utf-8', function(err, data) {
    // Break it into an array
    callback(stringToArray(data));
  });
}

function stringToArray(data) {
  return data.split("\n");
}

function processData(data) {
  var records = [];
  var meta = {};
  var newMeta = true;
  data.forEach( (row, index) => {
    var rec = row.split(" ");
    if (isRecord(rec)) {
      records.push(convertRecord(rec, meta, index));
    }
    else {
      if (newMeta) {
        meta = {};
        newMeta = false;
      }
      meta = updateMeta(rec, meta);
    }
  });
  console.log(JSON.stringify(records, null, 2));
}

function isRecord(arr) {
  var length = arr.length;
  return length > 2 && isMachine(arr[length-2]) && isVoterTag(arr[length-1]);
}

function isMachine(str) {
  return str.match(/\d\d\d\d\d/) !== null;
}

function isVoterTag(str) {
  return str.match(/[A-Z][A-Z][A-Z][A-Z][A-Z]/) !== null;
}

function convertRecord(rec, meta, index) {
  var obRecord = {
    voterTag: rec[rec.length-1],
    machine: rec[rec.length-2],
    vote: getVote(rec),
    id: index
  };

  Object.keys(meta).forEach( function(key) {
    obRecord[key] = meta[key];
  });

  return obRecord;

}

function getVote(rec) {
  var vote = "";
  for(var i=0; i<rec.length-2; i++) {
    vote += `${rec[i]} `;
  }
  return vote.slice(0, -1);
}

function updateMeta(rec, meta) {
  var type = identifyMeta(rec);

  if (type) {
    meta[type] = rec.join(" ");
  }
  return meta;
}

function identifyMeta(meta) {
  const match = meta[0];
  const lookup = {
    Machine:            'columns',
    November:           'date',
    Vote:               'instructions',
    Federal:            'scope',
    'Write-in':         'columns2',
    Camden:             'county',
    Political:          'subdivision',
    Personal:           'columns3',
    'CAM_20181106_E':   'code'
  }

  return typeof(lookup[match]) !== 'undefined' ? lookup[match] : 'office';

}
