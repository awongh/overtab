var service, tracker;

function initAnalyticsConfig(config) {
  //do options stuff here

  lsGet( "analytics", function( result ){
    var permitted = ( result ) ? true : false;

    config.setTrackingPermitted(permitted);
  });
}

function analyticsEvent( viewName ) {
  // Initialize the Analytics service object with the name of your app.
  service = analytics.getService('overtab.com');
  service.getConfig().addCallback(initAnalyticsConfig);

  // Get a Tracker using your Google Analytics app Tracking ID.
  tracker = service.getTracker('UA-51085352-1');

  // Record an "appView" each time the user launches your app or goes to a new
  // screen within the app.
  tracker.sendAppView(viewName);
}
