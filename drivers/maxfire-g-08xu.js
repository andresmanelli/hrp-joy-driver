/**
 * Genius MaxFire G-08XU Driver
 *
 * Author: Andrés Manelli
 * email: andresmanelli@gmail.com
 *
 * Asociación de Mecatrónica de Mendoza
 */

'use strict';

var MyDriver = function(path){
  
  var driver = require('hrp-joy-driver/hrp-joy-driver-base.js')(path);
  
  driver.decode = function(data){
    var cmd = ['MN',[]];
    clearTimeout(driver.cancelClearCmd);
    
    if(driver.virtual){
      // Analyze data and store cmd in driver.lastCmd
      driver.lastCmd = cmd;
      driver.cancelClearCmd = driver.clearCmd();
      return cmd;
    }else{
      // Analyze data and return cmd
      if (data[0] == 0)
        cmd = ['M3',[0,-1,0]];
      else if (data[0] == 255)
        cmd = ['M3',[0,1,0]];
      else if (data[1] == 0)
        cmd = ['M3',[0,0,1]];
      else if (data[1] == 255)
        cmd = ['M3',[0,0,-1]];
      else if (data[2] == 1)
        cmd = ['M3',[1,0,0]];
      else if (data[2] == 4)
        cmd = ['M3',[-1,0,0]];

      return cmd;
    }
  }
  
  return driver;
};
          
module.exports = MyDriver;
