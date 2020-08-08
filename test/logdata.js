let x = 1;
const data = []
// for (let i = 2; i < 100; ++i) {
//   data.push({
//     year: i,
//     value: 1/(Math.log(i) / Math.log(2))
//   })
// }

for (let i = 10000; i <=200000 ; i=i*1.1) {
  data.push({
    year: i,
    value: 100 * 1 / ((i / 10) + 1) / 1.1

  })
}
console.log(JSON.stringify(data));

