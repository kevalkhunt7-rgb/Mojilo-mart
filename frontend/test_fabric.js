import * as fabric from 'fabric';

console.log('Fabric keys:', Object.keys(fabric || {}));
console.log('fabric.util keys:', Object.keys(fabric.util || {}));
if (fabric.util && fabric.util.enlivenObjects) {
  console.log('enlivenObjects exists!');
  console.log('enlivenObjects toString:', fabric.util.enlivenObjects.toString().substring(0, 300));
} else {
  console.log('enlivenObjects does not exist directly on fabric.util');
}
if (fabric.enlivenObjects) {
  console.log('enlivenObjects exists on root fabric!');
}
