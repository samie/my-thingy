$0.init = function() {

  var aThing = new Thingy52();
  var lastTime  = 0;


  var eventProxy = (event) => {
      $0.dispatchEvent(new CustomEvent(event.type,{ detail: event.detail }));
  };

  var eventProxy500ms = (event) => {
    if (Date.now() - lastTime  >= 500) {
      $0.dispatchEvent(new CustomEvent(event.type,{ detail: event.detail }));
      lastTime = Date.now();
    }
  };


  aThing.addEventListener('thingy52_battery',eventProxy);
  aThing.addEventListener('thingy52_temperature',eventProxy);
  aThing.addEventListener('thingy52_button',eventProxy);
  aThing.addEventListener('thingy52_accelerometer',eventProxy500ms);

  $0.scan = function () { return aThing.scan(); };
  $0.connect = function (a) { return aThing.connect(a); };
  $0.disconnect = function () { return aThing.disconnect(); };
  $0.beep = function (a,b,c) { return aThing.beep(a,b,c); };
  $0.setLED = function (a,b,c) { return aThing.setLED(a,b,c); };
  $0.setLEDBreathe = function (a,b,c) { return aThing.setLEDBreathe(a,b,c); };
  $0.setLEDFlashOnce = function (a,b) { return aThing.setLEDFlashOnce(a,b); };
  $0.setLEDOff = function () { return aThing.setLEDOff(); };

};

$0.init();
