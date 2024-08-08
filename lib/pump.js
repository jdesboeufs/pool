import {execRawCommand} from './devices.js';

async function dispense(quantity) {
  await execRawCommand('pump', `D,${quantity.toFixed(0)}`, 300);
}
