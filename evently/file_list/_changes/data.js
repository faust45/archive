function(resp) {
    var v = resp.value;
    var file_name = '';
    var app = $$(this).app;

    for(file in v['_attachments']) {
      file_name = file;
    };

    return {
      db_name: app.db.name,
      id: v['_id'],
      file_name: file_name,
    };
}
