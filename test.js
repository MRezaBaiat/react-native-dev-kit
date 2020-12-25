const moment = require('jalali-moment');

console.log(moment())
console.log(moment().format('DD'))
console.log(moment().format('MM'))
console.log(moment().format('YYYY'))

console.log(moment().locale('fa').format('DD'))
console.log(moment().locale('fa').format('MM'))
console.log(moment().locale('fa').format('YYYY'))
