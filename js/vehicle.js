var Vehicle = (function (v) {


  var initializePlugins = function () {
    $('.valor').livequery(function (){
        $(this).maskMoney({symbol:'R$ ',
          showSymbol:true, thousands:'.', decimal:',', symbolStay: true
        });
    });
    $('.info').tooltip({"show": 700,"hide": 50});
  };

  var initialize = function () {
    initializePlugins();
  };

  return {
    initialize: initialize
  }

}(Vehicle));
$(document).ready(Vehicle.initialize());
