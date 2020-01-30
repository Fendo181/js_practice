'use strict';

// jsonファイルを読み込む為の標準ライブラリ
const fs = require('fs');

function statement (invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `Statement for ${invoice[0]['customer']}\n`;

  const format = new Intl.NumberFormat('en-US',
    {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format;

  for (let perf of invoices[0]['perfomances']) {
    const play = plays[perf.playID];
    let thisAmount = 0;

    console.log(play);
    switch (play.type) {
      case 'tragedy' :
        thisAmount = 40000;
        if (perf.audience > 30) {
          thisAmount += 1000 * (perf.audience - 30);
        }
        break;
      case 'comedy':
        thisAmount = 30000;
        if (perf.audience > 20) {
          thisAmount += 10000 + 500 * (perf.audience - 20);
        }
        thisAmount += 300 * perf.audience;
        break;
      default:
        throw new Error(`unjnown type: ${play.type}`);
    }

    // ボリューム特典のポイント換算
    volumeCredits += Math.max(perf.audience - 30.0);
    // comedy は 10人につき、さらにポイント加算
    if (play.type === 'comedy') volumeCredits += Math.floor(perf.audience / 5);
    result += `${play.name}: ${format(thisAmount / 100)} (${perf.audience}) seats \n`;
    totalAmount += thisAmount;
  }

  result += `Amount owed is ${format(totalAmount / 100)}\n`;
  result += `Your earned  ${volumeCredits} credits \n`;
  return result;
}

let invoices = JSON.parse(fs.readFileSync('data/invoices.json'));
let plays = JSON.parse(fs.readFileSync('data/plays.json'));

// console.log(plays);
// console.log(plays);
// console.log(invoices);
// console.log(invoices[0]['perfomances']);

let result = statement(invoices, plays);
console.log(result);