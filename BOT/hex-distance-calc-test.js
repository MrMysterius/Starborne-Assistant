function distance(xa, xb, ya, yb) {
    return (Math.abs(xa - ya) + Math.abs(xa + xb - ya - yb) + Math.abs(xb - yb))/2;
}

var test = distance(-175,-266,-167,-278);
test = 34
console.log(test);
// test *= 0.18;
console.log(test);
var oneHexSpeed = 60/15;
console.log(oneHexSpeed);
console.log(60/(18/3600));
console.log('crack',test*(60/(15/3600)));
test *= oneHexSpeed;
console.log(test);
console.log(test/60);