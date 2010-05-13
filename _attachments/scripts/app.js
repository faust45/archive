// $.couch.app() loads the design document from the server and 
// then calls our application.
$.couch.app(function(app) {  
    $("#start_upload").evently(app.ddoc.evently.start_upload, app);
    $("#file_list").evently(app.ddoc.evently.file_list, app);

    //$("#upload").evently({
    //  _init : {
    //    mustache : "<p>Hello world</p>",

        //async : function(cb) {
        //  app.db.openDoc("", {
        //    success: function(doc) {
        //      cb(doc);
        //    }
        //  });
        //},

        //data: function(doc) {
        //  return {
        //    doc: doc,
        //    author: 
        //  };
        //},
    //  },

    //     });
  // An evently widget that displays a tag cloud which is updated when 
  // the underlying data changes. The code for this widget is stored 
  // in the evently/tagcloud directory.
  //$("#tagcloud").evently("tagcloud", app);
  
  // this is the same thing, but for a cloud of usernames
  //$("#usercloud").evently("usercloud", app);
  
  // we customize the profile widget in our evently directory but also 
  // we use code from vendor/couchapp/evently
  // evently knows about this and it just works.
  //$("#profile").evently("profile", app);
  
  // setup the account widget
  //$("#account").evently("account", app);  
  
  // trigger the profile widget's events corresponding to the account widget
  //$.evently.connect($("#account"), $("#profile"), ["loggedIn", "loggedOut"]);
  
  // now set up the main list of tasks
  //var tasks = app.ddoc.evently.tasks;
  // todo make a declarative trigger for this pattern
  //tasks.tags = $.extend(true, {}, tasks.recent, tasks.tags);
  //tasks.mentions = $.extend(true, {}, tasks.recent, tasks.mentions);
  //tasks.users = $.extend(true, {}, tasks.recent, tasks.users);
  
  $.log('Start app')
  //$("#account").evently(app.ddoc.vendor.couchapp.evently.account, app);
  //$("#profile").evently("profile", app);  
  //$.evently.connect($("#account"), $("#profile"), ["loggedIn", "loggedOut"]);
      
  //$("#tasks").evently(tasks, app);
  //$.pathbinder.onChange(function(path) {
  //  $("#current-path").text(path);
  //});
  //$.pathbinder.begin("/");
});
