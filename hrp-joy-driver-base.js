/**
 * hrp-joy-driver
 *
 * Driver Base
 *
 * This should be a common implementation for all drivers.
 * Copy the template and modify to match your joystick needs
 *
 * Author: Andrés Manelli
 * andresmanelli@gmail.com
 * 
 * Asociación de Mecatrónica de Mendoza
 * 
 */

'use strict';

var joyDriver = function(path){

  var HID = require('node-hid');
  var Promise = require('es6-promise').Promise;
  var colors = require('colors');
  var StateMachine = require("javascript-state-machine");
  var zmq = require('zmq');

  // Colors config
  colors.setTheme({
    input: 'blue',
    verbose: 'cyan',
    prompt: 'white',
    explain: 'white',
    info: 'green',
    data: 'yellow',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
  });

  var driver = {};
  
  driver.path = path;
  driver.port = 7777;

  // Init lastCmd for the virtual joystick. Just in case..
  driver.lastCmd = ['MN',[]];
  
  driver.fsm = StateMachine.create({
    initial: 'idle',
    events: [
      {name: 'read',           from: 'idle',     to: 'reading'},
      {name: 'gotInfo',       from: 'reading',  to: 'idle'},
      {name: 'checkConnection',       from: 'idle',  to: 'writing'},
      {name: 'okConnection',       from: 'writing',  to: 'idle'}
    ]
  });

  driver.setVirtual = function(virtual){
    driver.virtual = virtual;
  }

  driver.connect = function(){
    if(driver.virtual){
      if(driver.sock){
        console.log('deleting: ',delete driver.sock);
      }
      driver.sock = zmq.socket('sub'); //To Web Server
      driver.sock.connect('tcp://127.0.0.1:'+driver.port);
      driver.sock.subscribe('joyCmd');
      driver.sock.on('message',function(topic,data){
        driver.decode(data.toString());
      });
      return true;
    }else{
      try{
        driver.joy = new HID.HID(driver.path);
        return true;
      }catch(err){       
        console.log(colors.warn('Joystick Driver (',driver.path,') not a HID device'));
        return false;
      }
    }
  };
  
  driver.disconnect = function(){
    if(driver.virtual){
      if(driver.sock){
        driver.sock.unsubscribe('joyCmd');
        driver.sock.disconnect('tcp://127.0.0.1:'+driver.port);
        console.log('deleting: ',delete driver.sock);
        return true;
      }
    }else{
      if(driver.joy){
        driver.joy.close();
        return true;
      }
    }
  };

  // Used by the wait timeout
  driver.resolve = function(){};
  // Used by the wait timeout
  driver.resolveData = '';
  // Used by the wait timeout
  driver.avoidBlock = null;

  var wait = function(){
    driver.avoidBlock = setTimeout(function(){
      driver.resolve(driver.resolveData);
    }, 1000);
  };

  // Used to avoid repeating commands if joystick sends nothing
  driver.clearCmd = function(){
    return setTimeout(function(){
      driver.lastCmd = ['MN',[]];
    },1000);
  };

  // Used to avoid clearing last command if another one is received
  driver.cancelClearCmd = null;

  //Only used to check connection in virtual driver
  driver.write = function(msg){

    if(driver.fsm.current !== 'idle'){
      return Promise.reject();
    }

    driver.fsm.checkConnection();

    return new Promise(function(resolve,reject){
      if(driver.virtual){
        if(driver.sock){
          driver.sock.send(msg);
          return Promise.resolve();
        }else{
          console.log(colors.warn('Joystick not connected. Rejecting'));
          return Promise.reject();
        }
      }else{
        console.log(colors.warn('Tryed to write physical joystick. Rejecting'));
        return Promise.reject();
      }
    });
  };

  driver.read = function(){
    
    if(driver.fsm.current !== 'idle'){
      return Promise.reject();
    }

    driver.fsm.read();
    
    return new Promise(function(resolve,reject){

      // Global data for the timeout
      driver.resolve = resolve;
      driver.resolveData = false;
      wait();
      
      if(!driver.virtual){
        driver.joy.read(function(err,data){
          clearTimeout(driver.avoidBlock);
          if(err){
            console.log(colors.error('Error reading joystick... (%s)'),driver.device);
            reject();
          }else{
            var cmd = driver.decode(data);
            driver.fsm.gotInfo();
            resolve([cmd[0],cmd[1]]);
          }
        });
      }else{
        driver.fsm.gotInfo();
        resolve([driver.lastCmd[0],driver.lastCmd[1]]);
      }
    });
  };
  
  // Set in JoystickDriverTemplate
  // driver.decode = function(data){/* ... */}
  
  return driver;
};
          
module.exports = joyDriver;
