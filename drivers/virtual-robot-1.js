/**
 * Virtual Joystick Driver 1
 *
 */

'use strict';

var MyDriver = function(path){

  var driver = require('hrp-joy-driver/hrp-joy-driver-base.js')(path);
  console.log('init joydriver');
  driver.setVirtual(true);

  driver.decode = function(data){
    var cmd = ['MN',[]];
    clearTimeout(driver.cancelClearCmd);
    
    if(driver.virtual){
      // Analyze data and store cmd in driver.lastCmd
      cmd = data = data.split(':');
      cmd.pop();
      cmd.shift();
      driver.lastCmd = [cmd[0],cmd.slice(1)];
      driver.cancelClearCmd = driver.clearCmd();
      return cmd;
    }else{
      // Analyze data and return cmd
      return cmd;
    }
  }
  
  return driver;
};
          
module.exports = MyDriver;