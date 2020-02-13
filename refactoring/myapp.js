'use strict';
// jsonファイルを読み込む為の標準ライブラリ
const fs = require('fs');

function statement (invoice, plays) {
  const statementDate = {};
  // 顧客情報
  statementDate.customer = invoice.customer;
  // 公演情報
  statementDate.perfomances = invoice.perfomances.map(enrichPerfomance);

  return renderPlainText(statementDate, plays);

  // 演劇のタイトル
  function enrichPerfomance (aPerfomance) {
    const result = Object.assign({}, aPerfomance);
    result.play = playFor(result);
    return result;
  }

  function playFor (aPerfomance) {
    return plays[aPerfomance.playID];
  }
}

// 請求書を出力する
function renderPlainText (data, plays) {
  let result = `Statement for ${data.customer}\n`;
  for (let perf of data.perfomances) {
    // 注文の内訳を出力
    result += `${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}) seats \n`;
  }
  result += `Amount owed is ${usd(totalAmount(data))}\n`;
  result += `Your earned  ${totalVolumeCredits(data)} credits \n`;
  return result;

  // 演劇のタイプによって請求金額を分けている
  function amountFor (aPerfomance) {
    let result = 0;
    switch (playFor(aPerfomance).type) {
      case 'tragedy' :
        result = 40000;
        if (aPerfomance.audience > 30) {
          result += 1000 * (aPerfomance.audience - 30);
        }
        break;
      case 'comedy':
        result = 30000;
        if (aPerfomance.audience > 20) {
          result += 10000 + 500 * (aPerfomance.audience - 20);
        }
        result += 300 * aPerfomance.audience;
        break;
      default:
        throw new Error(`unknown type: ${playFor(aPerfomance).type}`);
    }
    return result;
  }

  function playFor (aPerfomance) {
    return plays[aPerfomance.playID];
  }

  // ポイント計算
  function volumeCreditsFor (aPerfomance) {
    let result = 0;
    // ボリューム特典のポイント換算
    result += Math.max(aPerfomance.audience - 30.0);
    // comedy は 10人につき、さらにポイント加算
    if (playFor(aPerfomance).type === 'comedy') result += Math.floor(aPerfomance.audience / 5);
    return result;
  }

  function totalVolumeCredits (data) {
    let volumeCredits = 0;
    for (let perf of data.perfomances) {
    // ボリューム特典のポイント計算
      volumeCredits += volumeCreditsFor(perf);
    }
    return volumeCredits;
  }

  // formatをUSDにする
  function usd (aNumber) {
    return new Intl.NumberFormat('en-US',
      {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(aNumber / 100);
  }

  // 請求金額の計算
  function totalAmount (data) {
    let result = 0;
    for (let perf of data.perfomances) {
    // 請求金額の計算
      result += amountFor(perf);
    }
    return result;
  }
}

let invoices = JSON.parse(fs.readFileSync('data/invoices.json'));
let plays = JSON.parse(fs.readFileSync('data/plays.json'));

let result = statement(invoices['0'], plays);
console.log(result);
