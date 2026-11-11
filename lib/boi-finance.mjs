const amount=(x,name)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<0||x>1e12)throw Error('INVALID_'+name);return x;};
const round=x=>{if(!Number.isFinite(x)||Math.abs(x)>1e12)throw Error('RESULT_OUT_OF_RANGE');return Math.round(x*100)/100;};
export function fundingGap({equipment,contribution,request,otherCosts=0}) {
 for(const [k,v] of Object.entries({equipment,contribution,request,otherCosts}))amount(v,k);
 const total=round(equipment+otherCosts),gap=round(Math.max(0,total-contribution));
 return {total,gap,difference:round(request-gap),excessContribution:round(Math.max(0,contribution-total)),classification:request===gap?'ANSWER':'CLARIFY',assumption:'Contribution is committed to this purchase; all amounts refer to the same project. No eligibility conclusion.'};
}
export function cashFlow({units,price,variableCost,fixedCosts,openingCash=0,monthlyDebt=0,months=3}) {
 for(const [k,v] of Object.entries({units,price,variableCost,fixedCosts,openingCash,monthlyDebt}))amount(v,k);
 if(!Number.isInteger(months)||months<1||months>12)throw Error('INVALID_MONTHS');
 const sales=round(units*price),operatingCosts=round(units*variableCost+fixedCosts),net=round(sales-operatingCosts-monthlyDebt);
 let cash=openingCash;
 const rows=Array.from({length:months},(_,i)=>{const opening=cash;cash=round(cash+net);return {month:i+1,opening,sales,operatingCosts,debtPayment:monthlyDebt,net,closing:cash};});
 return {rows,minimumCash:Math.min(openingCash,...rows.map(x=>x.closing)),cashShortfall:round(Math.max(0,-Math.min(...rows.map(x=>x.closing)))),notice:'Illustration only: cash sales collected in the same month, constant volumes/costs, no tax, inventory timing, capex or financing proceeds. Net cash is not accounting profit.'};
}
export function repaymentIllustration({principal,annualRate,months}) {
 amount(principal,'PRINCIPAL');
 if(!Number.isFinite(annualRate)||annualRate<0||annualRate>1||!Number.isInteger(months)||months<1||months>120)throw Error('INVALID_REPAYMENT');
 const r=annualRate/12;
 const payment=r===0?principal/months:principal*r/(1-Math.pow(1+r,-months));
 return {monthlyPayment:round(payment),totalPayments:round(payment*months),interest:round(payment*months-principal),notice:'Reducing-balance, equal monthly payments, no fees or moratorium. Not a BOI offer or repayment schedule.'};
}
