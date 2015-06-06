/**
 * Driver Template
 *
 */

'use strict';

var myJoyDriver = function(path){

  var driver = require('hrp-joy-drver/hrp-joy-driver-base.js')(path);
  
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
      return cmd;
    }
  }
  
  return driver;
};
          
module.exports = myJoyDriver;
