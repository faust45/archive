function() {
        var doc = {
          name : "coool",
          type : "greeting",
          author : "faust45",
          created_at : new Date()
        };

        app.db.saveDoc(doc, {
          success: function(d) {
            var form = $("#cool");

            form.find("#progress").css("visibility", "visible");
            $("input[name='_rev']", form).val(d['rev'])

            form.ajaxSubmit({
              url: app.db.uri + $.couch.encodeDocId(d['id']),
              success: function(resp) {
                form.find("#progress").css("visibility", "hidden");
                $("input[name='_attachments']", form).val('') 
              }
            });
          }
        });

        return false;
}
