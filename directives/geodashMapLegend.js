geodash.directives.geodashMapLegend = function(){
  return {
    controller: geodash.controllers.GeoDashControllerLegend,
    restrict: 'EA',
    replace: true,
    scope: {},
    templateUrl: 'map_legend.tpl.html',
    link: function ($scope, element, attrs, controllers)
    {
      setTimeout(function(){ geodash.ui.update(element); }, 0);
    }
  };
};
