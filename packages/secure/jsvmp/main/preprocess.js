'use strict';

function secure2() {
  console.log('secure2');
}
function secure() {
  console.log('secure');
}
secure();
secure2();
exports.secure = secure;
exports.secure2 = secure2;