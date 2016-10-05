geodash.controllers.GeoDashControllerLegend = function($scope, $element, $controller, $timeout)
{
  angular.extend(this, $controller('GeoDashControllerBase', {$element: $element, $scope: $scope}));
  //
  var mainScope = $element.parents(".geodash-dashboard:first").isolateScope();
  $scope.dashboard = geodash.util.deepCopy(mainScope.dashboard);
  $scope.dashboard_flat = geodash.util.deepCopy(mainScope.dashboard_flat);
  $scope.state = geodash.util.deepCopy(mainScope.state);
  $scope.assets = geodash.util.arrayToObject(extract("assets", $scope.dashboard));
  $scope.grid = extract("legend.grid", $scope.dashboard);
  $scope.defaultGrid = [
    "col-sm-3",
    "col-sm-9"
  ];
  //////////////

  $scope.class = function(column)
  {
    if(angular.isNumber(column) && column >= 0)
    {
      return extract([column], $scope.grid, $scope.defaultGrid[column]);
    }
    else
    {
      return "";
    }
  };

  $scope.style = function()
  {
    var styleMap = {};
    var legend = extract("legend", $scope.dashboard);
    if(angular.isDefined(legend))
    {
      angular.extend(styleMap,{
        "top": extract("position.top", legend, 'auto'),
        "bottom": extract("position.bottom", legend, 'auto'),
        "left": extract("position.left", legend, 'auto'),
        "right": extract("position.right", legend, 'auto'),
        "width": extract("width", legend, 'initial'),
        "height": extract("height", legend, 'initial'),
        "padding": "0",
        "margin": "0",
        "background": "transparent",
        "opacity": "1.0"
      });

      /*angular.extend(styleMap, {
        "font-family": extract("text.font.family", overlay, 'Arial'),
        "font-size": extract("text.font.size", overlay, '12px'),
        "font-style": extract("text.font.style", overlay, 'normal'),
        "text-shadow": extract("text.shadow", overlay, 'none')
      });*/

      if(angular.isDefined(extract("css.properties", legend)))
      {
        angular.extend(styleMap, geodash.util.arrayToObject(extract("css.properties", legend)));
      }
    }

    return geodash.codec.formatCSS(styleMap);
  };

  $scope.getLegendType = function(layer, style)
  {
    var styleID = angular.isDefined(style) ? style : 0;

    if(angular.isDefined(extract("wms", layer)))
    {
      return "legendgraphic";
    }
    else if(angular.isDefined(extract("carto", layer)))
    {
      return extract(["carto", "styles", styleID, "legend", "type"], layer, "none");
    }
    else
    {
      return "none";
    }
  };

  $scope.getLegendGraphicStyle = function(layer)
  {
    var styleMap = {};
    if(angular.isDefined(extract("wms", layer)))
    {
      angular.extend(styleMap, {
        "min-width": "40px",
        "max-height": "200px"
      });
      //angular.extend(styleMap, geodash.ui.css.tiledBackground(10, "#555"));
    }
    return styleMap;
  };
  $scope.getCurrentStyle = function(layer)
  {
    var currentStyle = undefined;
    if(angular.isDefined(layer))
    {
      var styleID = 0;
      currentStyle = extract(["carto", "styles", styleID], layer);
    }
    return currentStyle;
  };
  $scope.getLegendGraphicURL = function(layer)
  {
    var url = "";
    var baseurl = extract("wms.url", layer);
    if(angular.isString(baseurl))
    {
      var params = {
        "REQUEST": "GetLegendGraphic",
        "VERSION": extract("wms.version", layer, "1.1.1"),
        "FORMAT": extract("wms.format", layer, "image/png"),
        "LAYER": geodash.codec.formatArray("wms.layers", layer),
        "TRANSPARENT": "true"
      };
      if(angular.isDefined(extract("wms.styles", layer)))
      {
        params["STYLE"] = layer["wms"]["styles"];
      }
      var querystring = $.map(geodash.util.objectToArray(params), function(x){ return x["name"]+"="+x["value"]; });
      url = baseurl+"?"+querystring.join("&");
    }
    return url;
  };
  $scope.getColorRamp = function(layer, style)
  {
    var styleID = angular.isDefined(style) ? style : 0;
    var ramp = undefined;
    if(angular.isDefined(layer))
    {
      var styleID = 0;
      var symbolizers = extract(["carto", "styles", styleID, "symbolizers"], layer, []);
      for(var i = 0; i < symbolizers.length; i++)
      {
        var symbolizer = symbolizers[i];
        if(symbolizer.type == "polygon")
        {
          ramp = extract(["dynamic", "options", "colors", "ramp"], symbolizer);
          if(angular.isDefined(ramp))
          {
            break;
          }
        }
      }
    }
    return ramp;
  };

  $scope.updateVariables = function()
  {

    //if("baselayers" in $scope.dashboard && $scope.dashboard.baselayers != undefined)
    if(Array.isArray(extract("baselayers", $scope.dashboard)))
    {
      //var baselayers = $.grep($scope.dashboard.baselayers,function(x, i){ return $.inArray(x["id"], arrayFilter) != -1; });
      //baselayers.sort(function(a, b){ return $.inArray(a["id"], arrayFilter) - $.inArray(b["id"], arrayFilter); });
      $scope.baselayers = $scope.dashboard.baselayers;
    }
    else
    {
      $scope.baselayers = [];
    }

    if(Array.isArray(extract("featurelayers", $scope.dashboard)))
    {
      //var featurelayers = $.map($scope.dashboard.featurelayers, function(item, key){ return {'key': key, 'item': item}; });
      //var featurelayers = $.grep($scope.dashboard.featurelayers,function(x, i){ return $.inArray(x["id"], arrayFilter) != -1; });
      //featurelayers.sort(function(a, b){ return $.inArray(a["id"], arrayFilter) - $.inArray(b["id"], arrayFilter); });
      //$scope.featurelayers = featurelayers;
      $scope.featurelayers = $scope.dashboard.featurelayers;
      if(angular.isDefined(extract("state.view.featurelayers", $scope)))
      {
        var visibleFeaturelayers = $.grep($scope.featurelayers,function(x, i){
          return $.inArray(x["id"], $scope.state.view.featurelayers) != -1;
        });
        visibleFeaturelayers.sort(function(a, b){ return $.inArray(a["id"], $scope.state.view.featurelayers) - $.inArray(b["id"], $scope.state.view.featurelayers); });
        $scope.visibleFeaturelayers = visibleFeaturelayers;
      }
      else
      {
        $scope.visibleFeaturelayers = [];
      }
    }
    else
    {
      $scope.featurelayers = [];
      $scope.visibleFeaturelayers = [];
    }

  };
  $scope.updateVariables();
  //$scope.$watch('dashboard.featurelayers', $scope.updateVariables);
  //$scope.$watch('dashboard.legendlayers', $scope.updateVariables);
  $scope.$watch('state', $scope.updateVariables);
  //////////////
  var jqe = $($element);

  $scope.$on("refreshMap", function(event, args)
  {
    console.log('args: ', args);

    if(geodash.util.diff(["view.featurelayers", "view.baselayer"], $scope.state, args.state).length > 0)
    {
      $scope.state = undefined;
      $scope.newState = geodash.util.deepCopy(args.state);
      $scope.updateVariables();

      setTimeout(function(){
        $scope.$apply(function(){
          $scope.state = $scope.newState;
          $scope.updateVariables();
        });
      },0);
    }
    else
    {
      $scope.state = geodash.util.deepCopy(args.state);
      $scope.updateVariables();
    }

  });
};
